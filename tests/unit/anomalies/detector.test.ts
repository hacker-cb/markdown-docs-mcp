import { describe, it, expect } from "vitest";
import { detectAnomalies } from "../../../src/anomalies/detector.js";
import type { Index } from "../../../src/index/types.js";
import type { TocNode, FlatHeader } from "../../../src/index/types.js";

// Helper: build a minimal Index manually (avoiding the real builder for unit isolation).
function mkIndex(opts: {
  toc: TocNode[];
  flat: FlatHeader[];
  line_count: number;
  raw_content?: string;
  pdf_markers?: Array<{ line: number; page: number; kind: "begin" | "end" }>;
}): Index {
  return {
    file_path: "/tmp/x.md",
    size_bytes: 0,
    mtime_ms: 0,
    line_count: opts.line_count,
    raw_content: opts.raw_content ?? "",
    line_offsets: [0],
    toc: opts.toc,
    flat_headers: opts.flat,
    comment_ranges: [],
    frontmatter: undefined,
    anomalies: [],
    pdf_markers: opts.pdf_markers ?? [],
    node_by_id: new Map(),
    flat_index_by_id: new Map(),
    line_section_map: [],
  };
}

const mkNode = (
  id: string,
  level: TocNode["level"],
  title: string,
  line: number,
  line_end: number,
  children: TocNode[] = []
): TocNode => ({
  id,
  level,
  title,
  numbering: null,
  line,
  line_end,
  section_lines: line_end - line + 1,
  is_likely_artifact: false,
  children,
});

// detector input fixtures need only the heading-line info plus minimal ranges
// (line_end + section_lines were added to FlatHeader for view_toc raw mode).
// Tests don't exercise those fields directly, so synthesize them from line.
const mkFlat = (
  id: string,
  level: FlatHeader["level"],
  title: string,
  line: number,
  numbering: string | null = null
): FlatHeader => ({
  id,
  level,
  title,
  numbering,
  line,
  line_end: line,
  section_lines: 1,
});

describe("detectAnomalies", () => {
  it("detects self_nesting_header when title duplicates open ancestor", () => {
    // root "Foo" -> child h2 -> grandchild "Foo" again (same title as root)
    const grandchild = mkNode("s5", 3, "Foo", 5, 7);
    const child = mkNode("s3", 2, "Bar", 3, 7, [grandchild]);
    const root = mkNode("s1", 1, "Foo", 1, 7, [child]);
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Foo", 1),
      mkFlat("s3", 2, "Bar", 3),
      mkFlat("s5", 3, "Foo", 5),
    ];
    const result = detectAnomalies(mkIndex({ toc: [root], flat, line_count: 10 }));
    const selfNesting = result.filter((a) => a.type === "self_nesting_header");
    expect(selfNesting).toHaveLength(1);
    expect(selfNesting[0]?.node_id).toBe("s5");
    expect(selfNesting[0]?.context.duplicates_open_ancestor).toMatchObject({
      line: 1,
      title: "Foo",
      level: 1,
    });
  });

  it("does not flag titles repeating in different branches", () => {
    const a1 = mkNode("s5", 2, "Examples", 5, 6);
    const a = mkNode("s3", 1, "Annex A", 3, 6, [a1]);
    const b1 = mkNode("s9", 2, "Examples", 9, 10);
    const b = mkNode("s7", 1, "Annex B", 7, 10, [b1]);
    const flat: FlatHeader[] = [
      mkFlat("s3", 1, "Annex A", 3),
      mkFlat("s5", 2, "Examples", 5),
      mkFlat("s7", 1, "Annex B", 7),
      mkFlat("s9", 2, "Examples", 9),
    ];
    const result = detectAnomalies(mkIndex({ toc: [a, b], flat, line_count: 10 }));
    expect(result.filter((a) => a.type === "self_nesting_header")).toHaveLength(0);
  });

  it("detects orphan_subheader when first heading level > 1", () => {
    const node = mkNode("s1", 2, "H2", 1, 5);
    const flat: FlatHeader[] = [
      mkFlat("s1", 2, "H2", 1),
    ];
    const result = detectAnomalies(mkIndex({ toc: [node], flat, line_count: 5 }));
    expect(result.filter((a) => a.type === "orphan_subheader")).toHaveLength(1);
  });

  it("detects level_jump in flat headers (gap > 1)", () => {
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "A", 1),
      mkFlat("s3", 3, "B", 3),
    ];
    const a = mkNode("s1", 1, "A", 1, 4, [mkNode("s3", 3, "B", 3, 4)]);
    const result = detectAnomalies(mkIndex({ toc: [a], flat, line_count: 4 }));
    const jumps = result.filter((x) => x.type === "level_jump");
    expect(jumps).toHaveLength(1);
    expect(jumps[0]?.line).toBe(3);
  });

  it("detects empty_section when line_end equals line", () => {
    const node = mkNode("s1", 1, "Empty", 1, 1);
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Empty", 1),
    ];
    const result = detectAnomalies(mkIndex({ toc: [node], flat, line_count: 5 }));
    expect(result.filter((a) => a.type === "empty_section")).toHaveLength(1);
  });

  it("detects consecutive_pair_header for 'Chapter 5' + 'Title'", () => {
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Chapter 5", 1, "5"),
      mkFlat("s3", 1, "GDMA Controller", 3),
    ];
    const tree = [
      mkNode("s1", 1, "Chapter 5", 1, 2),
      mkNode("s3", 1, "GDMA Controller", 3, 10),
    ];
    const result = detectAnomalies(
      mkIndex({ toc: tree, flat, line_count: 10 })
    );
    const pair = result.filter((a) => a.type === "consecutive_pair_header");
    expect(pair).toHaveLength(1);
    expect(pair[0]?.node_id).toBe("s1");
    expect(pair[0]?.context.paired_with).toMatchObject({
      line: 3,
      title: "GDMA Controller",
      level: 1,
    });
  });

  it("does not match content-rich headings starting with 'Chapter'", () => {
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Chapter 5: Architecture", 1),
      mkFlat("s3", 1, "Overview", 3),
    ];
    const result = detectAnomalies(
      mkIndex({
        toc: [mkNode("s1", 1, "Chapter 5: Architecture", 1, 2), mkNode("s3", 1, "Overview", 3, 10)],
        flat,
        line_count: 10,
      })
    );
    expect(result.filter((a) => a.type === "consecutive_pair_header")).toHaveLength(0);
  });

  it("recognizes Roman numerals (Part I, Part II)", () => {
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Part I", 1),
      mkFlat("s2", 1, "Microprocessor and Master", 2),
    ];
    const result = detectAnomalies(
      mkIndex({
        toc: [mkNode("s1", 1, "Part I", 1, 1), mkNode("s2", 1, "Microprocessor and Master", 2, 10)],
        flat,
        line_count: 10,
      })
    );
    expect(result.filter((a) => a.type === "consecutive_pair_header")).toHaveLength(1);
  });

  it("does not match when headers are too far apart (> 3 lines)", () => {
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Chapter 5", 1, "5"),
      mkFlat("s10", 1, "Something", 10),
    ];
    const result = detectAnomalies(
      mkIndex({
        toc: [mkNode("s1", 1, "Chapter 5", 1, 9), mkNode("s10", 1, "Something", 10, 15)],
        flat,
        line_count: 15,
      })
    );
    expect(result.filter((a) => a.type === "consecutive_pair_header")).toHaveLength(0);
  });

  it("attaches adjacent_pdf_markers when markers within +/-3 lines", () => {
    const grandchild = mkNode("s5", 3, "Foo", 5, 7);
    const child = mkNode("s3", 2, "Bar", 3, 7, [grandchild]);
    const root = mkNode("s1", 1, "Foo", 1, 7, [child]);
    const flat: FlatHeader[] = [
      mkFlat("s1", 1, "Foo", 1),
      mkFlat("s3", 2, "Bar", 3),
      mkFlat("s5", 3, "Foo", 5),
    ];
    const result = detectAnomalies(
      mkIndex({
        toc: [root],
        flat,
        line_count: 10,
        pdf_markers: [
          { line: 4, page: 38, kind: "end" },
          { line: 6, page: 39, kind: "begin" },
        ],
      })
    );
    const self = result.find((a) => a.type === "self_nesting_header");
    expect(self?.context.adjacent_pdf_markers).toEqual([
      "L4 PDF_PAGE_END 38",
      "L6 PDF_PAGE_BEGIN 39",
    ]);
  });
});
