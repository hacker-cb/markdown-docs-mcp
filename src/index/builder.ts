import { readFile, stat } from "node:fs/promises";
import { extractHeadings } from "../parser/markdown.js";
import { findCommentRanges } from "../parser/comments.js";
import { parseFrontmatter } from "../parser/frontmatter.js";
import { extractNumbering } from "../parser/numbering.js";
import { parsePdfPageMarkers } from "../parser/pdf_pages.js";
import { buildTocTree } from "./reparenting.js";
import { detectAnomalies } from "../anomalies/detector.js";
import type { FlatHeader, FlatSeed, Index, TocNode } from "./types.js";

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

  // Two-phase flat construction. We need a minimal flat list to build the
  // toc tree (which is what assigns line_end / section_lines to each node),
  // then we walk the resulting tree to enrich flat[] with those fields. The
  // walk preserves document order so flat[i] still lines up with the i-th
  // heading in the source.
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

  const comment_ranges = findCommentRanges(raw);
  const line_offsets = computeLineOffsets(raw);
  const line_count = line_offsets.length;
  const toc = buildTocTree(flatSeeds, line_count);

  // Walk the tree in document order, collecting line_end / section_lines.
  // Both reparenting and raw flat preserve document order, so the recovered
  // ranges align with the seed array by id.
  const ranges = new Map<string, { line_end: number; section_lines: number }>();
  function collectRanges(nodes: TocNode[]): void {
    for (const node of nodes) {
      ranges.set(node.id, {
        line_end: node.line_end,
        section_lines: node.section_lines,
      });
      collectRanges(node.children);
    }
  }
  collectRanges(toc);
  // Every seed id must appear in the tree by construction (buildTocTree
  // consumes the same seeds it labels). A miss here would mean the tree
  // dropped a node — silently falling back to the line-only placeholder
  // would resurrect exactly the bug this enrichment exists to prevent.
  const flat: FlatHeader[] = flatSeeds.map((seed) => {
    const r = ranges.get(seed.id);
    if (r === undefined) {
      throw new Error(
        `Internal invariant violation: TocNode for FlatSeed id "${seed.id}" (line ${seed.line}) not found in tree. buildTocTree likely dropped a header.`
      );
    }
    return { ...seed, ...r };
  });

  // Step 1: parse PDF page markers (needed for adjacent_pdf_markers in anomaly detection)
  const pdf_markers = parsePdfPageMarkers(raw);

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
