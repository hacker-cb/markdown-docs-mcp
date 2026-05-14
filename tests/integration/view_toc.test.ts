// tests/integration/view_toc.test.ts
// End-to-end integration tests for the view_toc tool on real public fixtures.
// Uses InMemoryTransport + createServer({ cache }) for a full MCP round-trip.

import { describe, it, expect, afterAll } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { IndexCache } from "../../src/index/cache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ESP32 = resolve(__dirname, "../fixtures/public/esp32-p4-datasheet.md");
const STM32 = resolve(__dirname, "../fixtures/public/stm32h750ib.md");

interface TocNode {
  id: string;
  level: number;
  title: string;
  children: TocNode[];
  is_likely_artifact: boolean;
}

interface ViewTocResponse {
  file: { path: string; size_bytes: number; line_count: number; mtime: string };
  toc: TocNode[];
  anomalies_summary: {
    total: number;
    by_type: Record<string, number>;
    hint?: string;
  };
}

async function makeClient(): Promise<{
  client: Client;
  close: () => Promise<void>;
}> {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = createServer({ cache: new IndexCache() });
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  return { client, close: () => client.close() };
}

function parseToc(result: unknown): ViewTocResponse {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text) as ViewTocResponse;
}

describe("view_toc integration", () => {
  const openClients: Array<{ close: () => Promise<void> }> = [];

  afterAll(async () => {
    for (const c of openClients) await c.close();
  });

  it(
    "ESP32-P4 datasheet: many self-nesting anomalies (>= 20)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });
      const result = await client.callTool({
        name: "view_toc",
        arguments: { file_path: ESP32 },
      });
      const parsed = parseToc(result);
      expect(parsed.anomalies_summary.by_type["self_nesting_header"]).toBeGreaterThanOrEqual(20);
      expect(parsed.anomalies_summary.hint).toContain("analyze_document");
      expect(parsed.toc.length).toBeGreaterThan(0);
    },
    30000
  );

  it(
    "STM32H750IB datasheet: clean hierarchy, 0 self_nesting anomalies",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });
      const result = await client.callTool({
        name: "view_toc",
        arguments: { file_path: STM32 },
      });
      const parsed = parseToc(result);
      expect(parsed.anomalies_summary.by_type["self_nesting_header"] ?? 0).toBe(0);
    },
    60000
  );

  it(
    "respects depth=1 (only roots, all children arrays empty)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });
      const result = await client.callTool({
        name: "view_toc",
        arguments: { file_path: STM32, depth: 1 },
      });
      const parsed = parseToc(result);
      for (const node of parsed.toc) {
        expect(node.children).toEqual([]);
      }
    },
    60000
  );

  it(
    "raw=true returns flat list and 0 anomalies",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });
      const result = await client.callTool({
        name: "view_toc",
        arguments: { file_path: ESP32, raw: true },
      });
      const parsed = parseToc(result);
      expect(parsed.anomalies_summary.total).toBe(0);
      for (const node of parsed.toc) {
        expect(node.children).toEqual([]);
      }
    },
    30000
  );

  it("invalid file_path causes tool error", async () => {
    const { client, close } = await makeClient();
    openClients.push({ close });
    const result = await client.callTool({
      name: "view_toc",
      arguments: { file_path: "/no/such/file.md" },
    });
    expect((result as { isError?: boolean }).isError).toBe(true);
  });
});
