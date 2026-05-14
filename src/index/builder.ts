import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { parsePdfPageMarkers } from "../parser/pdf_pages.js";
import { buildTocTree } from "./reparenting.js";
import { detectAnomalies } from "../anomalies/detector.js";
import type { FlatHeader, Index, TocNode } from "./types.js";
import type { PdfMarker } from "../parser/pdf_pages.js";

function stripBOM(s: string): string {
  return s.length > 0 && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

function assignPdfPages(nodes: TocNode[], markers: PdfMarker[]): void {
  for (const node of nodes) {
    const pages = [
      ...new Set(
        markers
          .filter((m) => m.line >= node.line && m.line <= node.line_end)
          .map((m) => m.page)
      ),
    ].sort((a, b) => a - b);
    if (pages.length > 0) {
      node.pdf_pages = pages;
    }
    if (node.children.length > 0) {
      assignPdfPages(node.children, markers);
    }
  }
}

function findNodeById(nodes: TocNode[], id: string): TocNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return undefined;
}

export async function buildIndex(filePath: string): Promise<Index> {
  const stats = await stat(filePath);
  const raw = stripBOM(await readFile(filePath, "utf8"));
  const fm = parseFrontmatter(raw);
  const headingsInBody = extractHeadings(fm.body);
  const bodyOffset = fm.body_start_line - 1;

  const flat: FlatHeader[] = headingsInBody.map((h) => {
    const absoluteLine = h.line + bodyOffset;
    return {
      id: `s${absoluteLine}`,
      level: h.level,
      title: h.title,
      numbering: extractNumbering(h.title),
      line: absoluteLine,
    };
  });

  const comment_ranges = findCommentRanges(raw);
  const line_offsets = computeLineOffsets(raw);
  const line_count = line_offsets.length;
  const toc = buildTocTree(flat, line_count);

  // Step 1: parse PDF page markers
  const pdf_markers = parsePdfPageMarkers(raw);

  // Step 2: assign pdf_pages to each TocNode based on markers in range
  assignPdfPages(toc, pdf_markers);

  // Step 3: build a temp index to run anomaly detection
  const tempIndex: Index = {
    file_path: filePath,
    size_bytes: stats.size,
    mtime_ms: stats.mtimeMs,
    line_count,
    raw_content: raw,
    line_offsets,
    toc,
    flat_headers: flat,
    comment_ranges,
    frontmatter: fm.data,
    anomalies: [],
    pdf_markers,
  };

  const anomalies = detectAnomalies(tempIndex);

  // Step 4: flag self-nesting nodes
  for (const anomaly of anomalies) {
    if (anomaly.type === "self_nesting_header") {
      const node = findNodeById(toc, anomaly.node_id);
      if (node) {
        node.is_likely_artifact = true;
        const ancestor = anomaly.context.duplicates_open_ancestor;
        node.artifact_reason = ancestor
          ? `self_nesting: title duplicates open ancestor at L${ancestor.line}`
          : "self_nesting: title duplicates open ancestor";
      }
    }
  }

  return {
    file_path: filePath,
    size_bytes: stats.size,
    mtime_ms: stats.mtimeMs,
    line_count,
    raw_content: raw,
    line_offsets,
    toc,
    flat_headers: flat,
    comment_ranges,
    frontmatter: fm.data,
    anomalies,
    pdf_markers,
  };
}
