import type { CommentRange } from "../parser/comments.js";
import type { Anomaly } from "../anomalies/types.js";
import type { PdfMarker } from "../parser/pdf_pages.js";

export type TocNode = {
  id: string;                  // "s<line>"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: boolean; // false by default; set to true by detector for self_nesting
  artifact_reason?: string;
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
  anomalies: Anomaly[];
  pdf_markers: PdfMarker[];
};

export type { CommentRange, PdfMarker, Anomaly };
