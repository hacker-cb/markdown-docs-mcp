import type { TocNode } from "../index/types.js";

// CompactTocNode — TocNode shape with default-valued fields stripped.
// Returned by JSON.stringify-friendly shape for tool responses.
export type CompactTocNode = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  line: number;
  line_end: number;
  section_lines: number;
  numbering?: string;          // only if non-null
  is_likely_artifact?: true;   // only if true
  artifact_reason?: string;    // only if is_likely_artifact
  children?: CompactTocNode[]; // only if non-empty
};

export function compactTocNode(node: TocNode): CompactTocNode {
  const result: CompactTocNode = {
    id: node.id,
    level: node.level,
    title: node.title,
    line: node.line,
    line_end: node.line_end,
    section_lines: node.section_lines,
  };
  if (node.numbering !== null) {
    result.numbering = node.numbering;
  }
  if (node.is_likely_artifact === true) {
    result.is_likely_artifact = true;
    if (node.artifact_reason !== undefined) {
      result.artifact_reason = node.artifact_reason;
    }
  }
  if (node.children.length > 0) {
    result.children = node.children.map(compactTocNode);
  }
  return result;
}
