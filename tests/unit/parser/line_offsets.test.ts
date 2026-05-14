import { describe, it, expect } from "vitest";
import {
  computeLineOffsets,
  lineOfOffsetBinary,
} from "../../../src/parser/_line_offsets.js";

describe("computeLineOffsets", () => {
  it("returns [0] for empty content", () => {
    expect(computeLineOffsets("")).toEqual([0]);
  });

  it("counts each newline", () => {
    // "a\nb\nc" -> lines start at 0, 2, 4
    expect(computeLineOffsets("a\nb\nc")).toEqual([0, 2, 4]);
  });

  it("trailing newline produces an extra entry", () => {
    expect(computeLineOffsets("a\nb\n")).toEqual([0, 2, 4]);
  });
});

describe("lineOfOffsetBinary", () => {
  // content: "a\nbc\ndef\n"
  // chars:    0 1 234 5678
  // line:     1   2   3
  const offsets = computeLineOffsets("a\nbc\ndef\n");
  // offsets = [0, 2, 5, 9]

  it("empty content (offsets = [0]) -> offset 0 returns line 1", () => {
    const offsets = computeLineOffsets("");
    expect(lineOfOffsetBinary(offsets, 0)).toBe(1);
  });

  it("offset 0 -> line 1", () => {
    expect(lineOfOffsetBinary(offsets, 0)).toBe(1);
  });

  it("offset 1 (the \\n at end of line 1) -> line 1", () => {
    expect(lineOfOffsetBinary(offsets, 1)).toBe(1);
  });

  it("offset 2 (start of line 2) -> line 2", () => {
    expect(lineOfOffsetBinary(offsets, 2)).toBe(2);
  });

  it("offset 4 (the \\n at end of line 2) -> line 2", () => {
    expect(lineOfOffsetBinary(offsets, 4)).toBe(2);
  });

  it("offset 5 (start of line 3) -> line 3", () => {
    expect(lineOfOffsetBinary(offsets, 5)).toBe(3);
  });

  it("offset 8 (last char of line 3) -> line 3", () => {
    expect(lineOfOffsetBinary(offsets, 8)).toBe(3);
  });
});
