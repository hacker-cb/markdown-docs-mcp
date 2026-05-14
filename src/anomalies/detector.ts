import type { Index, TocNode } from "../index/types.js";
import type { Anomaly, AnomalyType } from "./types.js";

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function walkWithAncestors(
  nodes: TocNode[],
  ancestors: TocNode[],
  visit: (node: TocNode, ancestors: TocNode[]) => void
): void {
  for (const node of nodes) {
    visit(node, ancestors);
    walkWithAncestors(node.children, [...ancestors, node], visit);
  }
}

function adjacentMarkers(
  anomalyLine: number,
  pdfMarkers: Index["pdf_markers"]
): string[] {
  return pdfMarkers
    .filter((m) => Math.abs(m.line - anomalyLine) <= 3)
    .map(
      (m) =>
        `L${m.line} PDF_PAGE_${m.kind === "begin" ? "BEGIN" : "END"} ${m.page}`
    );
}

export function detectAnomalies(index: Index): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const flat = index.flat_headers;

  const push = (a: Omit<Anomaly, "id">) => {
    anomalies.push({ ...a, id: `a${anomalies.length + 1}` });
  };

  // 1. self_nesting via tree walk
  walkWithAncestors(index.toc, [], (node, ancestors) => {
    const normalizedTitle = normalizeWhitespace(node.title);
    const dup = [...ancestors]
      .reverse()
      .find((a) => normalizeWhitespace(a.title) === normalizedTitle);
    if (dup) {
      const i = index.flat_index_by_id.get(node.id) ?? -1;
      const preceding = i > 0 ? flat[i - 1] : undefined;
      const following = i + 1 < flat.length ? flat[i + 1] : undefined;
      push({
        type: "self_nesting_header",
        line: node.line,
        raw_text: `${"#".repeat(node.level)} ${node.title}`,
        node_id: node.id,
        context: {
          duplicates_open_ancestor: {
            line: dup.line,
            title: dup.title,
            level: dup.level,
          },
          ...(preceding && {
            preceding_real_header: {
              line: preceding.line,
              title: preceding.title,
              level: preceding.level,
            },
          }),
          ...(following && {
            following_real_header: {
              line: following.line,
              title: following.title,
              level: following.level,
            },
          }),
          adjacent_pdf_markers: adjacentMarkers(node.line, index.pdf_markers),
        },
        description: `Header on L${node.line} duplicates open ancestor at L${dup.line} ('${dup.title}'). Likely a PDF-conversion artifact (page header captured as a markdown heading).`,
      });
    }
  });

  // 2. level_jump on flat list (gap > 1 between consecutive headers)
  for (let i = 1; i < flat.length; i++) {
    const prev = flat[i - 1]!;
    const cur = flat[i]!;
    if (cur.level - prev.level > 1) {
      push({
        type: "level_jump",
        line: cur.line,
        raw_text: `${"#".repeat(cur.level)} ${cur.title}`,
        node_id: cur.id,
        context: {
          preceding_real_header: {
            line: prev.line,
            title: prev.title,
            level: prev.level,
          },
          adjacent_pdf_markers: adjacentMarkers(cur.line, index.pdf_markers),
        },
        description: `Heading level jumped from h${prev.level} to h${cur.level} between L${prev.line} and L${cur.line}.`,
      });
    }
  }

  // 3. orphan_subheader (first header level > 1)
  if (flat.length > 0 && flat[0]!.level > 1) {
    const first = flat[0]!;
    push({
      type: "orphan_subheader",
      line: first.line,
      raw_text: `${"#".repeat(first.level)} ${first.title}`,
      node_id: first.id,
      context: {
        adjacent_pdf_markers: adjacentMarkers(first.line, index.pdf_markers),
      },
      description: `First heading in the document is h${first.level} (expected h1). Often legitimate (e.g. document title comes from filename), informational only.`,
    });
  }

  // 4. empty_section (line_end === line)
  walkWithAncestors(index.toc, [], (node) => {
    if (node.line_end === node.line) {
      push({
        type: "empty_section",
        line: node.line,
        raw_text: `${"#".repeat(node.level)} ${node.title}`,
        node_id: node.id,
        context: {
          adjacent_pdf_markers: adjacentMarkers(node.line, index.pdf_markers),
        },
        description: `Heading on L${node.line} has no content (next heading immediately follows).`,
      });
    }
  });

  // 5. consecutive_pair_header (pdf2md-style double headings)
  const PAIR_MARKER_RE = /^(Chapter|Part|Section|Appendix)\s+([0-9IVX]+|[A-Z])$/i;

  for (let i = 0; i < flat.length - 1; i++) {
    const cur = flat[i]!;
    const next = flat[i + 1]!;
    if (
      cur.level === next.level &&
      next.line - cur.line <= 3 &&
      PAIR_MARKER_RE.test(cur.title.trim())
    ) {
      push({
        type: "consecutive_pair_header",
        line: cur.line,
        raw_text: `${"#".repeat(cur.level)} ${cur.title}`,
        node_id: cur.id,
        context: {
          paired_with: { line: next.line, title: next.title, level: next.level },
          adjacent_pdf_markers: adjacentMarkers(cur.line, index.pdf_markers),
        },
        description: `Generic marker "${cur.title}" on L${cur.line} is followed by content header "${next.title}" on L${next.line} at the same level. Likely a pdf2md-style double heading where the marker can be absorbed into the content header.`,
      });
    }
  }

  return anomalies;
}

export type { Anomaly, AnomalyType };
