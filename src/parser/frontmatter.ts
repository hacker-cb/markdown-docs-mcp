import matter from "gray-matter";

export type FrontmatterResult = {
  data: Record<string, unknown> | undefined;
  body: string;
  body_start_line: number;
};

export function parseFrontmatter(content: string): FrontmatterResult {
  if (!content.startsWith("---")) {
    return { data: undefined, body: content, body_start_line: 1 };
  }
  try {
    const parsed = matter(content);
    const data = parsed.data;
    // Only object-shaped data counts as frontmatter. YAML scalars/arrays
    // and empty objects are treated as "no frontmatter" so the result
    // contract (Record<string, unknown> | undefined) holds.
    const isPlainObject =
      data !== null &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      Object.keys(data).length > 0;
    if (!isPlainObject) {
      return { data: undefined, body: content, body_start_line: 1 };
    }
    const consumed = content.length - parsed.content.length;
    const linesConsumed = content.slice(0, consumed).split("\n").length - 1;
    return {
      data: data as Record<string, unknown>,
      body: parsed.content,
      body_start_line: linesConsumed + 1,
    };
  } catch {
    return { data: undefined, body: content, body_start_line: 1 };
  }
}
