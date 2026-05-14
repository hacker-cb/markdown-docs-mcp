import type { Index, TocNode } from "../index/types.js";
import type { ViewTocInput } from "../schemas/inputs.js";
import { compactTocNodeAtDepth, type CompactTocNode } from "./_compact.js";
import { DEFAULT_CONFIG } from "../config.js";

export type ViewTocResponse = {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
    frontmatter?: Record<string, unknown>;
  };
  toc: CompactTocNode[];
  anomalies_summary: {
    total: number;
    by_type: Record<string, number>;
    hint?: string;
  };
  truncated?: true;
  effective_depth?: number;
  hint?: string;
};

/**
 * Finds a TocNode by id recursively. Returns undefined if not found.
 */
function findNodeById(nodes: TocNode[], id: string): TocNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Trims a TocNode tree to a given depth and compacts it.
 * depth=1 means: include the root node but no children.
 * depth=2 means: include root and its children but no grandchildren.
 * Nodes whose children were trimmed carry has_children=true.
 */
function trimAndCompact(nodes: TocNode[], depth: number): CompactTocNode[] {
  return nodes.map((node) => compactTocNodeAtDepth(node, depth));
}

/**
 * Builds a flat list from flat_headers for raw=true mode.
 * Each header is represented as a minimal compact node with no children.
 */
function rawFlatCompact(flat: Index["flat_headers"]): CompactTocNode[] {
  return flat.map((h) => {
    const node: CompactTocNode = {
      id: h.id,
      level: h.level,
      title: h.title,
      line: h.line,
      line_end: h.line, // in raw mode line_end is unknown — set equal to line
      section_lines: 1,
    };
    if (h.numbering !== null) {
      node.numbering = h.numbering;
    }
    return node;
  });
}

/**
 * Builds the anomalies_summary object from index anomalies.
 */
function buildAnomaliesSummary(
  index: Index,
  raw: boolean
): ViewTocResponse["anomalies_summary"] {
  const byType: Record<string, number> = {};
  if (!raw) {
    for (const a of index.anomalies) {
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }
  }
  const total = raw ? 0 : index.anomalies.length;
  return {
    total,
    by_type: byType,
    ...(total > 0 && {
      hint: "Call analyze_document for details and to discuss handling with the user.",
    }),
  };
}

/**
 * Builds the file metadata portion of the response.
 */
function buildFileMeta(index: Index): ViewTocResponse["file"] {
  return {
    path: index.file_path,
    size_bytes: index.size_bytes,
    line_count: index.line_count,
    mtime: new Date(index.mtime_ms).toISOString(),
    ...(index.frontmatter && { frontmatter: index.frontmatter }),
  };
}

export function buildViewTocResponse(
  index: Index,
  input: ViewTocInput,
  maxBytes: number = DEFAULT_CONFIG.maxViewTocBytes
): ViewTocResponse {
  const raw = input.raw === true;
  const file = buildFileMeta(index);
  const anomalies_summary = buildAnomaliesSummary(index, raw);

  // ─── raw=true mode ─────────────────────────────────────────────────────────
  if (raw) {
    const allFlat = rawFlatCompact(index.flat_headers);
    // Try to fit within cap
    const response: ViewTocResponse = { file, toc: allFlat, anomalies_summary };
    const bytes = Buffer.byteLength(JSON.stringify(response), "utf8");
    if (bytes <= maxBytes) {
      return response;
    }
    // Take a prefix
    let prefix = allFlat;
    for (let n = allFlat.length - 1; n >= 1; n--) {
      prefix = allFlat.slice(0, n);
      const candidate: ViewTocResponse = {
        file,
        toc: prefix,
        anomalies_summary,
        truncated: true,
        effective_depth: 1,
        hint: `Document has too many headers (${allFlat.length}). Returned first ${n}. Use start_id to navigate further.`,
      };
      if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
        return candidate;
      }
    }
    // Absolute fallback — empty toc (should never happen in practice)
    return {
      file,
      toc: [],
      anomalies_summary,
      truncated: true,
      effective_depth: 1,
      hint: `Document has too many headers to list even a prefix (${allFlat.length} total).`,
    };
  }

  // ─── Resolve effective subtree root ────────────────────────────────────────
  let subtree: TocNode[];
  if (input.start_id !== undefined) {
    const node = findNodeById(index.toc, input.start_id);
    if (!node) {
      const err = new Error(
        `Unknown section id "${input.start_id}". Use view_toc without start_id to list root sections.`
      );
      (err as Error & { code: string }).code = "UNKNOWN_SECTION_ID";
      throw err;
    }
    subtree = node.children;
  } else {
    subtree = index.toc;
  }

  // ─── Iterative depth reduction ──────────────────────────────────────────────
  const requested = input.depth ?? 6;

  for (let d = requested; d >= 1; d--) {
    const trimmed = trimAndCompact(subtree, d);
    const candidate: ViewTocResponse = { file, toc: trimmed, anomalies_summary };
    const bytes = Buffer.byteLength(JSON.stringify(candidate), "utf8");
    if (bytes <= maxBytes) {
      if (d < requested) {
        return {
          ...candidate,
          truncated: true,
          effective_depth: d,
          hint: `Tree trimmed from depth ${requested} to ${d}; use start_id=<a leaf id> to drill deeper.`,
        };
      }
      return candidate;
    }
  }

  // ─── Even depth=1 too large — take prefix of root nodes ────────────────────
  const rootsAtDepth1 = trimAndCompact(subtree, 1);
  const total = rootsAtDepth1.length;

  for (let n = total - 1; n >= 1; n--) {
    const prefix = rootsAtDepth1.slice(0, n);
    const candidate: ViewTocResponse = {
      file,
      toc: prefix,
      anomalies_summary,
      truncated: true,
      effective_depth: 1,
      hint: `Document has too many root sections (${total}). Returned first ${n}. Use start_id to navigate further.`,
    };
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= maxBytes) {
      return candidate;
    }
  }

  // Absolute fallback — empty toc
  return {
    file,
    toc: [],
    anomalies_summary,
    truncated: true,
    effective_depth: 1,
    hint: `Document has too many root sections (${total}). None fit within the cap.`,
  };
}
