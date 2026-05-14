import { describe, it, expect } from "vitest";
import { findCommentRanges } from "../../../src/parser/comments.js";
import { computeLineOffsets } from "../../../src/parser/_line_offsets.js";

function ranges(content: string) {
  return findCommentRanges(content, computeLineOffsets(content));
}

describe("findCommentRanges", () => {
  it("detects single-line comment", () => {
    const md = "line 1\n<!-- a comment -->\nline 3\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("detects multi-line comment", () => {
    const md = "line 1\n<!--\n  some\n  text\n-->\nline 6\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 5 }]);
  });

  it("detects multiple comments", () => {
    const md = "line 1\n<!-- a -->\nline 3\n<!-- b -->\nline 5\n";
    expect(ranges(md)).toEqual([
      { start_line: 2, end_line: 2 },
      { start_line: 4, end_line: 4 },
    ]);
  });

  it("ignores HTML-comment-looking text inside fenced code blocks", () => {
    const md =
      "# real\n```\n<!-- not a real comment -->\n```\n<!-- real comment -->\n";
    const r = ranges(md);
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ start_line: 5, end_line: 5 });
  });

  it("returns empty array for content without comments", () => {
    expect(ranges("just text\n# heading\n")).toEqual([]);
  });

  it("handles PDF page markers (multiple, consecutive)", () => {
    const md =
      "<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\n## Heading\n";
    expect(ranges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 3, end_line: 3 },
    ]);
  });

  // -------- boundary cases (off-by-one regressions) --------

  it("comment on line 1 (offset 0)", () => {
    const md = "<!-- start -->\nbody\n";
    expect(ranges(md)).toEqual([{ start_line: 1, end_line: 1 }]);
  });

  it("comment on the last line without trailing newline", () => {
    const md = "body\n<!-- end -->";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("multi-line comment spanning 5 lines", () => {
    const md =
      "x\n<!-- A\nB\nC\nD\nE -->\ny\n";
    expect(ranges(md)).toEqual([{ start_line: 2, end_line: 6 }]);
  });

  it("two comments on the same line", () => {
    const md = "<!-- a --> text <!-- b -->\nnext\n";
    expect(ranges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 1, end_line: 1 },
    ]);
  });
});
