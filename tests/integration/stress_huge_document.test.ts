// tests/integration/stress_huge_document.test.ts
// Stress tests on the ESP32-P4 Technical Reference Manual (143k lines, ~5.2 MB).
// Validates view_toc size cap, start_id drill-down, consecutive_pair_header
// detection, and the line-coverage invariant on a real-world huge document.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { IndexCache } from "../../src/index/cache.js";
import type { TocNode } from "../../src/index/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRM = resolve(__dirname, "../fixtures/public/esp32-p4-trm.md");

// Shared state: one cache + one client for the whole suite.
// This ensures the TRM is indexed only once across all four tests.
let sharedCache: IndexCache;
let sharedClient: Client;

// Force a small view_toc cap so the depth-reduction loop actually fires on the
// TRM: with the production default (50 KB) the compact JSON of a depth=6 tree
// already fits without trimming on this fixture, and we would lose coverage of
// truncated/effective_depth/hint output.
const STRESS_CAP_BYTES = 5 * 1024;

beforeAll(
  async () => {
    sharedCache = new IndexCache();
    // Pre-warm the cache before any test runs
    await sharedCache.getOrBuild(TRM);

    const [ct, st] = InMemoryTransport.createLinkedPair();
    const server = createServer({
      cache: sharedCache,
      config: { maxViewTocBytes: STRESS_CAP_BYTES, maxSectionBytes: 200 * 1024 },
    });
    sharedClient = new Client({ name: "stress-test", version: "0" });
    await Promise.all([server.connect(st), sharedClient.connect(ct)]);
  },
  // Cold-start indexing of the 5.2 MB TRM should take well under 1 s
  // post-perf-optimization. 60 s gives ~30x headroom for slow CI runners,
  // GC pauses, and I/O jitter.
  60_000
);

afterAll(async () => {
  await sharedClient.close();
});

function parse(result: unknown): Record<string, unknown> {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text) as Record<string, unknown>;
}

describe("stress: huge document (ESP32-P4 TRM)", () => {
  it(
    "view_toc fits under cap with truncated=true on the full TRM",
    async () => {
      const result = await sharedClient.callTool({
        name: "view_toc",
        arguments: { file_path: TRM },
      });
      const parsed = parse(result);

      const jsonBytes = Buffer.byteLength(JSON.stringify(parsed), "utf8");
      expect(jsonBytes).toBeLessThanOrEqual(STRESS_CAP_BYTES);
      expect(parsed["truncated"]).toBe(true);
      expect(parsed["effective_depth"]).toBeDefined();
      expect(typeof parsed["hint"]).toBe("string");
      expect(parsed["hint"] as string).toMatch(/start_id|depth/i);
      // TRM has many h1 chapters with children — at least some top-level nodes
      // must carry has_children=true when the depth cap trimmed their subtrees.
      const toc = parsed["toc"] as Array<Record<string, unknown>>;
      expect(toc.some((n) => n["has_children"] === true)).toBe(true);
    },
    30_000
  );

  it(
    "view_toc(start_id=<root child>) returns the subtree",
    async () => {
      // First call: get the root TOC
      const root = parse(
        await sharedClient.callTool({
          name: "view_toc",
          arguments: { file_path: TRM },
        })
      );

      const toc = root["toc"] as Array<Record<string, unknown>>;
      const firstId = toc[0]?.["id"] as string | undefined;
      expect(firstId).toBeTruthy();

      // Second call: drill into the first root child's subtree
      const sub = parse(
        await sharedClient.callTool({
          name: "view_toc",
          arguments: { file_path: TRM, start_id: firstId },
        })
      );

      expect(sub["toc"]).toBeDefined();
      expect(Array.isArray(sub["toc"])).toBe(true);
    },
    30_000
  );

  it(
    "consecutive_pair_header detected on TRM (>= 30 cases)",
    async () => {
      const result = parse(
        await sharedClient.callTool({
          name: "analyze_document",
          arguments: { file_path: TRM },
        })
      );

      const anomalies = result["anomalies"] as Array<{ type: string }>;
      const pairs = anomalies.filter(
        (a) => a.type === "consecutive_pair_header"
      );
      expect(pairs.length).toBeGreaterThanOrEqual(30);
    },
    30_000
  );

  it(
    "line-coverage invariant holds on TRM",
    async () => {
      // Use the shared (already-warm) cache directly — no MCP round-trip needed
      const idx = await sharedCache.getOrBuild(TRM);

      // owner[line] = id string or undefined; 1-based (slot 0 unused)
      const owner: Array<string | undefined> = new Array(idx.line_count + 1);

      const firstHeading = idx.flat_headers[0];
      const preambleEnd = firstHeading
        ? firstHeading.line - 1
        : idx.line_count;
      for (let l = 1; l <= preambleEnd; l++) {
        owner[l] = "preamble";
      }

      function visit(node: TocNode): void {
        const firstChild = node.children[0];
        const ownEnd = firstChild ? firstChild.line - 1 : node.line_end;
        for (let l = node.line; l <= ownEnd; l++) {
          expect(
            owner[l],
            `Line ${l} already owned by "${owner[l]}" when "${node.id}" tries to claim it`
          ).toBeUndefined();
          owner[l] = node.id;
        }
        for (const c of node.children) visit(c);
      }

      for (const root of idx.toc) visit(root);

      for (let l = 1; l <= idx.line_count; l++) {
        expect(owner[l], `Line ${l} has no owner`).toBeDefined();
      }
    },
    30_000
  );
});
