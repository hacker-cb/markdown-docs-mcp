import { describe, it, expect } from "vitest";
import { compactTocNode, compactTocNodeAtDepth } from "../../../src/tools/_compact.js";
import type { TocNode } from "../../../src/index/types.js";

function mkNode(overrides: Partial<TocNode> = {}): TocNode {
  return {
    id: "s1",
    level: 1,
    title: "Foo",
    numbering: null,
    line: 1,
    line_end: 5,
    section_lines: 5,
    is_likely_artifact: false,
    children: [],
    ...overrides,
  };
}

describe("compactTocNode", () => {
  it("includes mandatory fields always", () => {
    const result = compactTocNode(mkNode());
    expect(result.id).toBe("s1");
    expect(result.level).toBe(1);
    expect(result.title).toBe("Foo");
    expect(result.line).toBe(1);
    expect(result.line_end).toBe(5);
    expect(result.section_lines).toBe(5);
  });

  it("omits numbering when null", () => {
    expect(compactTocNode(mkNode({ numbering: null })).numbering).toBeUndefined();
  });

  it("keeps numbering when present", () => {
    expect(compactTocNode(mkNode({ numbering: "1.2" })).numbering).toBe("1.2");
  });

  it("omits is_likely_artifact when false", () => {
    expect(
      compactTocNode(mkNode({ is_likely_artifact: false })).is_likely_artifact
    ).toBeUndefined();
  });

  it("includes is_likely_artifact when true with reason", () => {
    const result = compactTocNode(
      mkNode({ is_likely_artifact: true, artifact_reason: "self_nesting" })
    );
    expect(result.is_likely_artifact).toBe(true);
    expect(result.artifact_reason).toBe("self_nesting");
  });

  it("omits empty children array", () => {
    expect(compactTocNode(mkNode({ children: [] })).children).toBeUndefined();
  });

  it("recursively compacts children", () => {
    const child = mkNode({ id: "s3", line: 3, line_end: 5, numbering: "1.1" });
    const root = mkNode({ children: [child] });
    const result = compactTocNode(root);
    expect(result.children).toHaveLength(1);
    expect(result.children?.[0]?.numbering).toBe("1.1");
    expect(result.children?.[0]?.children).toBeUndefined();
  });

  it("produces meaningfully smaller JSON for default-heavy nodes", () => {
    const node = mkNode({ numbering: null, is_likely_artifact: false });
    const full = JSON.stringify(node);
    const compact = JSON.stringify(compactTocNode(node));
    expect(compact.length).toBeLessThan(full.length);
  });
});

describe("compactTocNodeAtDepth", () => {
  it("sets has_children=true and omits children when remainingDepth=1 and node has children", () => {
    const child = mkNode({ id: "s3", line: 3, line_end: 5 });
    const root = mkNode({ children: [child] });
    const result = compactTocNodeAtDepth(root, 1);
    expect(result.has_children).toBe(true);
    expect(result.children).toBeUndefined();
  });

  it("recurses into children when remainingDepth=2; grandchildren with children get has_children", () => {
    const grandchild = mkNode({ id: "s5", line: 5, line_end: 8, children: [mkNode({ id: "s9", line: 9, line_end: 10 })] });
    const child = mkNode({ id: "s3", line: 3, line_end: 10, children: [grandchild] });
    const root = mkNode({ children: [child] });
    const result = compactTocNodeAtDepth(root, 2);
    // root should have children array (depth 2 allows one level of children)
    expect(result.children).toBeDefined();
    expect(result.has_children).toBeUndefined();
    // child at depth=1 has grandchildren trimmed → has_children=true
    const resultChild = result.children![0]!;
    expect(resultChild.has_children).toBe(true);
    expect(resultChild.children).toBeUndefined();
  });

  it("does not set has_children on a leaf node with remainingDepth=1", () => {
    const leaf = mkNode({ children: [] });
    const result = compactTocNodeAtDepth(leaf, 1);
    expect(result.has_children).toBeUndefined();
    expect(result.children).toBeUndefined();
  });
});
