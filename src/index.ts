import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { IndexCache } from "./index/cache.js";
import { loadConfig } from "./config.js";

async function main() {
  const cache = new IndexCache();
  const config = loadConfig();
  const server = createServer({ cache, config });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server runs until stdin closes or the process receives a termination signal.
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

main().catch((err) => {
  console.error("markdown-docs-mcp fatal error:", err);
  process.exit(1);
});
