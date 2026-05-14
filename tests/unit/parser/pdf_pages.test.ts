import { describe, it, expect } from "vitest";
import { parsePdfPageMarkers } from "../../../src/parser/pdf_pages.js";
import { computeLineOffsets } from "../../../src/parser/_line_offsets.js";

function markers(content: string) {
  return parsePdfPageMarkers(content, computeLineOffsets(content));
}

describe("parsePdfPageMarkers", () => {
  it("finds BEGIN and END markers with line numbers", () => {
    const md =
      "line1\n<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\nline5\n";
    expect(markers(md)).toEqual([
      { line: 2, page: 38, kind: "end" },
      { line: 4, page: 39, kind: "begin" },
    ]);
  });

  it("returns empty array when no markers", () => {
    expect(markers("# heading\nbody\n")).toEqual([]);
  });

  it("ignores generic HTML comments", () => {
    expect(markers("<!-- note -->\n")).toEqual([]);
  });

  it("handles whitespace variations inside marker", () => {
    const md = "<!--PDF_PAGE_BEGIN 1-->\n<!--  PDF_PAGE_END    2  -->\n";
    const result = markers(md);
    expect(result).toHaveLength(2);
    expect(result[0]?.page).toBe(1);
    expect(result[1]?.page).toBe(2);
  });

  // -------- boundary cases --------

  it("marker on line 1 (offset 0)", () => {
    const md = "<!-- PDF_PAGE_BEGIN 1 -->\nbody\n";
    expect(markers(md)).toEqual([{ line: 1, page: 1, kind: "begin" }]);
  });

  it("marker on the last line without trailing newline", () => {
    const md = "body\n<!-- PDF_PAGE_END 9 -->";
    expect(markers(md)).toEqual([{ line: 2, page: 9, kind: "end" }]);
  });

  it("two markers in immediate succession", () => {
    const md =
      "<!-- PDF_PAGE_END 1 --><!-- PDF_PAGE_BEGIN 2 -->\nbody\n";
    expect(markers(md)).toEqual([
      { line: 1, page: 1, kind: "end" },
      { line: 1, page: 2, kind: "begin" },
    ]);
  });
});
