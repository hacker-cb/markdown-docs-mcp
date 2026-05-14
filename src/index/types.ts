import type { CommentRange } from "../parser/comments.js";

export type TocNode = {
  id: string;                  // "s<line>"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: false;   // in PR-03 always false; real flag in PR-04
  children: TocNode[];
};

export type FlatHeader = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
};

export type Index = {
  file_path: string;
  size_bytes: number;
  mtime_ms: number;
  line_count: number;
  raw_content: string;
  line_offsets: number[];     // line (1-based) -> char offset; lineOffsets[i-1] = start of line i
  toc: TocNode[];             // root nodes
  flat_headers: FlatHeader[];
  comment_ranges: CommentRange[];
  frontmatter: Record<string, unknown> | undefined;
};

export type { CommentRange };
