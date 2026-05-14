// tests/unit/tools/search_response.test.ts
// Unit tests for buildSearchResponse — pure algorithm, no MCP transport.

import { describe, it, expect } from "vitest";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../../../src/index/builder.js";
import { buildSearchResponse } from "../../../src/tools/search_response.js";
import type { Index } from "../../../src/index/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function withTmpFile(
  content: string,
  fn: (path: string) => Promise<void>
): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "md-sr-"));
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
// Case 1: Literal substring match (case-insensitive by default)
// ---------------------------------------------------------------------------

describe("buildSearchResponse – literal case-insensitive (default)", () => {
  it("finds 'FOO' when content has 'foo' (case_sensitive defaults to false)", async () => {
    const index = await idx("# Header\nsome foo text\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "FOO",
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    const hit = resp.hits.find((h) => h.in === "content");
    expect(hit).toBeDefined();
    expect(hit!.matched_text).toBe("foo"); // original case preserved
  });
});

// ---------------------------------------------------------------------------
// Case 2: Literal with case_sensitive=true
// ---------------------------------------------------------------------------

describe("buildSearchResponse – literal case-sensitive", () => {
  it("does not find 'FOO' when content has 'foo' and case_sensitive=true", async () => {
    const index = await idx("# Header\nsome foo text\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "FOO",
      case_sensitive: true,
    });
    const contentHits = resp.hits.filter((h) => h.in === "content");
    expect(contentHits.length).toBe(0);
  });

  it("finds 'foo' when content has 'foo' and case_sensitive=true", async () => {
    const index = await idx("# Header\nsome foo text\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "foo",
      case_sensitive: true,
    });
    const contentHits = resp.hits.filter((h) => h.in === "content");
    expect(contentHits.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Case 3: Regex match
// ---------------------------------------------------------------------------

describe("buildSearchResponse – regex", () => {
  it("matches using a regular expression", async () => {
    const index = await idx("# Header\nline with 123 numbers\nno match here\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "\\d+",
      regex: true,
    });
    const contentHits = resp.hits.filter((h) => h.in === "content");
    expect(contentHits.length).toBeGreaterThan(0);
    expect(contentHits[0]!.matched_text).toBe("123");
  });
});

// ---------------------------------------------------------------------------
// Case 4: Invalid regex → structured error with code INVALID_REGEX
// ---------------------------------------------------------------------------

describe("buildSearchResponse – invalid regex", () => {
  it("throws an error with code INVALID_REGEX for a bad regex", async () => {
    const index = await idx("# Header\nbody\n");
    let caught: unknown;
    try {
      buildSearchResponse(index, {
        file_path: index.file_path,
        query: "[unclosed",
        regex: true,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    expect((caught as { code?: string }).code).toBe("INVALID_REGEX");
  });
});

// ---------------------------------------------------------------------------
// Case 5: scope="titles" — only header hits, not content
// ---------------------------------------------------------------------------

describe("buildSearchResponse – scope=titles", () => {
  it("only returns title hits when scope=titles", async () => {
    const index = await idx("# Alpha Beta\nalpha beta in body\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "alpha",
      scope: "titles",
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    for (const hit of resp.hits) {
      expect(hit.in).toBe("title");
    }
  });

  it("does not return content hits when scope=titles", async () => {
    const index = await idx("# No match header\nalpha in body\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "alpha",
      scope: "titles",
    });
    // Header "No match header" does not contain "alpha"
    expect(resp.hits.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Case 6: scope="content" — only body hits, not headers
// ---------------------------------------------------------------------------

describe("buildSearchResponse – scope=content", () => {
  it("only returns content hits when scope=content", async () => {
    const index = await idx("# Alpha\nbody alpha text\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "alpha",
      scope: "content",
    });
    // Should NOT include the title hit
    for (const hit of resp.hits) {
      expect(hit.in).toBe("content");
    }
  });
});

// ---------------------------------------------------------------------------
// Case 7: scope="all" — both titles and content
// ---------------------------------------------------------------------------

describe("buildSearchResponse – scope=all", () => {
  it("returns both title and content hits when scope=all (default)", async () => {
    const index = await idx("# Alpha title\nalpha in body\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "alpha",
    });
    const titleHits = resp.hits.filter((h) => h.in === "title");
    const contentHits = resp.hits.filter((h) => h.in === "content");
    expect(titleHits.length).toBeGreaterThan(0);
    expect(contentHits.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Case 8: context_lines — snippet contains N lines before/after
// ---------------------------------------------------------------------------

describe("buildSearchResponse – context_lines", () => {
  it("snippet contains context lines around the match", async () => {
    const content = [
      "# H",
      "line A",
      "line B",
      "TARGET",
      "line D",
      "line E",
    ].join("\n") + "\n";
    const index = await idx(content);
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "TARGET",
      scope: "content",
      context_lines: 2,
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    const hit = resp.hits[0]!;
    // Snippet should include at least "line B" and "line D" in addition to "TARGET"
    expect(hit.snippet).toContain("TARGET");
    expect(hit.snippet).toContain("line B");
    expect(hit.snippet).toContain("line D");
  });

  it("context_lines=0 gives only the matching line in snippet", async () => {
    const content = "# H\nbefore\nTARGET\nafter\n";
    const index = await idx(content);
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "TARGET",
      scope: "content",
      context_lines: 0,
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    const hit = resp.hits[0]!;
    expect(hit.snippet).toContain("TARGET");
    expect(hit.snippet).not.toContain("before");
    expect(hit.snippet).not.toContain("after");
  });
});

// ---------------------------------------------------------------------------
// Case 9: include_comments=false — HTML comment line skipped
// ---------------------------------------------------------------------------

describe("buildSearchResponse – include_comments=false", () => {
  it("skips lines inside HTML comments when include_comments=false", async () => {
    const index = await idx("# H\n<!-- PDF_PAGE_BEGIN 1 -->\nreal content\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "PDF_PAGE_BEGIN",
      scope: "content",
      include_comments: false,
    });
    expect(resp.hits.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Case 10: include_comments=true — HTML comment line found
// ---------------------------------------------------------------------------

describe("buildSearchResponse – include_comments=true", () => {
  it("finds text inside HTML comments when include_comments=true", async () => {
    const index = await idx("# H\n<!-- PDF_PAGE_BEGIN 1 -->\nreal content\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "PDF_PAGE_BEGIN",
      scope: "content",
      include_comments: true,
    });
    expect(resp.hits.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Case 11: max_results caps hits and sets truncated=true
// ---------------------------------------------------------------------------

describe("buildSearchResponse – max_results", () => {
  it("caps hits at max_results and sets truncated=true", async () => {
    // Create a document with many lines containing "WORD"
    const lines = ["# Header"];
    for (let i = 0; i < 20; i++) lines.push(`WORD line ${i}`);
    const index = await idx(lines.join("\n") + "\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "WORD",
      scope: "content",
      max_results: 5,
    });
    expect(resp.hits.length).toBe(5);
    expect(resp.truncated).toBe(true);
    expect(resp.total_matches).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Case 12: hits sorted by line ascending
// ---------------------------------------------------------------------------

describe("buildSearchResponse – sort order", () => {
  it("returns hits sorted by line ascending", async () => {
    // scope=all: header match comes at line 1, body match later
    const index = await idx("# Alpha Header\nbody alpha body\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "alpha",
      scope: "all",
    });
    expect(resp.hits.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < resp.hits.length; i++) {
      expect(resp.hits[i]!.line).toBeGreaterThanOrEqual(resp.hits[i - 1]!.line);
    }
  });
});

// ---------------------------------------------------------------------------
// Case 13: hit section field points to the containing TocNode
// ---------------------------------------------------------------------------

describe("buildSearchResponse – section field", () => {
  it("section id and title match the containing header", async () => {
    const content = [
      "# Chapter One",
      "## Section Two",
      "content inside section two",
    ].join("\n") + "\n";
    const index = await idx(content);
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "content inside",
      scope: "content",
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    const hit = resp.hits[0]!;
    expect(hit.section.title).toBe("Section Two");
    expect(hit.section.level).toBe(2);
    expect(hit.section.id).toMatch(/^s\d+$/);
  });
});

// ---------------------------------------------------------------------------
// Case 14: preamble matches use virtual section
// ---------------------------------------------------------------------------

describe("buildSearchResponse – preamble section", () => {
  it("lines before first heading use virtual preamble section", async () => {
    const index = await idx("Preamble content here\n# First Header\nbody\n");
    const resp = buildSearchResponse(index, {
      file_path: index.file_path,
      query: "Preamble content",
      scope: "content",
    });
    expect(resp.hits.length).toBeGreaterThan(0);
    const hit = resp.hits[0]!;
    expect(hit.section.id).toBe("");
    expect(hit.section.title).toBe("(document preamble)");
    expect(hit.section.level).toBe(0);
    expect(hit.section.numbering).toBeUndefined(); // null numbering is omitted in compact form
  });
});
