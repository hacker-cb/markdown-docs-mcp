import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { buildTocTree } from "./reparenting.js";
import type { FlatHeader, Index } from "./types.js";

function stripBOM(s: string): string {
  return s.length > 0 && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

export async function buildIndex(filePath: string): Promise<Index> {
  const stats = await stat(filePath);
  const raw = stripBOM(await readFile(filePath, "utf8"));
  const fm = parseFrontmatter(raw);
  const headingsInBody = extractHeadings(fm.body);
  const bodyOffset = fm.body_start_line - 1;

  const flat: FlatHeader[] = headingsInBody.map((h) => {
    const absoluteLine = h.line + bodyOffset;
    return {
      id: `s${absoluteLine}`,
      level: h.level,
      title: h.title,
      numbering: extractNumbering(h.title),
      line: absoluteLine,
    };
  });

  const comment_ranges = findCommentRanges(raw);
  const line_offsets = computeLineOffsets(raw);
  const line_count = line_offsets.length;
  const toc = buildTocTree(flat, line_count);

  return {
    file_path: filePath,
    size_bytes: stats.size,
    mtime_ms: stats.mtimeMs,
    line_count,
    raw_content: raw,
    line_offsets,
    toc,
    flat_headers: flat,
    comment_ranges,
    frontmatter: fm.data,
  };
}
