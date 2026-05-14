import type { CommentRange } from "../parser/comments.js";
import type { Anomaly } from "../anomalies/types.js";
import type { PdfMarker } from "../parser/pdf_pages.js";
import type { SectionInfo } from "./maps.js";

export type TocNode = {
  id: string;                  // "s<line>"
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
  line_end: number;
  section_lines: number;
  is_likely_artifact: boolean;
  artifact_reason?: string;
  children: TocNode[];
};

/**
 * Minimal heading info known before the toc tree is built — what the parser
 * extracts directly from headings. Reparenting consumes this shape; once the
 * tree is built, builder.ts derives line_end / section_lines from the tree
 * and constructs the full FlatHeader.
 */
export type FlatSeed = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  numbering: string | null;
  line: number;
};

export type FlatHeader = FlatSeed & {
  line_end: number;
  section_lines: number;
};

export type Index = {
  file_path: string;
  size_bytes: number;
  mtime_ms: number;
  line_count: number;
  raw_content: string;
  line_offsets: number[];
  toc: TocNode[];
  flat_headers: FlatHeader[];
  comment_ranges: CommentRange[];
  frontmatter: Record<string, unknown> | undefined;
  anomalies: Anomaly[];
  pdf_markers: PdfMarker[];
  // O(1) lookups built once in buildIndex; consumed by response builders + detector.
  node_by_id: ReadonlyMap<string, TocNode>;
  flat_index_by_id: ReadonlyMap<string, number>;
  line_section_map: ReadonlyArray<SectionInfo | null>;
};

export type { CommentRange, PdfMarker, Anomaly, SectionInfo };
