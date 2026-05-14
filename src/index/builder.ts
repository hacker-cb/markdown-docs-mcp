import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { parsePdfPageMarkers } from "../parser/pdf_pages.js";
import { computeLineOffsets } from "../parser/_line_offsets.js";
import { buildTocTree } from "./reparenting.js";
import { detectAnomalies } from "../anomalies/detector.js";
import type { FlatSeed, Index, TocNode } from "./types.js";

function stripBOM(s: string): string {
  return s.length > 0 && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
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

  // Compute line_offsets up front — both parsers will use it for O(log N) line lookup.
  const line_offsets = computeLineOffsets(raw);
  const line_count = line_offsets.length;

  const headingsInBody = extractHeadings(fm.body);
  const bodyOffset = fm.body_start_line - 1;

  // Build minimal flat seeds; buildTocTree returns both the tree and an
  // already-enriched flat array (line_end / section_lines filled in one pass).
  const flatSeeds: FlatSeed[] = headingsInBody.map((h) => {
    const absoluteLine = h.line + bodyOffset;
    return {
      id: `s${absoluteLine}`,
      level: h.level,
      title: h.title,
      numbering: extractNumbering(h.title),
      line: absoluteLine,
    };
  });

  const comment_ranges = findCommentRanges(raw, line_offsets);
  const { roots: toc, flat } = buildTocTree(flatSeeds, line_count);

  // Step 1: parse PDF page markers (needed for adjacent_pdf_markers in anomaly detection)
  const pdf_markers = parsePdfPageMarkers(raw, line_offsets);

  // Step 2: build a temp index to run anomaly detection
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

  // Step 4: flag self-nesting and consecutive_pair_header nodes as likely artifacts
  for (const anomaly of anomalies) {
    if (
      anomaly.type === "self_nesting_header" ||
      anomaly.type === "consecutive_pair_header"
    ) {
      const node = findNodeById(toc, anomaly.node_id);
      if (node) {
        node.is_likely_artifact = true;
        if (anomaly.type === "self_nesting_header") {
          const ancestor = anomaly.context.duplicates_open_ancestor;
          node.artifact_reason = ancestor
            ? `self_nesting: title duplicates open ancestor at L${ancestor.line}`
            : "self_nesting: title duplicates open ancestor";
        } else {
          const paired = anomaly.context.paired_with;
          node.artifact_reason = paired
            ? `consecutive_pair_header: paired with "${paired.title}" at L${paired.line}`
            : "consecutive_pair_header";
        }
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
