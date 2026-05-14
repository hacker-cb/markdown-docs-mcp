import { lineOfOffsetBinary } from "./_line_offsets.js";

export type PdfMarker = {
  line: number;
  page: number;
  kind: "begin" | "end";
};

const RE = /<!--\s*PDF_PAGE_(BEGIN|END)\s+(\d+)\s*-->/g;

export function parsePdfPageMarkers(
  content: string,
  lineOffsets: number[]
): PdfMarker[] {
  RE.lastIndex = 0;
  const result: PdfMarker[] = [];
  let match: RegExpExecArray | null;
  while ((match = RE.exec(content)) !== null) {
    const line = lineOfOffsetBinary(lineOffsets, match.index);
    const kind = match[1] === "BEGIN" ? "begin" : "end";
    const page = parseInt(match[2]!, 10);
    result.push({ line, page, kind });
  }
  return result;
}
