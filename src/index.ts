import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { IndexCache } from "./index/cache.js";

async function main() {
  const cache = new IndexCache();
  const server = createServer({ cache });
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
