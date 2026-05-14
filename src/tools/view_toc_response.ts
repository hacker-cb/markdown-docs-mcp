import type { Index, TocNode, FlatHeader } from "../index/types.js";
import type { ViewTocInput } from "../schemas/inputs.js";

type ResponseTocNode = Omit<TocNode, "children"> & { children: ResponseTocNode[] };

export type ViewTocResponse = {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
    frontmatter?: Record<string, unknown>;
  };
  toc: ResponseTocNode[];
  anomalies_summary: {
    total: number;
    by_type: Record<string, number>;
    hint?: string;
  };
};

function trimToDepth(
  node: TocNode,
  currentDepth: number,
  maxDepth: number | null
): ResponseTocNode {
  const children =
    maxDepth !== null && currentDepth >= maxDepth
      ? []
      : node.children.map((c) => trimToDepth(c, currentDepth + 1, maxDepth));
  return { ...node, children };
}

function rawFlatToc(flat: FlatHeader[]): ResponseTocNode[] {
  return flat.map((h) => ({
    id: h.id,
    level: h.level,
    title: h.title,
    numbering: h.numbering,
    line: h.line,
    line_end: h.line, // in raw mode line_end is unknown — set equal to line
    section_lines: 1,
    is_likely_artifact: false,
    children: [],
  }));
}

export function buildViewTocResponse(
  index: Index,
  input: ViewTocInput
): ViewTocResponse {
  const raw = input.raw === true;
  const depth = input.depth ?? null;

  const tocOut: ResponseTocNode[] = raw
    ? rawFlatToc(index.flat_headers)
    : index.toc.map((n) => trimToDepth(n, 1, depth));

  const byType: Record<string, number> = {};
  if (!raw) {
    for (const a of index.anomalies) {
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }
  }
  const total = raw ? 0 : index.anomalies.length;

  return {
    file: {
      path: index.file_path,
      size_bytes: index.size_bytes,
      line_count: index.line_count,
      mtime: new Date(index.mtime_ms).toISOString(),
      ...(index.frontmatter && { frontmatter: index.frontmatter }),
    },
    toc: tocOut,
    anomalies_summary: {
      total,
      by_type: byType,
      ...(total > 0 && {
        hint: "Call analyze_document for details and to discuss handling with the user.",
      }),
    },
  };
}
