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

  it("view_toc and read_section carry anthropic/maxResultSizeChars annotation", async () => {
    // Claude Code v2.1.91+ reads this _meta field to lift its truncation cap.
    // 200_000 chars comfortably covers our 50/200 KB byte caps plus UTF-8 expansion.
    const { tools } = await client.listTools();
    const byName = Object.fromEntries(tools.map((t) => [t.name, t]));

    const viewToc = byName["view_toc"];
    const readSection = byName["read_section"];

    expect(viewToc?._meta?.["anthropic/maxResultSizeChars"]).toBe(200_000);
    expect(readSection?._meta?.["anthropic/maxResultSizeChars"]).toBe(200_000);
  });

  it("search and analyze_document do not carry the maxResultSizeChars annotation", async () => {
    // Their responses are inherently small (results capped at ~50 hits / per-anomaly
    // structured records), so we don't request a lifted cap. Verifying absence
    // documents the deliberate choice — flipping it later is a behaviour change.
    const { tools } = await client.listTools();
    const byName = Object.fromEntries(tools.map((t) => [t.name, t]));

    expect(byName["search"]?._meta?.["anthropic/maxResultSizeChars"]).toBeUndefined();
    expect(
      byName["analyze_document"]?._meta?.["anthropic/maxResultSizeChars"]
    ).toBeUndefined();
  });
});
