// MCP server factory. Registers all four tools with self-contained descriptions
// and Zod-validated inputs. All tools are fully implemented.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  viewTocInput,
  readSectionInput,
  searchInput,
  analyzeDocumentInput,
} from "./schemas/inputs.js";
import {
  viewTocDescription,
  readSectionDescription,
  SEARCH_DESCRIPTION,
  ANALYZE_DOCUMENT_DESCRIPTION,
} from "./schemas/descriptions.js";
import { makeViewTocHandler } from "./tools/view_toc.js";
import { makeReadSectionHandler } from "./tools/read_section.js";
import { makeSearchHandler } from "./tools/search.js";
import { makeAnalyzeDocumentHandler } from "./tools/analyze_document.js";
import { IndexCache } from "./index/cache.js";
import type { Config } from "./config.js";
import { DEFAULT_CONFIG } from "./config.js";

export type ServerDeps = { cache?: IndexCache; config?: Config };

// Claude Code v2.1.91+ honors this _meta annotation to lift its default
// MCP-result truncation cap up to the requested character count (max 500_000).
// We pick 200_000 to comfortably cover the documented byte caps + UTF-8 expansion.
// Other MCP clients silently ignore the field.
const MAX_RESULT_SIZE_CHARS = 200_000;

// Read version from package.json at startup so the MCP server name+version
// reported to clients always matches the npm-published artifact. The script
// in scripts/release.mjs treats package.json as the single source of truth;
// hard-coding here would create a fifth drift surface.
//
// Resolves the same way in both layouts:
//   - dev / tsx:    src/server.ts → ../package.json (repo root)
//   - npm install:  node_modules/markdown-docs-mcp/dist/index.js → ../package.json
function readPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(here, "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
  return pkg.version;
}

export function createServer(deps: ServerDeps = {}): McpServer {
  const cache = deps.cache ?? new IndexCache();
  const config = deps.config ?? DEFAULT_CONFIG;
  const server = new McpServer({
    name: "markdown-docs",
    version: readPackageVersion(),
  });

  const viewTocHandler = makeViewTocHandler(cache, config);
  const readSectionHandler = makeReadSectionHandler(cache, config);
  const searchHandler = makeSearchHandler(cache);
  const analyzeDocumentHandler = makeAnalyzeDocumentHandler(cache);

  // registerTool(name, config, callback) — preferred non-deprecated API in SDK 1.29.
  // inputSchema accepts a full Zod object schema (AnySchema); SDK converts it to
  // JSON Schema for tools/list and validates incoming args before calling the handler.
  // Thrown errors are caught by SDK and returned as { isError: true, content: [...] }.

  server.registerTool(
    "view_toc",
    {
      description: viewTocDescription(config),
      inputSchema: viewTocInput,
      _meta: { "anthropic/maxResultSizeChars": MAX_RESULT_SIZE_CHARS },
    },
    async (args) => viewTocHandler(args)
  );

  server.registerTool(
    "read_section",
    {
      description: readSectionDescription(config),
      inputSchema: readSectionInput,
      _meta: { "anthropic/maxResultSizeChars": MAX_RESULT_SIZE_CHARS },
    },
    async (args) => readSectionHandler(args)
  );

  server.registerTool(
    "search",
    {
      description: SEARCH_DESCRIPTION,
      inputSchema: searchInput,
      _meta: { "anthropic/maxResultSizeChars": MAX_RESULT_SIZE_CHARS },
    },
    async (args) => searchHandler(args)
  );

  server.registerTool(
    "analyze_document",
    {
      description: ANALYZE_DOCUMENT_DESCRIPTION,
      inputSchema: analyzeDocumentInput,
      _meta: { "anthropic/maxResultSizeChars": MAX_RESULT_SIZE_CHARS },
    },
    async (args) => analyzeDocumentHandler(args)
  );

  return server;
}
