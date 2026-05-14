import type { Index } from "../index/types.js";
import type { SearchInput } from "../schemas/inputs.js";

export type SearchHit = {
  line: number;
  snippet: string;
  matched_text: string;
  section: {
    id: string;
    title: string;
    level: number;
    numbering?: string; // omitted when null
  };
  in: "title" | "content";
};

export type SearchResponse = {
  hits: SearchHit[];
  total_matches: number;
  truncated: boolean;
};

// Virtual section used for lines before the first heading (preamble).
const PREAMBLE_SECTION = {
  id: "",
  title: "(document preamble)",
  level: 0,
  numbering: null,
} as const;

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

type MatchResult = { matchedText: string } | null;

type Matcher = (line: string) => MatchResult;

function buildMatcher(input: SearchInput): Matcher {
  const query = input.query;
  const isRegex = input.regex ?? false;

  if (isRegex) {
    // For regex: case_sensitive defaults to true (standard JS regex behavior)
    const caseSensitive = input.case_sensitive ?? true;
    const flags = caseSensitive ? "" : "i";
    let re: RegExp;
    try {
      re = new RegExp(query, flags);
    } catch (e) {
      const err = new Error(
        `Invalid regular expression: ${String(e instanceof Error ? e.message : e)}`
      );
      (err as Error & { code: string }).code = "INVALID_REGEX";
      throw err;
    }

    return (line: string): MatchResult => {
      // Use a fresh exec with a non-global regex for first match
      const match = re.exec(line);
      if (match === null) return null;
      return { matchedText: match[0] };
    };
  } else {
    // Literal: case_sensitive defaults to false
    const caseSensitive = input.case_sensitive ?? false;
    const needle = caseSensitive ? query : query.toLowerCase();

    return (line: string): MatchResult => {
      const haystack = caseSensitive ? line : line.toLowerCase();
      const idx = haystack.indexOf(needle);
      if (idx === -1) return null;
      // Return the original (case-preserved) matched substring
      return { matchedText: line.slice(idx, idx + query.length) };
    };
  }
}

// ---------------------------------------------------------------------------
// Snippet extraction
// ---------------------------------------------------------------------------

/**
 * Extracts a snippet covering lines [fromLine..toLine] inclusive, using
 * index.line_offsets for direct char-offset slicing.
 * fromLine and toLine are clamped to [1..lineCount].
 */
function extractSnippet(index: Index, fromLine: number, toLine: number): string {
  const clamped_from = Math.max(1, fromLine);
  const clamped_to = Math.min(index.line_count, toLine);
  const start = index.line_offsets[clamped_from - 1] ?? 0;
  const end = index.line_offsets[clamped_to] ?? index.raw_content.length;
  return index.raw_content.slice(start, end);
}

// ---------------------------------------------------------------------------
// Comment range check
// ---------------------------------------------------------------------------

/**
 * Returns true if the given absolute line number falls inside any comment range.
 */
function isInCommentRange(
  line: number,
  commentRanges: Index["comment_ranges"]
): boolean {
  for (const range of commentRanges) {
    if (line >= range.start_line && line <= range.end_line) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function buildSearchResponse(
  index: Index,
  input: SearchInput
): SearchResponse {
  const maxResults = input.max_results ?? 50;
  const contextLines = input.context_lines ?? 2;
  const scope = input.scope ?? "all";
  const includeComments = input.include_comments ?? false;

  const matcher = buildMatcher(input); // may throw INVALID_REGEX

  const hits: SearchHit[] = [];

  // Use precomputed line→section map from Index
  const lineSectionMap = index.line_section_map;

  // ------------------------------------------------------------------
  // Search titles
  // ------------------------------------------------------------------
  if (scope === "all" || scope === "titles") {
    for (const header of index.flat_headers) {
      const matchResult = matcher(header.title);
      if (matchResult === null) continue;

      hits.push({
        line: header.line,
        snippet: header.title,
        matched_text: matchResult.matchedText,
        section: {
          id: header.id,
          title: header.title,
          level: header.level,
          ...(header.numbering !== null && { numbering: header.numbering }),
        },
        in: "title",
      });

      if (hits.length >= maxResults) {
        // Cap reached
        return { hits, total_matches: maxResults, truncated: true };
      }
    }
  }

  // ------------------------------------------------------------------
  // Search content (line by line)
  // ------------------------------------------------------------------
  if (scope === "all" || scope === "content") {
    const lineCount = index.line_count;

    for (let lineNum = 1; lineNum <= lineCount; lineNum++) {
      // Skip comment lines when include_comments=false
      if (!includeComments && isInCommentRange(lineNum, index.comment_ranges)) {
        continue;
      }

      // Extract the raw line text
      const lineStart = index.line_offsets[lineNum - 1] ?? 0;
      const lineEnd = index.line_offsets[lineNum] ?? index.raw_content.length;
      const lineText = index.raw_content.slice(lineStart, lineEnd);

      const matchResult = matcher(lineText);
      if (matchResult === null) continue;

      // Determine section for this line
      const sectionInfo = lineSectionMap[lineNum - 1];
      const section = sectionInfo ?? PREAMBLE_SECTION;

      // Build snippet with context
      const snippet = extractSnippet(
        index,
        lineNum - contextLines,
        lineNum + contextLines
      );

      hits.push({
        line: lineNum,
        snippet,
        matched_text: matchResult.matchedText,
        section: {
          id: section.id,
          title: section.title,
          level: section.level,
          ...(section.numbering !== null && { numbering: section.numbering }),
        },
        in: "content",
      });

      if (hits.length >= maxResults) {
        return { hits, total_matches: maxResults, truncated: true };
      }
    }
  }

  // Sort by line ascending (titles + content may be interleaved)
  hits.sort((a, b) => a.line - b.line);

  return { hits, total_matches: hits.length, truncated: false };
}
