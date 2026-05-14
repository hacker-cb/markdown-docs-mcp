import { describe, it, expect } from "vitest";
import { extractHeadings } from "../../../src/parser/markdown.js";

describe("extractHeadings", () => {
  it("extracts simple ATX headings with levels and lines", () => {
    const md = "# H1\n\n## H2\n\n### H3\n";
    const result = extractHeadings(md);
    expect(result).toEqual([
      { level: 1, title: "H1", line: 1 },
      { level: 2, title: "H2", line: 3 },
      { level: 3, title: "H3", line: 5 },
    ]);
  });

  it("supports levels 1-6", () => {
    const md = "# 1\n## 2\n### 3\n#### 4\n##### 5\n###### 6\n";
    expect(extractHeadings(md).map((h) => h.level)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("strips inline markdown from titles", () => {
    const md = "# **Important**: Setup\n\n## Code: `x`\n\n### Link: [text](url)\n";
    expect(extractHeadings(md).map((h) => h.title)).toEqual([
      "Important: Setup",
      "Code: x",
      "Link: text",
    ]);
  });

  it("preserves unicode titles literally", () => {
    const md = "## 4.1 RISC-V Trace Encoder (TRACE)\n\n## Введение\n";
    const result = extractHeadings(md);
    expect(result[0]?.title).toBe("4.1 RISC-V Trace Encoder (TRACE)");
    expect(result[1]?.title).toBe("Введение");
  });

  it("ignores hash-like lines inside fenced code blocks", () => {
    const md = "# real\n\n```\n# not a heading\n```\n\n## real2\n";
    const result = extractHeadings(md);
    expect(result.map((h) => h.title)).toEqual(["real", "real2"]);
  });

  it("returns empty array for content with no headings", () => {
    expect(extractHeadings("just text\nmore text\n")).toEqual([]);
  });
});
