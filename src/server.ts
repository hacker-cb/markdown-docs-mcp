// MCP server factory. Registers all four tools with self-contained descriptions
// and Zod-validated inputs. All tools are fully implemented.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  viewTocInput,
  readSectionInput,
  searchInput,
  analyzeDocumentInput,
} from "./schemas/inputs.js";
import {
  VIEW_TOC_DESCRIPTION,
  READ_SECTION_DESCRIPTION,
  SEARCH_DESCRIPTION,
  ANALYZE_DOCUMENT_DESCRIPTION,
} from "./schemas/descriptions.js";
import { makeViewTocHandler } from "./tools/view_toc.js";
import { makeReadSectionHandler } from "./tools/read_section.js";
import { makeSearchHandler } from "./tools/search.js";
import { makeAnalyzeDocumentHandler } from "./tools/analyze_document.js";
import { IndexCache } from "./index/cache.js";

export type ServerDeps = { cache?: IndexCache };

export function createServer(deps: ServerDeps = {}): McpServer {
  const cache = deps.cache ?? new IndexCache();
  const server = new McpServer({
    name: "markdown-docs",
    version: "0.1.0",
  });

  const viewTocHandler = makeViewTocHandler(cache);
  const readSectionHandler = makeReadSectionHandler(cache);
  const searchHandler = makeSearchHandler(cache);
  const analyzeDocumentHandler = makeAnalyzeDocumentHandler(cache);

  // registerTool(name, config, callback) — preferred non-deprecated API in SDK 1.29.
  // inputSchema accepts a full Zod object schema (AnySchema); SDK converts it to
  // JSON Schema for tools/list and validates incoming args before calling the handler.
  // Thrown errors are caught by SDK and returned as { isError: true, content: [...] }.

  server.registerTool(
    "view_toc",
    {
      description: VIEW_TOC_DESCRIPTION,
      inputSchema: viewTocInput,
    },
    async (args) => viewTocHandler(args)
  );

  server.registerTool(
    "read_section",
    {
      description: READ_SECTION_DESCRIPTION,
      inputSchema: readSectionInput,
    },
    async (args) => readSectionHandler(args)
  );

  server.registerTool(
    "search",
    {
      description: SEARCH_DESCRIPTION,
      inputSchema: searchInput,
    },
    async (args) => searchHandler(args)
  );

  server.registerTool(
    "analyze_document",
    {
      description: ANALYZE_DOCUMENT_DESCRIPTION,
      inputSchema: analyzeDocumentInput,
    },
    async (args) => analyzeDocumentHandler(args)
  );

  return server;
}
