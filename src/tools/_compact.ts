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
  has_children?: true;         // only present when children were trimmed by depth cap
  children?: CompactTocNode[]; // only if non-empty and not depth-trimmed
};

/**
 * Compact a TocNode tree limited to remainingDepth levels.
 * remainingDepth=1: include only this node (no children); if node has children, set has_children=true.
 * remainingDepth>1: recurse into children with remainingDepth-1.
 * Leaf nodes (no children) never get has_children.
 */
export function compactTocNodeAtDepth(
  node: TocNode,
  remainingDepth: number
): CompactTocNode {
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
    if (remainingDepth > 1) {
      result.children = node.children.map((c) =>
        compactTocNodeAtDepth(c, remainingDepth - 1)
      );
    } else {
      result.has_children = true;
    }
  }
  return result;
}

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
