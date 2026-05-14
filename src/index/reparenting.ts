import type { FlatHeader, TocNode } from "./types.js";

export function buildTocTree(headers: FlatHeader[], totalLines: number): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const h of headers) {
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
    while (stack.length > 0 && stack[stack.length - 1]!.level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }

  // Second pass: compute line_end. For each header at index i, the section ends
  // right before the next header with level <= h.level, or at totalLines.
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
    const node = findNodeById(roots, h.id);
    if (node) {
      node.line_end = endLine;
      node.section_lines = endLine - h.line + 1;
    }
  }

  return roots;
}

function findNodeById(nodes: TocNode[], id: string): TocNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNodeById(n.children, id);
    if (found) return found;
  }
  return undefined;
}
