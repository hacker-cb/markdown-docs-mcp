import { describe, it, expect } from "vitest";
import { findCommentRanges } from "../../../src/parser/comments.js";

describe("findCommentRanges", () => {
  it("detects single-line comment", () => {
    const md = "line 1\n<!-- a comment -->\nline 3\n";
    expect(findCommentRanges(md)).toEqual([{ start_line: 2, end_line: 2 }]);
  });

  it("detects multi-line comment", () => {
    const md = "line 1\n<!--\n  some\n  text\n-->\nline 6\n";
    expect(findCommentRanges(md)).toEqual([{ start_line: 2, end_line: 5 }]);
  });

  it("detects multiple comments", () => {
    const md = "line 1\n<!-- a -->\nline 3\n<!-- b -->\nline 5\n";
    expect(findCommentRanges(md)).toEqual([
      { start_line: 2, end_line: 2 },
      { start_line: 4, end_line: 4 },
    ]);
  });

  it("ignores HTML-comment-looking text inside fenced code blocks", () => {
    const md = "# real\n```\n<!-- not a real comment -->\n```\n<!-- real comment -->\n";
    const ranges = findCommentRanges(md);
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ start_line: 5, end_line: 5 });
  });

  it("returns empty array for content without comments", () => {
    expect(findCommentRanges("just text\n# heading\n")).toEqual([]);
  });

  it("handles PDF page markers (multiple, consecutive)", () => {
    const md =
      "<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\n## Heading\n";
    expect(findCommentRanges(md)).toEqual([
      { start_line: 1, end_line: 1 },
      { start_line: 3, end_line: 3 },
    ]);
  });
});
