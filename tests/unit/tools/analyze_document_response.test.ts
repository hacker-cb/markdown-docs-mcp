// tests/unit/tools/analyze_document_response.test.ts
// Unit tests for buildAnalyzeDocumentResponse — pure algorithm, no MCP transport.

import { describe, it, expect } from "vitest";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../../../src/index/builder.js";
import { buildAnalyzeDocumentResponse } from "../../../src/tools/analyze_document_response.js";
import type { Index } from "../../../src/index/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function withTmpFile(
  content: string,
  fn: (path: string) => Promise<void>
): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "md-adr-"));
  const file = join(dir, "doc.md");
  await writeFile(file, content, "utf8");
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function idx(content: string): Promise<Index> {
  let result!: Index;
  await withTmpFile(content, async (path) => {
    result = await buildIndex(path);
  });
  return result;
}

// ---------------------------------------------------------------------------
// Case 1: Empty anomalies → clean summary
// ---------------------------------------------------------------------------

describe("buildAnalyzeDocumentResponse – no anomalies", () => {
  it("returns 'No structural anomalies detected' for a clean document", async () => {
    // A clean document with a proper hierarchy and no self-nesting
    const content = [
      "# Document Title",
      "Introduction text.",
      "## Section One",
      "Content here.",
      "### Subsection 1.1",
      "More content.",
    ].join("\n") + "\n";

    const index = await idx(content);
    const resp = buildAnalyzeDocumentResponse(index, { file_path: index.file_path });

    expect(resp.anomalies.length).toBe(0);
    expect(resp.summary).toContain("No structural anomalies detected");
    expect(resp.summary).toContain("Hierarchy is clean");
    expect(resp.by_type).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Case 2: Mixed anomaly types → by_type counts correct
// ---------------------------------------------------------------------------

describe("buildAnalyzeDocumentResponse – by_type counts", () => {
  it("counts anomalies correctly by type", async () => {
    // This document has:
    // - level_jump: h1 → h3 (skips h2)
    // - empty_section: header immediately followed by next header
    const content = [
      "# Chapter One",
      "Some content.",
      "### Deep Jump",
      "# Chapter Two",
      "## Empty",
      "## Following",
      "Content.",
    ].join("\n") + "\n";

    const index = await idx(content);
    const resp = buildAnalyzeDocumentResponse(index, { file_path: index.file_path });

    // level_jump from h1→h3
    expect(resp.by_type["level_jump"]).toBeGreaterThanOrEqual(1);

    // Verify total count matches by_type sum
    const total = Object.values(resp.by_type).reduce((s, n) => s + n, 0);
    expect(total).toBe(resp.anomalies.length);

    // Summary should mention the total count
    expect(resp.summary).toContain(String(resp.anomalies.length));
    expect(resp.summary).toContain("DESCRIPTIVE");
  });
});

// ---------------------------------------------------------------------------
// Case 3: self_nesting anomaly enriched with logical_effect
// ---------------------------------------------------------------------------

describe("buildAnalyzeDocumentResponse – self_nesting logical_effect", () => {
  it("enriches self_nesting anomaly with section_extended and extension", async () => {
    // Craft a document where a h2 header duplicates an open h1 ancestor:
    //
    // L1: # Chapter A          ← root h1
    // L2: ## Sub               ← h2 under Chapter A
    // L3: ### Detail           ← h3 under Sub  (preceding real header)
    // L4: ## Chapter A         ← self-nesting artifact (h2, same title as h1 ancestor)
    // L5: ### Next Detail      ← h3 non-artifact with level ≤ preceding.level (3)
    // L6: Content after.
    //
    // s3 (Detail at L3) has line=3. Its line_end is 3 (artifact at L4 stops it).
    // After artifact (L4), next non-artifact with level ≤ 3 is "Next Detail" at L5.
    // new_line_end = L5 - 1 = 4.
    // extension: "L3-L3 (1 lines) -> L3-L4 (2 lines)"
    const content = [
      "# Chapter A",
      "## Sub",
      "### Detail",
      "## Chapter A",
      "### Next Detail",
      "Content after.",
    ].join("\n") + "\n";

    const index = await idx(content);
    const selfNesting = index.anomalies.filter((a) => a.type === "self_nesting_header");
    expect(selfNesting.length).toBeGreaterThanOrEqual(1);

    const resp = buildAnalyzeDocumentResponse(index, { file_path: index.file_path });

    const enriched = resp.anomalies.filter(
      (a) => a.type === "self_nesting_header" && a.logical_effect !== undefined
    );
    expect(enriched.length).toBeGreaterThanOrEqual(1);

    const first = enriched[0]!;
    expect(first.logical_effect).toBeDefined();
    const le = first.logical_effect!.if_treated_as_artifact;

    // section_extended should contain the preceding header's id and title
    expect(le.section_extended).toMatch(/^s\d+/);
    expect(le.section_extended).toContain("Detail");

    // extension should be in format "L<n>-L<m> (X lines) -> L<n>-L<p> (Y lines)"
    expect(le.extension).toMatch(/L\d+-L\d+ \(\d+ lines\) -> L\d+-L\d+ \(\d+ lines\)/);

    // The new end should be >= the raw end (the section logically extends)
    const [rawPart, newPart] = le.extension.split(" -> ");
    const rawEnd = parseInt(rawPart!.match(/L\d+-L(\d+)/)?.[1] ?? "0");
    const newEnd = parseInt(newPart!.match(/L\d+-L(\d+)/)?.[1] ?? "0");
    expect(newEnd).toBeGreaterThanOrEqual(rawEnd);

    // by_type should include self_nesting_header
    expect(resp.by_type["self_nesting_header"]).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Case 4: Anomaly without preceding_real_header → no logical_effect
// ---------------------------------------------------------------------------

describe("buildAnalyzeDocumentResponse – no preceding_real_header → no logical_effect", () => {
  it("omits logical_effect when no preceding_real_header is present", async () => {
    // We need the very first header to be a self-nesting one.
    // orphan_subheader uses the first header. For self_nesting, we need a dup at the
    // very start. However, that is impossible by definition (nothing to nest into).
    // Instead, test the fallback: if preceding_real_header is absent (edge case),
    // logical_effect should be omitted.
    //
    // We test this indirectly: a level_jump anomaly has no logical_effect at all.
    const content = [
      "# Top",
      "### Way Down",
      "Content.",
    ].join("\n") + "\n";

    const index = await idx(content);
    const resp = buildAnalyzeDocumentResponse(index, { file_path: index.file_path });

    // level_jump anomaly should not have logical_effect
    const levelJumps = resp.anomalies.filter((a) => a.type === "level_jump");
    expect(levelJumps.length).toBeGreaterThanOrEqual(1);
    for (const lj of levelJumps) {
      expect((lj as { logical_effect?: unknown }).logical_effect).toBeUndefined();
    }
  });

  it("returns correct file metadata in response", async () => {
    const content = "# Title\nContent.\n";
    const index = await idx(content);
    const resp = buildAnalyzeDocumentResponse(index, { file_path: index.file_path });

    expect(resp.file.path).toBe(index.file_path);
    expect(resp.file.size_bytes).toBe(index.size_bytes);
    expect(resp.file.line_count).toBe(index.line_count);
    // mtime should be a valid ISO date string
    expect(() => new Date(resp.file.mtime)).not.toThrow();
    expect(resp.file.mtime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
