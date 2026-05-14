// tests/integration/tools-call-stub.test.ts
// Verifies that stub tools return an error response (not_implemented) when called.
// view_toc is now real (implemented in PR-04) and is NOT in this list.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

// Minimal valid args for each stub tool (satisfying required Zod fields).
// read_section is now implemented (PR-05); only search and analyze_document remain as stubs.
const TOOL_ARGS: Record<string, Record<string, unknown>> = {
  search: { file_path: "/tmp/test.md", query: "hello" },
  analyze_document: { file_path: "/tmp/test.md" },
};

describe("tools/call stubs", () => {
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

  for (const toolName of Object.keys(TOOL_ARGS)) {
    it(`${toolName} returns an error result`, async () => {
      const result = await client.callTool({
        name: toolName,
        arguments: TOOL_ARGS[toolName],
      });

      // SDK wraps thrown errors as { isError: true, content: [{ type: "text", text: "..." }] }
      expect(result.isError, `${toolName} should set isError`).toBe(true);

      const texts = (result.content as Array<{ type: string; text?: string }>)
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "");

      const combinedText = texts.join(" ").toLowerCase();
      expect(
        combinedText.includes("not") || combinedText.includes("implement"),
        `${toolName} error text should mention "not implemented", got: ${combinedText}`
      ).toBe(true);
    });
  }
});
