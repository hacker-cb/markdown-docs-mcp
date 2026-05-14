// tests/integration/invariants_byte_reconstruction.test.ts
// Byte-reconstruction invariant: concatenating preamble + each section's raw content
// (include_subsections=false, include_comments=true, mode="raw") must equal
// index.raw_content byte-for-byte.
//
// If this invariant fails, it indicates a bug in extractRawRange or
// buildReadSectionResponse — report BLOCKED, do not modify the test to pass.

import { describe, it, expect, afterAll } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { IndexCache } from "../../src/index/cache.js";
import { buildIndex } from "../../src/index/builder.js";
import { extractRawRange } from "../../src/tools/read_section_response.js";
import type { TocNode } from "../../src/index/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURES: Record<string, string> = {
  "esp32-p4-datasheet.md": resolve(
    __dirname,
    "../fixtures/public/esp32-p4-datasheet.md"
  ),
  "stm32h750ib.md": resolve(
    __dirname,
    "../fixtures/public/stm32h750ib.md"
  ),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten a TOC tree to pre-order (depth-first) sequence of nodes. */
function flattenPreOrder(nodes: TocNode[]): TocNode[] {
  const result: TocNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...flattenPreOrder(node.children));
  }
  return result;
}

interface ReadSectionResponse {
  content: string;
  truncated?: boolean;
  truncated_at_line?: number;
}

/** Call read_section and accumulate all pages (follow truncation via from_line). */
async function readSectionFull(
  client: Client,
  filePath: string,
  sectionId: string
): Promise<string> {
  let fullContent = "";
  let fromLine: number | undefined = undefined;

  for (;;) {
    const args: Record<string, unknown> = {
      file_path: filePath,
      section_id: sectionId,
      include_subsections: false,
      include_comments: true,
      mode: "raw",
    };
    if (fromLine !== undefined) args.from_line = fromLine;

    const result = await client.callTool({ name: "read_section", arguments: args });
    const r = result as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(r.content[0]!.text) as ReadSectionResponse;

    fullContent += parsed.content;

    if (!parsed.truncated || parsed.truncated_at_line === undefined) break;
    fromLine = parsed.truncated_at_line + 1;
  }

  return fullContent;
}

async function makeClient(fixturePath: string): Promise<{
  client: Client;
  close: () => Promise<void>;
}> {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = createServer({ cache: new IndexCache() });
  const client = new Client({ name: "invariant-test", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  return { client, close: () => client.close() };
}

// ---------------------------------------------------------------------------
// Invariant tests
// ---------------------------------------------------------------------------

describe("byte-reconstruction invariant", () => {
  const openClients: Array<{ close: () => Promise<void> }> = [];

  afterAll(async () => {
    for (const c of openClients) await c.close();
  });

  for (const [fixtureName, fixturePath] of Object.entries(FIXTURES)) {
    it(
      `${fixtureName}: preamble + all sections reconstruct raw_content byte-for-byte`,
      async () => {
        // Build index directly for ground truth
        const idx = await buildIndex(fixturePath);

        // Create an MCP client wired to a fresh server
        const { client, close } = await makeClient(fixturePath);
        openClients.push({ close });

        const parts: string[] = [];

        // 1. Preamble: lines [1 .. firstHeader.line - 1]
        const firstHeader = idx.flat_headers[0];
        if (!firstHeader) {
          // No headers at all — the whole file is preamble
          parts.push(idx.raw_content);
        } else {
          const preambleEnd = firstHeader.line - 1;
          if (preambleEnd >= 1) {
            parts.push(
              extractRawRange(idx.raw_content, idx.line_offsets, 1, preambleEnd)
            );
          }
        }

        // 2. For each node in pre-order: read its own content (no subsections)
        if (firstHeader) {
          const allNodes = flattenPreOrder(idx.toc);
          for (const node of allNodes) {
            const content = await readSectionFull(client, fixturePath, node.id);
            parts.push(content);
          }
        }

        // 3. Reconstruct and compare
        const reconstructed = parts.join("");

        // Provide a helpful diff hint if the invariant fails
        if (reconstructed !== idx.raw_content) {
          const reconBuf = Buffer.from(reconstructed, "utf8");
          const rawBuf = Buffer.from(idx.raw_content, "utf8");
          const diffByte = (() => {
            const minLen = Math.min(reconBuf.length, rawBuf.length);
            for (let i = 0; i < minLen; i++) {
              if (reconBuf[i] !== rawBuf[i]) return i;
            }
            return minLen;
          })();

          // Find which line the differing byte falls on
          let diffLine = 1;
          for (let i = 0; i < diffByte && i < idx.line_offsets.length; i++) {
            if (idx.line_offsets[i]! > diffByte) break;
            diffLine = i + 1;
          }

          throw new Error(
            `BLOCKED: byte-reconstruction invariant failed for ${fixtureName}.\n` +
              `  raw_content length: ${rawBuf.length} bytes\n` +
              `  reconstructed length: ${reconBuf.length} bytes\n` +
              `  First diff at byte ${diffByte} (approx line ${diffLine})\n` +
              `  raw[${diffByte}..${diffByte + 30}]: ${JSON.stringify(idx.raw_content.slice(diffByte, diffByte + 30))}\n` +
              `  rec[${diffByte}..${diffByte + 30}]: ${JSON.stringify(reconstructed.slice(diffByte, diffByte + 30))}`
          );
        }

        expect(reconstructed).toBe(idx.raw_content);
      },
      // Large fixtures take several minutes to traverse all sections
      300000
    );
  }
});
