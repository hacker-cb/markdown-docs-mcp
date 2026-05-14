export type AnomalyType =
  | "self_nesting_header"
  | "level_jump"
  | "orphan_subheader"
  | "empty_section";

export type Anomaly = {
  id: string;                         // "a1", "a2", ... — sequential
  type: AnomalyType;
  line: number;
  raw_text: string;                   // original heading with #
  node_id: string;                    // TocNode.id that caused the anomaly
  context: {
    preceding_real_header?: { line: number; title: string; level: number };
    following_real_header?: { line: number; title: string; level: number };
    duplicates_open_ancestor?: { line: number; title: string; level: number };  // self_nesting
    adjacent_pdf_markers?: string[];   // ["L3932 PDF_PAGE_END 38", ...]
  };
  description: string;                // human-readable
};
