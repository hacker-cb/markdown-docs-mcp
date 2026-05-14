import { describe, it, expect } from "vitest";
import { parsePdfPageMarkers } from "../../../src/parser/pdf_pages.js";

describe("parsePdfPageMarkers", () => {
  it("finds BEGIN and END markers with line numbers", () => {
    const md =
      "line1\n<!-- PDF_PAGE_END 38 -->\n\n<!-- PDF_PAGE_BEGIN 39 -->\nline5\n";
    expect(parsePdfPageMarkers(md)).toEqual([
      { line: 2, page: 38, kind: "end" },
      { line: 4, page: 39, kind: "begin" },
    ]);
  });

  it("returns empty array when no markers", () => {
    expect(parsePdfPageMarkers("# heading\nbody\n")).toEqual([]);
  });

  it("ignores generic HTML comments", () => {
    expect(parsePdfPageMarkers("<!-- note -->\n")).toEqual([]);
  });

  it("handles whitespace variations inside marker", () => {
    const md = "<!--PDF_PAGE_BEGIN 1-->\n<!--  PDF_PAGE_END    2  -->\n";
    const result = parsePdfPageMarkers(md);
    expect(result).toHaveLength(2);
    expect(result[0]?.page).toBe(1);
    expect(result[1]?.page).toBe(2);
  });
});
