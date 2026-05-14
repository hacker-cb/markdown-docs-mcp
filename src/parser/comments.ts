import MarkdownIt from "markdown-it";

export type CommentRange = {
  start_line: number;
  end_line: number;
};

const md = new MarkdownIt({ html: true });

function lineOfOffset(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset; i++) {
    if (content.charCodeAt(i) === 10 /* \n */) line++;
  }
  return line;
}

function getCodeBlockRanges(content: string): Array<{ start: number; end: number }> {
  const tokens = md.parse(content, {});
  const ranges: Array<{ start: number; end: number }> = [];
  for (const tok of tokens) {
    if ((tok.type === "fence" || tok.type === "code_block") && tok.map) {
      // map is 0-based: [startLine, endLine) — endLine is exclusive
      // convert to 1-based inclusive range
      ranges.push({ start: tok.map[0] + 1, end: tok.map[1] });
    }
  }
  return ranges;
}

export function findCommentRanges(content: string): CommentRange[] {
  const codeRanges = getCodeBlockRanges(content);
  const re = /<!--[\s\S]*?-->/g;
  const result: CommentRange[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const start_line = lineOfOffset(content, match.index);
    const end_line = lineOfOffset(content, match.index + match[0].length - 1);
    const insideCode = codeRanges.some(
      (cr) => start_line >= cr.start && end_line <= cr.end
    );
    if (!insideCode) {
      result.push({ start_line, end_line });
    }
  }
  return result;
}
