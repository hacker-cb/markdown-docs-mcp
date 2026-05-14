import { describe, it, expect } from "vitest";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../../../src/index/builder.js";

async function withTmpFile(content: string, fn: (path: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), "md-docs-mcp-"));
  const file = join(dir, "doc.md");
  await writeFile(file, content, "utf8");
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("buildIndex", () => {
  it("builds Index from a simple markdown file", async () => {
    await withTmpFile("# H1\n\n## H2\nbody\n", async (path) => {
      const idx = await buildIndex(path);
      expect(idx.file_path).toBe(path);
      expect(idx.toc).toHaveLength(1);
      expect(idx.toc[0]?.title).toBe("H1");
      expect(idx.toc[0]?.children[0]?.title).toBe("H2");
      expect(idx.flat_headers).toHaveLength(2);
      expect(idx.line_count).toBe(5); // 4 lines + trailing
      expect(idx.frontmatter).toBeUndefined();
    });
  });

  it("strips BOM from content", async () => {
    await withTmpFile("﻿# Hello\n", async (path) => {
      const idx = await buildIndex(path);
      expect(idx.toc[0]?.title).toBe("Hello");
      expect(idx.raw_content.startsWith("﻿")).toBe(false);
    });
  });

  it("respects YAML frontmatter and adjusts heading line numbers", async () => {
    await withTmpFile(
      "---\ntitle: Foo\n---\n\n# Heading\nbody\n",
      async (path) => {
        const idx = await buildIndex(path);
        expect(idx.frontmatter).toEqual({ title: "Foo" });
        expect(idx.toc[0]?.line).toBe(5); // heading on line 5 of original file
      }
    );
  });

  it("records HTML comments in comment_ranges", async () => {
    await withTmpFile(
      "<!-- top -->\n# H\nbody\n<!-- bottom -->\n",
      async (path) => {
        const idx = await buildIndex(path);
        expect(idx.comment_ranges).toEqual([
          { start_line: 1, end_line: 1 },
          { start_line: 4, end_line: 4 },
        ]);
      }
    );
  });

  it("computes line_offsets for O(1) lookup", async () => {
    await withTmpFile("aa\nbb\nccc\n", async (path) => {
      const idx = await buildIndex(path);
      // line 1 starts at offset 0, line 2 at offset 3 ('aa\n'), line 3 at 6
      expect(idx.line_offsets[0]).toBe(0);
      expect(idx.line_offsets[1]).toBe(3);
      expect(idx.line_offsets[2]).toBe(6);
    });
  });

  it("throws on non-existent file", async () => {
    await expect(buildIndex("/no/such/file.md")).rejects.toBeDefined();
  });

  it("flags self-nesting heading and exposes it in anomalies", async () => {
    await withTmpFile(
      "# Foo\n\n## Bar\n\n### Foo\nbody\n",
      async (path) => {
        const idx = await buildIndex(path);
        const found = (function walk(nodes: typeof idx.toc): boolean {
          return nodes.some(
            (n) =>
              (n.is_likely_artifact && /self_nesting/.test(n.artifact_reason ?? "")) ||
              walk(n.children)
          );
        })(idx.toc);
        expect(found).toBe(true);
        expect(idx.anomalies.some((a) => a.type === "self_nesting_header")).toBe(true);
      }
    );
  });

  it("Index has anomalies and pdf_markers arrays", async () => {
    await withTmpFile("# H\nbody\n", async (path) => {
      const idx = await buildIndex(path);
      expect(Array.isArray(idx.anomalies)).toBe(true);
      expect(Array.isArray(idx.pdf_markers)).toBe(true);
    });
  });
});
