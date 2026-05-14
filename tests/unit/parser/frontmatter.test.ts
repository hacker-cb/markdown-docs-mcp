import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "../../../src/parser/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter", () => {
    const md = "---\ntitle: Foo\nversion: 1\n---\n\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toEqual({ title: "Foo", version: 1 });
    expect(result.body).toBe("\n# Body\n");
    expect(result.body_start_line).toBe(5);
  });

  it("returns undefined data and full content when no frontmatter", () => {
    const md = "# Heading\nbody\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("does not interpret mid-document `---` as frontmatter", () => {
    const md = "# Heading\n\n---\n\nNext section\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("returns gracefully on malformed YAML", () => {
    const md = "---\nthis: is: malformed: : :\n---\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("treats YAML scalar (non-object) as no frontmatter", () => {
    const md = "---\nplain text\n---\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });

  it("treats YAML array as no frontmatter", () => {
    const md = "---\n- one\n- two\n---\n# Body\n";
    const result = parseFrontmatter(md);
    expect(result.data).toBeUndefined();
    expect(result.body).toBe(md);
    expect(result.body_start_line).toBe(1);
  });
});
