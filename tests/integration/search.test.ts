// tests/integration/search.test.ts
// End-to-end integration tests for the search tool on real public fixtures.
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchHit {
  line: number;
  snippet: string;
  matched_text: string;
  section: {
    id: string;
    title: string;
    level: number;
    numbering: string | null;
  };
  in: "title" | "content";
}

interface SearchResponse {
  hits: SearchHit[];
  total_matches: number;
  truncated: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Shared client + server — reuse the same index cache across tests for speed.
let sharedClient: Client | undefined;
let sharedClose: (() => Promise<void>) | undefined;
const allClients: Array<() => Promise<void>> = [];

async function getSharedClient(): Promise<Client> {
  if (sharedClient) return sharedClient;
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = createServer({ cache: new IndexCache() });
  const client = new Client({ name: "search-test", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  sharedClient = client;
  sharedClose = () => client.close();
  allClients.push(sharedClose);
  return client;
}

function parseResponse(result: unknown): SearchResponse {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text) as SearchResponse;
}

async function search(
  filePath: string,
  args: Record<string, unknown>
): Promise<{ result: unknown; parsed: SearchResponse }> {
  const client = await getSharedClient();
  const result = await client.callTool({
    name: "search",
    arguments: { file_path: filePath, ...args },
  });
  return { result, parsed: parseResponse(result) };
}

afterAll(async () => {
  for (const close of allClients) await close();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("search integration", () => {
  // -------------------------------------------------------------------------
  // Test 1: Literal search "DMA" on STM32 — hits in titles and content
  // -------------------------------------------------------------------------
  it(
    "STM32: literal 'DMA' returns hits in both titles and content",
    async () => {
      const { result, parsed } = await search(STM32, { query: "DMA" });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.total_matches).toBeGreaterThan(0);

      const titleHits = parsed.hits.filter((h) => h.in === "title");
      const contentHits = parsed.hits.filter((h) => h.in === "content");

      // STM32 has several headers containing "DMA"
      expect(titleHits.length).toBeGreaterThan(0);
      // And many body lines referencing DMA
      expect(contentHits.length).toBeGreaterThan(0);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 2: Regex with whole-word boundary \bDMA\b on STM32
  // -------------------------------------------------------------------------
  it(
    "STM32: regex '\\bDMA\\b' (whole-word) returns hits",
    async () => {
      const { result, parsed } = await search(STM32, {
        query: "\\bDMA\\b",
        regex: true,
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBeGreaterThan(0);
      // All matched_text should be exactly "DMA"
      for (const hit of parsed.hits) {
        expect(hit.matched_text).toBe("DMA");
      }
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 3: scope="titles" — only title hits returned
  // -------------------------------------------------------------------------
  it(
    "STM32: scope=titles returns only title hits for 'DMA'",
    async () => {
      const { result, parsed } = await search(STM32, {
        query: "DMA",
        scope: "titles",
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBeGreaterThan(0);
      for (const hit of parsed.hits) {
        expect(hit.in).toBe("title");
      }
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 4: scope="content" — only content hits returned
  // -------------------------------------------------------------------------
  it(
    "STM32: scope=content returns only content hits for 'DMA'",
    async () => {
      const { result, parsed } = await search(STM32, {
        query: "DMA",
        scope: "content",
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBeGreaterThan(0);
      for (const hit of parsed.hits) {
        expect(hit.in).toBe("content");
      }
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 5: case_sensitive=true on a verbatim string
  // -------------------------------------------------------------------------
  it(
    "STM32: case_sensitive=true finds 'DMA' but not 'dma'",
    async () => {
      const { result: r1, parsed: p1 } = await search(STM32, {
        query: "DMA",
        case_sensitive: true,
        scope: "content",
      });
      const { result: r2, parsed: p2 } = await search(STM32, {
        query: "dma",
        case_sensitive: true,
        scope: "content",
      });

      expect((r1 as { isError?: boolean }).isError).toBeFalsy();
      expect((r2 as { isError?: boolean }).isError).toBeFalsy();

      // "DMA" in uppercase exists in content
      expect(p1.hits.length).toBeGreaterThan(0);
      // "dma" lowercase does not appear in content (STM32 uses uppercase)
      expect(p2.hits.length).toBe(0);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 6: include_comments=false on ESP32: "PDF_PAGE_BEGIN" → 0 hits
  // -------------------------------------------------------------------------
  it(
    "ESP32: include_comments=false — 'PDF_PAGE_BEGIN' returns 0 hits",
    async () => {
      const { result, parsed } = await search(ESP32, {
        query: "PDF_PAGE_BEGIN",
        scope: "content",
        include_comments: false,
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBe(0);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 7: include_comments=true on ESP32: "PDF_PAGE_BEGIN" → many hits
  // -------------------------------------------------------------------------
  it(
    "ESP32: include_comments=true — 'PDF_PAGE_BEGIN' returns many hits",
    async () => {
      const { result, parsed } = await search(ESP32, {
        query: "PDF_PAGE_BEGIN",
        scope: "content",
        include_comments: true,
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      // ESP32 has 93 occurrences of PDF_PAGE_BEGIN, capped at default max_results=50
      expect(parsed.hits.length).toBeGreaterThan(10);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 8: max_results=5 → truncated=true, hits.length=5
  // -------------------------------------------------------------------------
  it(
    "STM32: max_results=5 on popular term → truncated=true, 5 hits",
    async () => {
      const { result, parsed } = await search(STM32, {
        query: "DMA",
        max_results: 5,
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBe(5);
      expect(parsed.truncated).toBe(true);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 9: section field correctness
  // -------------------------------------------------------------------------
  it(
    "STM32: hit section field has correct id format and non-empty title",
    async () => {
      const { result, parsed } = await search(STM32, {
        query: "DMA",
        scope: "content",
        max_results: 10,
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.hits.length).toBeGreaterThan(0);

      for (const hit of parsed.hits) {
        // section id should either be "" (preamble) or match "s<number>"
        expect(hit.section.id).toMatch(/^(s\d+|)$/);
        // title is always non-empty string
        expect(hit.section.title.length).toBeGreaterThan(0);
        // level is 0..6
        expect(hit.section.level).toBeGreaterThanOrEqual(0);
        expect(hit.section.level).toBeLessThanOrEqual(6);
      }
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 10: Invalid regex → isError === true
  // -------------------------------------------------------------------------
  it(
    "invalid regex returns MCP error (isError=true)",
    async () => {
      const client = await getSharedClient();
      const result = await client.callTool({
        name: "search",
        arguments: {
          file_path: STM32,
          query: "[unclosed bracket",
          regex: true,
        },
      });

      expect((result as { isError?: boolean }).isError).toBe(true);
    },
    30000
  );
});
