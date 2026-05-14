import MarkdownIt from "markdown-it";

export type ParsedHeading = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  line: number;
};

const md = new MarkdownIt({ html: true });

// Token type derived from the library's parse() return type
type MdToken = ReturnType<typeof md.parse>[number];

function extractPlainText(children: MdToken[]): string {
  let result = "";
  for (const child of children) {
    if (child.type === "text" || child.type === "code_inline") {
      result += child.content;
    } else if (child.children) {
      result += extractPlainText(child.children);
    }
  }
  return result;
}

export function extractHeadings(content: string): ParsedHeading[] {
  const tokens = md.parse(content, {});
  const result: ParsedHeading[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok || tok.type !== "heading_open") continue;
    const levelDigit = Number(tok.tag.slice(1)); // h1 -> 1
    if (!Number.isInteger(levelDigit) || levelDigit < 1 || levelDigit > 6) continue;
    const line = (tok.map?.[0] ?? 0) + 1;
    const inline = tokens[i + 1];
    const title =
      inline && inline.type === "inline" && inline.children
        ? extractPlainText(inline.children)
        : "";
    result.push({
      level: levelDigit as 1 | 2 | 3 | 4 | 5 | 6,
      title: title.trim(),
      line,
    });
  }
  return result;
}
