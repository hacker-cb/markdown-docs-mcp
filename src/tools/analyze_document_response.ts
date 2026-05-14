import type { Index } from "../index/types.js";
import type { Anomaly } from "../anomalies/types.js";
import type { AnalyzeDocumentInput } from "../schemas/inputs.js";

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type LogicalEffect = {
  if_treated_as_artifact: {
    section_extended: string;
    extension: string;
  };
};

export type EnrichedAnomaly = Anomaly & {
  logical_effect?: LogicalEffect;
};

export type AnalyzeDocumentResponse = {
  file: {
    path: string;
    size_bytes: number;
    line_count: number;
    mtime: string;
  };
  summary: string;
  anomalies: EnrichedAnomaly[];
  by_type: Record<string, number>;
};

// ---------------------------------------------------------------------------
// Logical-effect enrichment for self_nesting anomalies
// ---------------------------------------------------------------------------

/**
 * Computes the logical_effect for a single self_nesting_header anomaly.
 *
 * The preceding_real_header is the "real owner" whose section is artificially
 * truncated by the artifact. If we treat the artifact as absorbed, the
 * preceding section logically extends until the next non-artifact header
 * whose level is <= the preceding header's level.
 *
 * Returns undefined if enrichment is not possible (e.g. no preceding header).
 */
function computeLogicalEffect(
  anomaly: Anomaly,
  index: Index
): LogicalEffect | undefined {
  const preceding = anomaly.context.preceding_real_header;
  if (!preceding) return undefined;

  // Find the TocNode for the preceding real header by line
  const precedingNode = index.node_by_id.get(`s${preceding.line}`);
  if (!precedingNode) return undefined;

  // The artifact node
  const artifactNode = index.node_by_id.get(anomaly.node_id);

  // Determine section_extended label. Strip the leading numbering token
  // from title before re-prepending `numbering` to avoid duplication.
  // Covers numeric (4.1.1.2), alphabetic (A, AB) and Annex (Annex A.1) forms.
  const label = precedingNode.numbering
    ? `${precedingNode.numbering} ${precedingNode.title
        .replace(/^Annex\s+[A-Z](\.\d+)*\s+/, "")
        .replace(/^\d+(\.\d+)*\s+/, "")
        .replace(/^[A-Z]+(\.\d+)*\s+/, "")}`
    : precedingNode.title;
  const section_extended = `${precedingNode.id} (${label})`;

  // Raw line_end of the preceding section (before artifact absorb)
  const rawLineEnd = precedingNode.line_end;
  const rawLines = rawLineEnd - precedingNode.line + 1;

  // Walk flat_headers after the anomaly line, skip artifact nodes, find
  // the first non-artifact header with level <= preceding.level.
  // That header's line - 1 becomes the new logical end.
  const artifactLine = anomaly.line;
  let newLineEnd: number | null = null;

  for (const fh of index.flat_headers) {
    if (fh.line <= artifactLine) continue;

    // Check if this header is an artifact
    const node = index.node_by_id.get(fh.id);
    const isArtifact = node?.is_likely_artifact ?? false;
    if (isArtifact) continue;

    // First non-artifact with level <= preceding.level
    if (fh.level <= preceding.level) {
      newLineEnd = fh.line - 1;
      break;
    }
  }

  // If no such header found, logical end is end of file
  if (newLineEnd === null) {
    newLineEnd = index.line_count;
  }

  const newLines = newLineEnd - precedingNode.line + 1;
  const extension = `L${precedingNode.line}-L${rawLineEnd} (${rawLines} lines) -> L${precedingNode.line}-L${newLineEnd} (${newLines} lines)`;

  return {
    if_treated_as_artifact: {
      section_extended,
      extension,
    },
  };
}

// ---------------------------------------------------------------------------
// Summary builder
// ---------------------------------------------------------------------------

function buildSummary(anomalies: Anomaly[], byType: Record<string, number>): string {
  const total = anomalies.length;
  if (total === 0) {
    return "No structural anomalies detected. Hierarchy is clean.";
  }

  const parts: string[] = [];
  for (const [type, count] of Object.entries(byType)) {
    if (count > 0) {
      parts.push(`${count} ${type}`);
    }
  }

  const typeList = parts.join(", ");
  let summary = `Document has ${total} likely structural anomalies (${typeList}).`;

  if ((byType["self_nesting_header"] ?? 0) > 0) {
    summary +=
      " self_nesting_header anomalies are often PDF-conversion artifacts; check adjacent_pdf_markers in each entry.";
  }

  summary +=
    " analyze_document is DESCRIPTIVE — apply fixes only after agreeing with the user.";

  return summary;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function buildAnalyzeDocumentResponse(
  index: Index,
  _input: AnalyzeDocumentInput
): AnalyzeDocumentResponse {
  // Build by_type counts
  const byType: Record<string, number> = {};
  for (const anomaly of index.anomalies) {
    byType[anomaly.type] = (byType[anomaly.type] ?? 0) + 1;
  }

  // Enrich anomalies: add logical_effect to self_nesting_header type
  const enriched: EnrichedAnomaly[] = index.anomalies.map((anomaly) => {
    if (anomaly.type !== "self_nesting_header") {
      return anomaly;
    }
    const logical_effect = computeLogicalEffect(anomaly, index);
    if (logical_effect === undefined) {
      return anomaly;
    }
    return { ...anomaly, logical_effect };
  });

  const summary = buildSummary(index.anomalies, byType);

  const mtime = new Date(index.mtime_ms).toISOString();

  return {
    file: {
      path: index.file_path,
      size_bytes: index.size_bytes,
      line_count: index.line_count,
      mtime,
    },
    summary,
    anomalies: enriched,
    by_type: byType,
  };
}
