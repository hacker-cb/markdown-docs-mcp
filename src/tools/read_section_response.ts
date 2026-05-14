import type { Index, TocNode } from "../index/types.js";
import type { CommentRange } from "../parser/comments.js";
import type { ReadSectionInput } from "../schemas/inputs.js";
import { compactTocNodeAtDepth, type CompactTocNode } from "./_compact.js";
import { DEFAULT_CONFIG } from "../config.js";

export type AbsorbedArtifact = {
  id: string;
  line: number;
  title: string;
  would_have_owned_lines: string;
};

export type ReadSectionResponse = {
  section: {
    id: string;
    title: string;
    level: number;
    line: number;
    line_end: number;
    numbering: string | null;
  };
  content: string;
  children?: CompactTocNode[];
  expansion?: {
    raw_line_end: number;
    logical_line_end: number;
    artifacts_absorbed: AbsorbedArtifact[];
  };
  truncated?: boolean;
  truncated_at_line?: number;
};

/**
 * Returns a substring of rawContent covering lines [fromLine..toLine] inclusive,
 * including trailing \n of toLine if present.
 * lineOffsets is 1-based: lineOffsets[i-1] = char offset of start of line i.
 */
export function extractRawRange(
  rawContent: string,
  lineOffsets: number[],
  fromLine: number,
  toLine: number
): string {
  const start = lineOffsets[fromLine - 1] ?? 0;
  // end is the start of the next line (which captures trailing \n of toLine),
  // or rawContent.length if toLine is the last line.
  const end = lineOffsets[toLine] ?? rawContent.length;
  return rawContent.slice(start, end);
}

/**
 * Computes logical line range, absorbing adjacent artifact nodes after raw_line_end.
 */
export function extractLogicalRange(
  index: Index,
  node: TocNode,
  includeSubsections: boolean
): {
  start_line: number;
  raw_line_end: number;
  logical_line_end: number;
  artifacts_absorbed: AbsorbedArtifact[];
} {
  const start_line = node.line;

  // Compute raw_line_end
  let raw_line_end: number;
  if (!includeSubsections && node.children.length > 0) {
    const firstChild = node.children[0]!;
    raw_line_end = firstChild.line - 1;
  } else {
    raw_line_end = node.line_end;
  }

  // Build a map from id to TocNode for all flat_headers — we need TocNode details.
  // We need the actual TocNode for each flat_header to check is_likely_artifact.
  // flat_headers doesn't have is_likely_artifact, so we need to find nodes in toc.
  // Build a flat map id -> TocNode from the full tree.
  const nodeById = buildNodeMap(index.toc);

  // Walk flat_headers after node's position to find nodes that start after raw_line_end.
  // Find the index of our node in flat_headers.
  const nodeIdx = index.flat_headers.findIndex((h) => h.id === node.id);

  const artifacts_absorbed: AbsorbedArtifact[] = [];
  let logical_line_end = raw_line_end;

  if (nodeIdx === -1) {
    return { start_line, raw_line_end, logical_line_end, artifacts_absorbed };
  }

  // Walk headers after our node
  for (let i = nodeIdx + 1; i < index.flat_headers.length; i++) {
    const header = index.flat_headers[i]!;
    // Only look at nodes that start after current logical_line_end
    if (header.line <= logical_line_end) {
      continue;
    }
    // There should be no gap — this header must start right after logical_line_end
    // (i.e., logical_line_end + 1 === header.line)
    if (header.line > logical_line_end + 1) {
      // There's a gap — stop
      break;
    }

    const headerNode = nodeById.get(header.id);
    if (!headerNode) break;

    if (headerNode.is_likely_artifact) {
      // Absorb this artifact
      artifacts_absorbed.push({
        id: headerNode.id,
        line: headerNode.line,
        title: headerNode.title,
        would_have_owned_lines: `L${headerNode.line}-L${headerNode.line_end}`,
      });
      logical_line_end = headerNode.line_end;
    } else {
      // Non-artifact — stop
      break;
    }
  }

  return { start_line, raw_line_end, logical_line_end, artifacts_absorbed };
}

function buildNodeMap(nodes: TocNode[]): Map<string, TocNode> {
  const map = new Map<string, TocNode>();
  for (const node of nodes) {
    map.set(node.id, node);
    const childMap = buildNodeMap(node.children);
    for (const [k, v] of childMap) {
      map.set(k, v);
    }
  }
  return map;
}

/**
 * Removes lines that fall within comment ranges from the content string.
 * Line numbers remain absolute — gaps appear where comments were removed.
 */
export function stripComments(
  content: string,
  startLine: number,
  commentRanges: CommentRange[],
  lineOffsets: number[],
  contentEndLine: number
): string {
  if (commentRanges.length === 0) return content;

  // Build set of absolute line numbers that are fully inside a comment range
  // and also within [startLine..contentEndLine].
  const commentLineSet = new Set<number>();
  for (const range of commentRanges) {
    const rangeStart = Math.max(range.start_line, startLine);
    const rangeEnd = Math.min(range.end_line, contentEndLine);
    for (let ln = rangeStart; ln <= rangeEnd; ln++) {
      commentLineSet.add(ln);
    }
  }

  if (commentLineSet.size === 0) return content;

  // Split content into per-line chunks, filter out comment lines.
  // We rebuild from line slices to avoid splitting on \n (which may be inside multi-line content).
  const parts: string[] = [];
  const totalLines = contentEndLine - startLine + 1;

  for (let i = 0; i < totalLines; i++) {
    const absLine = startLine + i;
    if (commentLineSet.has(absLine)) continue;

    // Extract this line's content from the content string.
    // The content starts at startLine, so the offset within content is:
    const lineStartInContent = (lineOffsets[absLine - 1] ?? 0) - (lineOffsets[startLine - 1] ?? 0);
    const lineEndInContent =
      (lineOffsets[absLine] ?? lineOffsets[startLine - 1]! + content.length) -
      (lineOffsets[startLine - 1] ?? 0);

    parts.push(content.slice(lineStartInContent, lineEndInContent));
  }

  return parts.join("");
}

/**
 * Truncates content to at most maxBytes (Buffer.byteLength), cutting at last \n boundary.
 */
export function truncateAtBytes(
  content: string,
  startLine: number,
  lineOffsets: number[],
  maxBytes: number
): { content: string; truncated_at_line?: number } {
  if (Buffer.byteLength(content, "utf8") <= maxBytes) {
    return { content };
  }

  // Get a Buffer of the content
  const buf = Buffer.from(content, "utf8");

  // Find last \n within first maxBytes
  let cutByte = -1;
  for (let i = maxBytes - 1; i >= 0; i--) {
    if (buf[i] === 0x0a /* \n */) {
      cutByte = i;
      break;
    }
  }

  if (cutByte === -1) {
    // No newline found — single very long line; cut at maxBytes
    const truncated = buf.slice(0, maxBytes).toString("utf8");
    return { content: truncated, truncated_at_line: startLine };
  }

  // The truncated content includes up to and including the \n at cutByte
  const truncatedContent = buf.slice(0, cutByte + 1).toString("utf8");

  // Count how many \n are in the truncated content to find absolute line number
  let newlineCount = 0;
  for (let i = 0; i <= cutByte; i++) {
    if (buf[i] === 0x0a) newlineCount++;
  }
  // startLine is the first line; after newlineCount newlines, we're at startLine + newlineCount - 1
  const truncated_at_line = startLine + newlineCount - 1;

  return { content: truncatedContent, truncated_at_line };
}

/**
 * Main entry point: builds a ReadSectionResponse from an index and input.
 */
export function buildReadSectionResponse(
  index: Index,
  input: ReadSectionInput,
  maxBytes: number = DEFAULT_CONFIG.maxSectionBytes
): ReadSectionResponse {
  // 1. Find node by section_id
  const nodeById = buildNodeMap(index.toc);
  const node = nodeById.get(input.section_id);
  if (!node) {
    const err = new Error(
      `Unknown section_id "${input.section_id}". Use view_toc to list valid section ids for this file.`
    );
    (err as Error & { code: string }).code = "UNKNOWN_SECTION_ID";
    throw err;
  }

  const includeSubsections = input.include_subsections ?? false;
  const mode = input.mode ?? "raw";
  const includeComments = input.include_comments ?? false;

  // 2. Determine start_line
  let start_line = node.line;
  if (input.from_line !== undefined) {
    if (input.from_line >= node.line && input.from_line <= node.line_end) {
      start_line = input.from_line;
    } else {
      const err = new Error(
        `from_line ${input.from_line} is out of section range [${node.line}..${node.line_end}] for section "${input.section_id}".`
      );
      (err as Error & { code: string }).code = "FROM_LINE_OUT_OF_RANGE";
      throw err;
    }
  }

  // 3. Determine effective_end_line and optional expansion info
  let effective_end_line: number;
  let expansionData:
    | { raw_line_end: number; logical_line_end: number; artifacts_absorbed: AbsorbedArtifact[] }
    | undefined;

  if (mode === "logical") {
    const logicalRange = extractLogicalRange(index, node, includeSubsections);
    effective_end_line = logicalRange.logical_line_end;
    if (logicalRange.artifacts_absorbed.length > 0) {
      expansionData = {
        raw_line_end: logicalRange.raw_line_end,
        logical_line_end: logicalRange.logical_line_end,
        artifacts_absorbed: logicalRange.artifacts_absorbed,
      };
    }
  } else {
    // raw mode
    if (!includeSubsections && node.children.length > 0) {
      effective_end_line = node.children[0]!.line - 1;
    } else {
      effective_end_line = node.line_end;
    }
  }

  // 4. Extract content
  let content = extractRawRange(
    index.raw_content,
    index.line_offsets,
    start_line,
    effective_end_line
  );

  // 5. Strip comments if needed
  if (!includeComments) {
    content = stripComments(
      content,
      start_line,
      index.comment_ranges,
      index.line_offsets,
      effective_end_line
    );
  }

  // 6. Truncate at maxBytes
  const truncResult = truncateAtBytes(content, start_line, index.line_offsets, maxBytes);
  content = truncResult.content;

  // 7. Build children mini-TOC if include_subsections=false and node has children.
  // Use compactTocNodeAtDepth(child, 1) so that grandchildren availability is
  // signalled via has_children=true on each direct child.
  const children =
    !includeSubsections && node.children.length > 0
      ? node.children.map((child) => compactTocNodeAtDepth(child, 1))
      : undefined;

  // 8. Build response
  const response: ReadSectionResponse = {
    section: {
      id: node.id,
      title: node.title,
      level: node.level,
      line: node.line,
      line_end: node.line_end,
      numbering: node.numbering,
    },
    content,
  };

  if (children !== undefined) {
    response.children = children;
  }

  if (expansionData !== undefined) {
    response.expansion = expansionData;
  }

  if (truncResult.truncated_at_line !== undefined) {
    response.truncated = true;
    response.truncated_at_line = truncResult.truncated_at_line;
  }

  return response;
}
