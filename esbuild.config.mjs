import { chmodSync } from "node:fs";
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.js",
  banner: {
    js: "#!/usr/bin/env node",
  },
  // gray-matter uses dynamic require("fs") internally which esbuild cannot bundle
  // in ESM mode — mark it external so Node resolves it from node_modules at runtime.
  external: ["gray-matter"],
  // esbuild does not set the executable bit; we do it below so
  // `npx markdown-docs-mcp` works after install.
  legalComments: "linked",
  sourcemap: false,
  minify: false,
});

chmodSync("dist/index.js", 0o755);

console.error("Build complete: dist/index.js");
