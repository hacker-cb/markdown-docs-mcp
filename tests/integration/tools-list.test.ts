// tests/integration/tools-list.test.ts
// Verifies tools/list returns exactly 4 tools with correct names, descriptions, and schemas.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

const EXPECTED_TOOLS = ["analyze_document", "read_section", "search", "view_toc"];

describe("tools/list", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "test-client", version: "0.0.1" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client?.close();
  });

  it("returns exactly 4 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(4);
  });

  it("tool names match the expected set", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(EXPECTED_TOOLS);
  });

  it("each tool has description longer than 200 chars", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(
        tool.description?.length,
        `${tool.name} description too short`
      ).toBeGreaterThan(200);
    }
  });

  it("each tool inputSchema is an object with file_path property", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.inputSchema.type, `${tool.name} inputSchema.type`).toBe("object");
      expect(
        tool.inputSchema.properties,
        `${tool.name} missing properties`
      ).toBeDefined();
      expect(
        Object.keys(tool.inputSchema.properties ?? {}),
        `${tool.name} missing file_path`
      ).toContain("file_path");
    }
  });

  it("all four tools carry the anthropic/maxResultSizeChars annotation", async () => {
    // Claude Code v2.1.91+ reads this _meta field to lift its truncation cap.
    // We set 200_000 on every tool for symmetry — analyze_document already hits
    // ~27 KB on real PDF-converted documents, and search responses, while
    // usually small, have no hard cap. Setting uniformly avoids surprise
    // truncation on the smaller-but-still-substantial responses.
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(
        tool._meta?.["anthropic/maxResultSizeChars"],
        `${tool.name} missing maxResultSizeChars annotation`
      ).toBe(200_000);
    }
  });
});
