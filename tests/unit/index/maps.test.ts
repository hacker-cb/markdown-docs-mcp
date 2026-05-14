import { describe, it, expect } from "vitest";
import {
  buildNodeById,
  buildFlatIndexById,
  buildLineSectionMap,
  type SectionInfo,
} from "../../../src/index/maps.js";
import type { FlatHeader, TocNode } from "../../../src/index/types.js";

function mkNode(
  id: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  line: number,
  lineEnd: number,
  children: TocNode[] = []
): TocNode {
  return {
    id,
    level,
    title: id,
    numbering: null,
    line,
    line_end: lineEnd,
    section_lines: lineEnd - line + 1,
    is_likely_artifact: false,
    children,
  };
}

describe("buildNodeById", () => {
  it("returns one entry per node, including nested", () => {
    const grandchild = mkNode("s5", 3, 5, 6);
    const child = mkNode("s3", 2, 3, 6, [grandchild]);
    const root = mkNode("s1", 1, 1, 6, [child]);
    const map = buildNodeById([root]);
    expect(map.size).toBe(3);
    expect(map.get("s1")).toBe(root);
    expect(map.get("s3")).toBe(child);
    expect(map.get("s5")).toBe(grandchild);
  });

  it("returns empty map for empty toc", () => {
    expect(buildNodeById([]).size).toBe(0);
  });
});

describe("buildFlatIndexById", () => {
  it("maps each header id to its position in the flat array", () => {
    const flat: FlatHeader[] = [
      { id: "s1", level: 1, title: "A", numbering: null, line: 1, line_end: 2, section_lines: 2 },
      { id: "s3", level: 2, title: "B", numbering: null, line: 3, line_end: 5, section_lines: 3 },
      { id: "s6", level: 1, title: "C", numbering: null, line: 6, line_end: 9, section_lines: 4 },
    ];
    const map = buildFlatIndexById(flat);
    expect(map.size).toBe(3);
    expect(map.get("s1")).toBe(0);
    expect(map.get("s3")).toBe(1);
    expect(map.get("s6")).toBe(2);
  });
});

describe("buildLineSectionMap", () => {
  it("assigns deepest-section semantics — children overwrite parent", () => {
    const child = mkNode("s3", 2, 3, 4);
    const root = mkNode("s1", 1, 1, 5, [child]);
    const map = buildLineSectionMap([root], 5);
    // line indexes 0..4 = lines 1..5
    expect((map[0] as SectionInfo).id).toBe("s1");
    expect((map[1] as SectionInfo).id).toBe("s1");
    expect((map[2] as SectionInfo).id).toBe("s3"); // child overrides
    expect((map[3] as SectionInfo).id).toBe("s3");
    expect((map[4] as SectionInfo).id).toBe("s1"); // back to root
  });

  it("returns null for preamble lines before the first heading", () => {
    const root = mkNode("s3", 1, 3, 5);
    const map = buildLineSectionMap([root], 5);
    expect(map[0]).toBeNull(); // line 1
    expect(map[1]).toBeNull(); // line 2
    expect((map[2] as SectionInfo).id).toBe("s3"); // line 3
  });

  it("clamps line_end to lineCount", () => {
    const root = mkNode("s1", 1, 1, 999);
    const map = buildLineSectionMap([root], 3);
    expect(map).toHaveLength(3);
    expect((map[2] as SectionInfo).id).toBe("s1");
  });
});
