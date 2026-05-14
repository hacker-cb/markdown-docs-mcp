// tests/integration/mcp-handshake.test.ts
// Verifies that the MCP server completes initialization and advertises tools capability.

import { describe, it, expect, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("MCP handshake", () => {
  let client: Client;

  afterEach(async () => {
    await client?.close();
  });

  it("connects and reports tools capability", async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client({ name: "test-client", version: "0.0.1" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const caps = client.getServerCapabilities();
    expect(caps).toBeDefined();
    expect(caps?.tools).toBeDefined();
  });
});
