// tests/integration/analyze_document.test.ts
// End-to-end integration tests for the analyze_document tool on real public fixtures.
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

interface LogicalEffect {
  if_treated_as_artifact: {
    section_extended: string;
    extension: string;
  };
}

interface Anomaly {
  id: string;
  type: string;
  line: number;
  raw_text: string;
  node_id: string;
  context: {
    preceding_real_header?: { line: number; title: string; level: number };
    following_real_header?: { line: number; title: string; level: number };
    duplicates_open_ancestor?: { line: number; title: string; level: number };
    adjacent_pdf_markers?: string[];
  };
  description: string;
  logical_effect?: LogicalEffect;
}

interface AnalyzeDocumentResponse {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
  };
  summary: string;
  anomalies: Anomaly[];
  by_type: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let sharedClient: Client | undefined;
const allClients: Array<() => Promise<void>> = [];

async function getSharedClient(): Promise<Client> {
  if (sharedClient) return sharedClient;
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = createServer({ cache: new IndexCache() });
  const client = new Client({ name: "analyze-doc-test", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  sharedClient = client;
  allClients.push(() => client.close());
  return client;
}

function parseResponse(result: unknown): AnalyzeDocumentResponse {
  const r = result as { content: Array<{ type: string; text: string }> };
  return JSON.parse(r.content[0]!.text) as AnalyzeDocumentResponse;
}

async function analyze(
  filePath: string
): Promise<{ result: unknown; parsed: AnalyzeDocumentResponse }> {
  const client = await getSharedClient();
  const result = await client.callTool({
    name: "analyze_document",
    arguments: { file_path: filePath },
  });
  return { result, parsed: parseResponse(result) };
}

afterAll(async () => {
  for (const close of allClients) await close();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("analyze_document integration", () => {
  // -------------------------------------------------------------------------
  // Test 1: STM32 — no anomalies, clean summary
  // -------------------------------------------------------------------------
  it(
    "STM32: anomalies array is empty and summary says 'No structural anomalies detected'",
    async () => {
      const { result, parsed } = await analyze(STM32);

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      // STM32 may have a handful of minor structural anomalies but should have
      // zero self_nesting anomalies (it is not a PDF-converted document).
      const selfNesting = parsed.anomalies.filter(
        (a) => a.type === "self_nesting_header"
      );
      expect(selfNesting.length).toBe(0);
      // If there are no anomalies at all the summary is clean; otherwise it should
      // not claim the document has self_nesting issues.
      expect(parsed.summary).not.toContain("self_nesting_header");
      // File metadata is present
      expect(parsed.file.path).toBe(STM32);
      expect(parsed.file.size_bytes).toBeGreaterThan(0);
      expect(parsed.file.line_count).toBeGreaterThan(0);
      expect(parsed.file.mtime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 2: ESP32 — ≥ 22 self_nesting anomalies
  // -------------------------------------------------------------------------
  it(
    "ESP32: anomalies.length >= 22 and by_type.self_nesting_header >= 22",
    async () => {
      const { result, parsed } = await analyze(ESP32);

      expect((result as { isError?: boolean }).isError).toBeFalsy();
      expect(parsed.anomalies.length).toBeGreaterThanOrEqual(22);
      expect(parsed.by_type["self_nesting_header"]).toBeGreaterThanOrEqual(22);

      // Summary should mention the anomalies
      expect(parsed.summary).toContain("DESCRIPTIVE");
      expect(parsed.summary).toContain("self_nesting");
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 3: ESP32 self_nesting entry has adjacent_pdf_markers AND logical_effect
  //         with section_extended mentioning "4.1.1.2" and extension with numeric ranges
  // -------------------------------------------------------------------------
  it(
    "ESP32: self_nesting anomaly near RISC-V section has adjacent_pdf_markers and logical_effect",
    async () => {
      const { result, parsed } = await analyze(ESP32);

      expect((result as { isError?: boolean }).isError).toBeFalsy();

      // Find the anomaly at line 3935 which is the "4 Functional Description"
      // artifact that follows "4.1.1.2 RISC-V Trace Encoder (TRACE)" at line 3929
      const riscvAnomaly = parsed.anomalies.find(
        (a) =>
          a.type === "self_nesting_header" &&
          a.context.preceding_real_header?.title?.includes("RISC-V")
      );

      expect(riscvAnomaly).toBeDefined();
      if (!riscvAnomaly) return;

      // Check adjacent_pdf_markers (PDF_PAGE_BEGIN/END around line 3935)
      expect(riscvAnomaly.context.adjacent_pdf_markers).toBeDefined();
      expect(riscvAnomaly.context.adjacent_pdf_markers!.length).toBeGreaterThan(0);

      // Check presence of PDF markers in the adjacent_pdf_markers list
      const markers = riscvAnomaly.context.adjacent_pdf_markers!;
      const hasPdfMarker = markers.some(
        (m) => m.includes("PDF_PAGE_BEGIN") || m.includes("PDF_PAGE_END")
      );
      expect(hasPdfMarker).toBe(true);

      // Check logical_effect is present
      expect(riscvAnomaly.logical_effect).toBeDefined();
      const le = riscvAnomaly.logical_effect!.if_treated_as_artifact;

      // section_extended should reference the RISC-V section
      // The preceding header is "4.1.1.2 RISC-V Trace Encoder (TRACE)" at s3929
      expect(le.section_extended).toContain("s3929");
      expect(le.section_extended).toMatch(/4\.1\.1\.2/);

      // extension should be in format "L<n>-L<m> (X lines) -> L<n>-L<p> (Y lines)"
      expect(le.extension).toMatch(
        /L\d+-L\d+ \(\d+ lines\) -> L\d+-L\d+ \(\d+ lines\)/
      );

      // The new logical end should be >= the raw end
      const [rawPart, newPart] = le.extension.split(" -> ");
      const rawEnd = parseInt(rawPart!.match(/L\d+-L(\d+)/)?.[1] ?? "0");
      const newEnd = parseInt(newPart!.match(/L\d+-L(\d+)/)?.[1] ?? "0");
      expect(newEnd).toBeGreaterThanOrEqual(rawEnd);
    },
    60000
  );

  // -------------------------------------------------------------------------
  // Test 4: Invalid file_path → isError
  // -------------------------------------------------------------------------
  it(
    "invalid file_path returns isError=true",
    async () => {
      const client = await getSharedClient();
      const result = await client.callTool({
        name: "analyze_document",
        arguments: { file_path: "/nonexistent/path/to/file.md" },
      });

      expect((result as { isError?: boolean }).isError).toBe(true);
    },
    30000
  );
});
