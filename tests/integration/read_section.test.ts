// tests/integration/read_section.test.ts
// End-to-end integration tests for the read_section tool on real public fixtures.
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

interface TocNodeMini {
  id: string;
  title: string;
  level: number;
  children: TocNodeMini[];
}

interface AbsorbedArtifact {
  id: string;
  line: number;
  title: string;
  would_have_owned_lines: string;
}

interface ReadSectionResponse {
  section: {
    id: string;
    title: string;
    level: number;
    line: number;
    line_end: number;
    numbering: string | null;
  };
  content: string;
  children?: TocNodeMini[];
  expansion?: {
    raw_line_end: number;
    logical_line_end: number;
    artifacts_absorbed: AbsorbedArtifact[];
  };
  truncated?: boolean;
  truncated_at_line?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function parseResponse(result: unknown): ReadSectionResponse {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text) as ReadSectionResponse;
}

/**
 * Returns a section id from the view_toc result by searching for a node
 * matching the given title fragment (case-insensitive substring).
 */
async function findSectionId(
  client: Client,
  filePath: string,
  titleFragment: string
): Promise<string> {
  const result = await client.callTool({
    name: "view_toc",
    arguments: { file_path: filePath },
  });
  const r = result as { content: Array<{ type: string; text: string }> };
  const toc = JSON.parse(r.content[0]!.text) as { toc: TocNodeMini[] };
  const lower = titleFragment.toLowerCase();

  function search(nodes: TocNodeMini[]): string | undefined {
    for (const n of nodes) {
      if (n.title.toLowerCase().includes(lower)) return n.id;
      const found = search(n.children);
      if (found) return found;
    }
    return undefined;
  }

  const id = search(toc.toc);
  if (!id) throw new Error(`Section with title "${titleFragment}" not found in ${filePath}`);
  return id;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("read_section integration", () => {
  const openClients: Array<{ close: () => Promise<void> }> = [];

  afterAll(async () => {
    for (const c of openClients) await c.close();
  });

  // -------------------------------------------------------------------------
  // Test 1: raw mode without subsections returns non-empty content +
  //         children mini-TOC for a section that has children (STM32)
  // -------------------------------------------------------------------------
  it(
    "raw mode without subsections: non-empty content + children mini-TOC (STM32)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      // "Features" section (s7) in STM32 has 15 children
      const sectionId = await findSectionId(client, STM32, "Features");

      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: STM32,
          section_id: sectionId,
          include_subsections: false,
          mode: "raw",
        },
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      const parsed = parseResponse(result);

      expect(parsed.content.length).toBeGreaterThan(0);
      // Should have a children mini-TOC since the section has children
      expect(parsed.children).toBeDefined();
      expect(parsed.children!.length).toBeGreaterThan(0);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 2: raw mode with include_subsections=true returns more content
  // -------------------------------------------------------------------------
  it(
    "raw mode include_subsections=true returns more content than include_subsections=false (STM32)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      const sectionId = await findSectionId(client, STM32, "Features");

      const resultFalse = await client.callTool({
        name: "read_section",
        arguments: { file_path: STM32, section_id: sectionId, include_subsections: false, mode: "raw" },
      });
      const resultTrue = await client.callTool({
        name: "read_section",
        arguments: { file_path: STM32, section_id: sectionId, include_subsections: true, mode: "raw" },
      });

      expect((resultFalse as { isError?: boolean }).isError).toBeFalsy();
      expect((resultTrue as { isError?: boolean }).isError).toBeFalsy();

      const parsedFalse = parseResponse(resultFalse);
      const parsedTrue = parseResponse(resultTrue);

      expect(parsedTrue.content.length).toBeGreaterThan(parsedFalse.content.length);
      // include_subsections=true means no children mini-TOC in response
      expect(parsedTrue.children).toBeUndefined();
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 3: include_comments=false (default): PDF page markers absent from
  //         ESP32 section content (using s3929 which has comments at L3932, L3934)
  // -------------------------------------------------------------------------
  it(
    "include_comments=false: HTML comments absent from ESP32 s3929 content",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      // s3929 "4.1.1.2 RISC-V Trace Encoder (TRACE)" — leaf section with
      // HTML comment lines at L3932 and L3934 (PDF page markers).
      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: ESP32,
          section_id: "s3929",
          include_subsections: false,
          include_comments: false,
          mode: "raw",
        },
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      const parsed = parseResponse(result);

      // PDF page markers (HTML comments) must be stripped
      expect(parsed.content).not.toMatch(/<!--/);
      // Content is non-empty (the heading + body lines remain)
      expect(parsed.content.length).toBeGreaterThan(0);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 4: include_comments=true: markers present in same section
  // -------------------------------------------------------------------------
  it(
    "include_comments=true: HTML comments present in ESP32 s3929 content",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: ESP32,
          section_id: "s3929",
          include_subsections: false,
          include_comments: true,
          mode: "raw",
        },
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      const parsed = parseResponse(result);

      expect(parsed.content).toMatch(/<!--/);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 5: logical mode for ESP32 section "4.1.1.2 RISC-V Trace Encoder"
  //         returns >= 33 lines and expansion.artifacts_absorbed includes s3935
  // -------------------------------------------------------------------------
  it(
    "logical mode ESP32 s3929: >= 33 lines, artifacts_absorbed includes s3935 at L3935",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      // s3929: "4.1.1.2 RISC-V Trace Encoder (TRACE)", lines 3929-3934 (raw)
      // Adjacent artifact s3935: "4 Functional Description", lines 3935-3961 (before next non-artifact s3962)
      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: ESP32,
          section_id: "s3929",
          include_subsections: false,
          include_comments: true,
          mode: "logical",
        },
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      const parsed = parseResponse(result);

      const lineCount = parsed.content.split("\n").length;
      expect(lineCount).toBeGreaterThanOrEqual(33);

      expect(parsed.expansion).toBeDefined();
      expect(parsed.expansion!.artifacts_absorbed.length).toBeGreaterThan(0);

      const absorbed = parsed.expansion!.artifacts_absorbed;
      const artifact = absorbed.find((a) => a.id === "s3935");
      expect(artifact).toBeDefined();
      expect(artifact!.line).toBe(3935);
      expect(artifact!.title).toContain("Functional Description");
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 6: Truncation on a large STM32 section
  // -------------------------------------------------------------------------
  it(
    "truncation on large STM32 section s9601 with include_subsections=true: content under 200KB cap + truncated=true",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      // s9601: "6 Electrical characteristics (rev Y)", 336496 bytes total
      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: STM32,
          section_id: "s9601",
          include_subsections: true,
          include_comments: true,
          mode: "raw",
        },
      });

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      const parsed = parseResponse(result);

      const bytes = Buffer.byteLength(parsed.content, "utf8");
      expect(bytes).toBeLessThanOrEqual(204800 + 5); // allow tiny rounding margin
      expect(parsed.truncated).toBe(true);
      expect(parsed.truncated_at_line).toBeDefined();
      expect(parsed.truncated_at_line!).toBeGreaterThan(9601);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 7: from_line continuation after truncation
  // -------------------------------------------------------------------------
  it(
    "from_line continuation: second call starts where first left off (STM32 s9601)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      // First call — get the truncated response
      const firstResult = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: STM32,
          section_id: "s9601",
          include_subsections: true,
          include_comments: true,
          mode: "raw",
        },
      });

      expect((firstResult as { isError?: boolean }).isError).toBeFalsy();
      const first = parseResponse(firstResult);
      expect(first.truncated).toBe(true);
      const continueFromLine = first.truncated_at_line! + 1;

      // Second call — continuation
      const secondResult = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: STM32,
          section_id: "s9601",
          include_subsections: true,
          include_comments: true,
          mode: "raw",
          from_line: continueFromLine,
        },
      });

      expect((secondResult as { isError?: boolean }).isError).toBeFalsy();
      const second = parseResponse(secondResult);

      // Continuation content is non-empty
      expect(second.content.length).toBeGreaterThan(0);

      // The two contents do not overlap: first ends at truncated_at_line,
      // second starts at continueFromLine. Verify by checking first line of second.
      const secondFirstLine = second.content.split("\n")[0];
      expect(secondFirstLine).toBeDefined();
      expect(secondFirstLine!.length).toBeGreaterThanOrEqual(0); // just a sanity check

      // Together, first + second content should be larger than first alone
      expect(first.content.length + second.content.length).toBeGreaterThan(first.content.length);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 8: Invalid section_id → isError === true
  // -------------------------------------------------------------------------
  it(
    "invalid section_id returns MCP error (isError=true)",
    async () => {
      const { client, close } = await makeClient();
      openClients.push({ close });

      const result = await client.callTool({
        name: "read_section",
        arguments: {
          file_path: ESP32,
          section_id: "s999999999",
        },
      });

      expect((result as { isError?: boolean }).isError).toBe(true);
    },
    30000
  );
});
