import type { FlatHeader, TocNode } from "./types.js";

export type SectionInfo = {
  id: string;
  title: string;
  level: number;
  numbering: string | null;
};

export function buildNodeById(toc: TocNode[]): Map<string, TocNode> {
  const map = new Map<string, TocNode>();
  function visit(node: TocNode): void {
    map.set(node.id, node);
    for (const child of node.children) visit(child);
  }
  for (const root of toc) visit(root);
  return map;
}

export function buildFlatIndexById(
  flat: ReadonlyArray<FlatHeader>
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < flat.length; i++) {
    map.set(flat[i]!.id, i);
  }
  return map;
}

export function buildLineSectionMap(
  toc: TocNode[],
  lineCount: number
): Array<SectionInfo | null> {
  const map: Array<SectionInfo | null> = new Array(lineCount).fill(null);
  function visit(node: TocNode): void {
    const info: SectionInfo = {
      id: node.id,
      title: node.title,
      level: node.level,
      numbering: node.numbering,
    };
    const start = node.line - 1;
    const end = Math.min(node.line_end - 1, lineCount - 1);
    for (let i = start; i <= end; i++) {
      map[i] = info;
    }
    for (const c of node.children) visit(c);
  }
  for (const root of toc) visit(root);
  return map;
}
