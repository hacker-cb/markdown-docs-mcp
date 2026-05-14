// MCP server factory. Registers four tools with self-contained descriptions
// and Zod-validated inputs. All handlers currently throw NotImplementedError
// — real implementations land in PR-04 onward.

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
import { viewToc } from "./tools/view_toc.js";
import { readSection } from "./tools/read_section.js";
import { search } from "./tools/search.js";
import { analyzeDocument } from "./tools/analyze_document.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "markdown-docs",
    version: "0.1.0",
  });

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
    async (args) => {
      return await viewToc(args);
    }
  );

  server.registerTool(
    "read_section",
    {
      description: READ_SECTION_DESCRIPTION,
      inputSchema: readSectionInput,
    },
    async (args) => {
      return await readSection(args);
    }
  );

  server.registerTool(
    "search",
    {
      description: SEARCH_DESCRIPTION,
      inputSchema: searchInput,
    },
    async (args) => {
      return await search(args);
    }
  );

  server.registerTool(
    "analyze_document",
    {
      description: ANALYZE_DOCUMENT_DESCRIPTION,
      inputSchema: analyzeDocumentInput,
    },
    async (args) => {
      return await analyzeDocument(args);
    }
  );

  return server;
}
