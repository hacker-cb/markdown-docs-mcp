// Server configuration loaded from env vars at startup.
//
// Defaults are picked to (a) stay safely under Claude Code's 500K-char
// maxResultSizeChars annotation ceiling and (b) leave headroom for the JSON
// being measured in bytes vs. the client counting characters (ASCII == bytes,
// but multi-byte UTF-8 expands).
//
// Override via:
//   MARKDOWN_DOCS_MAX_TOC_BYTES      view_toc payload cap
//   MARKDOWN_DOCS_MAX_SECTION_BYTES  read_section payload cap
//
// Invalid values fall back to default with a stderr warning; the server does
// not refuse to start.

export type Config = {
  maxViewTocBytes: number;
  maxSectionBytes: number;
};

export const DEFAULT_CONFIG: Config = {
  maxViewTocBytes: 50 * 1024,
  maxSectionBytes: 200 * 1024,
};

// Matches Claude Code's documented _meta["anthropic/maxResultSizeChars"] cap.
const MAX_BYTES_CEILING = 500_000;

function parseBytes(
  raw: string | undefined,
  fallback: number,
  varName: string
): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    console.warn(
      `[markdown-docs-mcp] ${varName}="${raw}" is not a positive integer; falling back to default ${fallback}.`
    );
    return fallback;
  }
  if (n > MAX_BYTES_CEILING) {
    console.warn(
      `[markdown-docs-mcp] ${varName}=${n} exceeds the 500000-byte ceiling (Claude Code maxResultSizeChars); clamping to ${MAX_BYTES_CEILING}.`
    );
    return MAX_BYTES_CEILING;
  }
  return n;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    maxViewTocBytes: parseBytes(
      env.MARKDOWN_DOCS_MAX_TOC_BYTES,
      DEFAULT_CONFIG.maxViewTocBytes,
      "MARKDOWN_DOCS_MAX_TOC_BYTES"
    ),
    maxSectionBytes: parseBytes(
      env.MARKDOWN_DOCS_MAX_SECTION_BYTES,
      DEFAULT_CONFIG.maxSectionBytes,
      "MARKDOWN_DOCS_MAX_SECTION_BYTES"
    ),
  };
}
