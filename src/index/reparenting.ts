import type { FlatHeader, FlatSeed, TocNode } from "./types.js";

export type ReparentingResult = {
  roots: TocNode[];
  flat: FlatHeader[]; // same order as input headers; line_end / section_lines filled
};

export function buildTocTree(
  headers: FlatSeed[],
  totalLines: number
): ReparentingResult {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  const nodes: TocNode[] = new Array(headers.length);

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    const node: TocNode = {
      id: h.id,
      level: h.level,
      title: h.title,
      numbering: h.numbering,
      line: h.line,
      line_end: 0,        // filled in second pass
      section_lines: 0,   // filled in second pass
      is_likely_artifact: false,
      children: [],
    };
    nodes[i] = node;

    while (
      stack.length > 0 &&
      stack[stack.length - 1]!.level >= node.level
    ) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }

  // Second pass: compute line_end via index lookup, no recursion.
  const flat: FlatHeader[] = new Array(headers.length);
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    let endLine = totalLines;
    for (let j = i + 1; j < headers.length; j++) {
      const next = headers[j]!;
      if (next.level <= h.level) {
        endLine = next.line - 1;
        break;
      }
    }
    nodes[i]!.line_end = endLine;
    nodes[i]!.section_lines = endLine - h.line + 1;
    flat[i] = {
      ...h,
      line_end: endLine,
      section_lines: endLine - h.line + 1,
    };
  }

  return { roots, flat };
}
