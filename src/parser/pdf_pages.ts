export type PdfMarker = {
  line: number;
  page: number;
  kind: "begin" | "end";
};

const RE = /<!--\s*PDF_PAGE_(BEGIN|END)\s+(\d+)\s*-->/g;

export function parsePdfPageMarkers(content: string): PdfMarker[] {
  RE.lastIndex = 0;
  const result: PdfMarker[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE.exec(content)) !== null) {
    const offset = match.index;
    // count newlines up to offset to get 1-based line
    let line = 1;
    for (let i = 0; i < offset; i++) {
      if (content.charCodeAt(i) === 10) line++;
    }
    const kind = match[1] === "BEGIN" ? "begin" : "end";
    const page = parseInt(match[2]!, 10);
    result.push({ line, page, kind });
  }
  return result;
}
