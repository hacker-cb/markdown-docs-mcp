import { z } from "zod";

const filePath = z
  .string()
  .min(1)
  .describe("Absolute path to the markdown file on the local filesystem.");

export const viewTocInput = z.object({
  file_path: filePath,
  depth: z
    .number()
    .int()
    .min(1)
    .max(6)
    .nullable()
    .optional()
    .describe("Limit TOC tree depth. null (default) returns the full hierarchy."),
  raw: z
    .boolean()
    .optional()
    .describe(
      "If true, disable reparenting and is_likely_artifact flags — return the parser's literal output. Default false."
    ),
});

export const readSectionInput = z.object({
  file_path: filePath,
  section_id: z
    .string()
    .min(1)
    .describe(
      "Opaque section id obtained from view_toc (format: s<line>). Do not construct from numbering — section ids are addressing tokens, not paths."
    ),
  include_subsections: z
    .boolean()
    .optional()
    .describe(
      "If true, include the entire subtree of the section. If false (default), content stops at the first child heading and children are returned as a mini-TOC."
    ),
  mode: z
    .enum(["raw", "logical"])
    .optional()
    .describe(
      "raw (default): literal parser boundaries — every line belongs to exactly one node. logical: extend the section past adjacent is_likely_artifact nodes; the response lists what was absorbed."
    ),
  include_comments: z
    .boolean()
    .optional()
    .describe(
      "If true, keep HTML comments in the returned content. Default false — comments are stripped from text (line numbers stay absolute)."
    ),
  from_line: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Continuation parameter after a truncated response. Pass the line after the previous truncated_at_line to continue reading."
    ),
});

export const searchInput = z.object({
  file_path: filePath,
  query: z
    .string()
    .min(1)
    .describe(
      "Search string. Treated as literal substring by default, or as a regex if regex=true."
    ),
  regex: z
    .boolean()
    .optional()
    .describe("If true, query is a JavaScript regular expression. Default false."),
  case_sensitive: z
    .boolean()
    .optional()
    .describe(
      "Case sensitivity. Defaults: false for literal substring, true for regex (override explicitly to change either)."
    ),
  scope: z
    .enum(["all", "titles", "content"])
    .optional()
    .describe(
      "Where to search. all (default) covers headings + body. titles restricts to heading text. content excludes headings."
    ),
  max_results: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum hits returned. Default 50. If exceeded, response sets truncated=true."),
  context_lines: z
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Lines of context on each side of a hit. Default 2."),
  include_comments: z
    .boolean()
    .optional()
    .describe(
      "If true, search inside HTML comments too. Default false — comments are skipped."
    ),
});

export const analyzeDocumentInput = z.object({
  file_path: filePath,
});

export type ViewTocInput = z.infer<typeof viewTocInput>;
export type ReadSectionInput = z.infer<typeof readSectionInput>;
export type SearchInput = z.infer<typeof searchInput>;
export type AnalyzeDocumentInput = z.infer<typeof analyzeDocumentInput>;
