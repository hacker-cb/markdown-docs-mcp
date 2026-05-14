import { describe, it, expect } from "vitest";
import { buildTocTree } from "../../../src/index/reparenting.js";
import type { FlatSeed } from "../../../src/index/types.js";

const mkFlat = (line: number, level: number, title: string): FlatSeed => ({
  id: `s${line}`,
  level: level as FlatSeed["level"],
  title,
  numbering: null,
  line,
});

describe("buildTocTree", () => {
  it("builds linear hierarchy h1 -> h2 -> h3", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 2, "B"), mkFlat(5, 3, "C")];
    const { roots } = buildTocTree(flat, 10);
    expect(roots).toHaveLength(1);
    expect(roots[0]?.title).toBe("A");
    expect(roots[0]?.children).toHaveLength(1);
    expect(roots[0]?.children[0]?.title).toBe("B");
    expect(roots[0]?.children[0]?.children[0]?.title).toBe("C");
  });

  it("reparents on level jump h1 -> h3 (h3 becomes child of h1, no gap)", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 3, "C")];
    const { roots } = buildTocTree(flat, 10);
    expect(roots).toHaveLength(1);
    expect(roots[0]?.children).toHaveLength(1);
    expect(roots[0]?.children[0]?.title).toBe("C");
    expect(roots[0]?.children[0]?.level).toBe(3);
  });

  it("supports multiple root-level headers", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(5, 1, "B")];
    const { roots } = buildTocTree(flat, 10);
    expect(roots.map((n) => n.title)).toEqual(["A", "B"]);
    expect(roots[0]?.line_end).toBe(4);
    expect(roots[1]?.line_end).toBe(10);
  });

  it("closes deeper sections when level rises again", () => {
    const flat = [
      mkFlat(1, 1, "A"),
      mkFlat(3, 2, "B"),
      mkFlat(5, 3, "C"),
      mkFlat(7, 2, "D"),
    ];
    const { roots } = buildTocTree(flat, 10);
    expect(roots[0]?.children.map((n) => n.title)).toEqual(["B", "D"]);
    expect(roots[0]?.children[0]?.children[0]?.title).toBe("C");
  });

  it("computes line_end correctly for all nodes", () => {
    const flat = [
      mkFlat(1, 1, "A"),
      mkFlat(3, 2, "B"),
      mkFlat(10, 2, "C"),
      mkFlat(20, 1, "D"),
    ];
    const { roots } = buildTocTree(flat, 30);
    expect(roots[0]?.line_end).toBe(19); // A ends right before D
    expect(roots[0]?.children[0]?.line_end).toBe(9); // B ends right before C
    expect(roots[0]?.children[1]?.line_end).toBe(19); // C ends right before D
    expect(roots[1]?.line_end).toBe(30); // D ends at file end
  });

  it("sets section_lines = line_end - line + 1", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(11, 1, "B")];
    const { roots } = buildTocTree(flat, 20);
    expect(roots[0]?.section_lines).toBe(10);
    expect(roots[1]?.section_lines).toBe(10);
  });

  it("always sets is_likely_artifact=false in PR-03", () => {
    const flat = [mkFlat(1, 1, "A"), mkFlat(3, 2, "A"), mkFlat(5, 2, "A")];
    const { roots } = buildTocTree(flat, 10);
    const allFalse = (nodes: typeof roots): boolean =>
      nodes.every((n) => n.is_likely_artifact === false && allFalse(n.children));
    expect(allFalse(roots)).toBe(true);
  });

  it("returns enriched flat array matching seeds in document order", () => {
    const seeds = [mkFlat(1, 1, "A"), mkFlat(5, 2, "B"), mkFlat(11, 1, "C")];
    const { flat } = buildTocTree(seeds, 20);
    expect(flat).toHaveLength(3);
    expect(flat[0]?.id).toBe("s1");
    expect(flat[0]?.line_end).toBe(10);  // A (h1) ends before C (next h1 at line 11)
    expect(flat[0]?.section_lines).toBe(10);
    expect(flat[1]?.id).toBe("s5");
    expect(flat[1]?.line_end).toBe(10);  // B (h2) ends before C (next level<=2 at line 11)
    expect(flat[1]?.section_lines).toBe(6);
    expect(flat[2]?.id).toBe("s11");
    expect(flat[2]?.line_end).toBe(20);  // C ends at file end
    expect(flat[2]?.section_lines).toBe(10);
  });
});
