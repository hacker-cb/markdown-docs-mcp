// Self-contained tool descriptions. Per spec section 3.1, these must let an
// agent use the server correctly even without the bundled skill (e.g. when
// the MCP is connected directly without the Claude Code plugin, or from
// Cursor/Continue/any other MCP client).

export const VIEW_TOC_DESCRIPTION = `Returns the table of contents of a large markdown file as a tree of headings.

Each node has: opaque id (format: s<line>), level (1-6), title, optional numbering ("4.1.2"), line/line_end range, section size in lines, is_likely_artifact flag, optional pdf_pages, and children. The response also includes file metadata, optional YAML frontmatter, and anomalies_summary.

Use this as the entry point when reading any markdown document larger than ~500 lines. The response is ~1-3 KB JSON regardless of file size, and lets you address sections by opaque id without reading the whole file.

If anomalies_summary.total > 0, the document has structural anomalies (most often PDF-conversion artifacts). Call analyze_document for details before relying on raw section boundaries.

Section ids are opaque (format s<line>); do not construct them from numbering. Use read_section({ section_id }) to read content for a specific id. The default reading mode is "raw" — every line of the document belongs to exactly one node, no content is silently merged or dropped by heuristics.

Pass raw=true to skip reparenting and is_likely_artifact flags entirely (debug/transparency).`;

export const READ_SECTION_DESCRIPTION = `Reads a section of a markdown document by its opaque id from view_toc.

Default mode="raw": returns literal parser boundaries — the text from the heading line to line_end. No heuristic-driven expansion. If include_subsections=false (default), content stops at the first child heading and a mini-TOC of children is returned in the response so you can drill down stepwise.

Mode="logical" is opt-in: extends the section past adjacent is_likely_artifact nodes (most often PDF page headers misparsed as ## headings). The response lists exactly what was absorbed (expansion.artifacts_absorbed) — the agent must inform the user when using this mode, since it changes content attribution.

HTML comments (<!-- ... -->) are stripped from content by default; pass include_comments=true to keep them. Line numbers in the response stay absolute regardless.

Response is hard-capped at ~200 KB. Larger sections return truncated=true with truncated_at_line=N — use from_line=N+1 to continue reading.

Errors: invalid section_id returns a list of close-by ids to help recovery.`;

export const SEARCH_DESCRIPTION = `Searches a markdown document for literal substrings or regex.

Default scope="all": matches in headings and body. Pass scope="titles" or "content" to narrow.

Default regex=false (case-insensitive literal); pass regex=true to treat query as a JavaScript regex (case-sensitive by default; override with case_sensitive).

Each hit includes: line number, surrounding snippet (default 2 lines of context), the matched text, the nearest parent section { id, title, level, numbering }, and where the match was ("title" | "content"). The section.id can be passed to read_section to fetch the full section.

HTML comments are excluded by default; pass include_comments=true to search inside them too (e.g. searching for PDF_PAGE markers).

Results are capped (default max 50). If exceeded, truncated=true is set — narrow the query or raise max_results (max 500).

This is grep-like (substring/regex), not semantic search.`;

export const ANALYZE_DOCUMENT_DESCRIPTION = `Returns a diagnostic report on structural anomalies in a markdown document.

Reports types: self_nesting_header (a heading that duplicates one of its open ancestors — almost always a PDF page header artifact), level_jump (unexpected hierarchy gap remaining after reparenting), orphan_subheader (first heading has level > 1), empty_section.

Each anomaly carries context: preceding/following real heading, the duplicated ancestor for self-nesting cases, and adjacent_pdf_markers (e.g. ["L3932 PDF_PAGE_END 38"]) — independent evidence of PDF-conversion origin. For self-nesting findings, logical_effect describes what would happen if that node were treated as an artifact (which section would absorb its lines, by how much).

This tool only DESCRIBES anomalies. It does NOT modify the document and does NOT suggest specific edits — the agent decides, in dialogue with the user, whether to apply file fixes, use read_section with mode="logical", or leave the document as-is.

Call this whenever view_toc.anomalies_summary.total > 0, and before any extended read_section work on a chapter that contains anomalies.`;
