// Invariants for the bundled .mcp.json — the project's own MCP server config.
// It pins the published npm package + version the server is launched as;
// scripts/release.mjs keeps that pin in lockstep with package.json. A stale pin
// would advertise a version that doesn't match the npm artifact.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

function readJson<T>(relPath: string): T {
  const text = readFileSync(resolve(REPO_ROOT, relPath), "utf8");
  return JSON.parse(text) as T;
}

type McpConfig = {
  mcpServers: Record<
    string,
    { command: string; args: string[]; env?: Record<string, string> }
  >;
};

type PackageJson = {
  name: string;
  version: string;
};

describe(".mcp.json invariants", () => {
  const pkg = readJson<PackageJson>("package.json");
  const mcp = readJson<McpConfig>(".mcp.json");

  it("registers the server via npx with auto-yes flag", () => {
    const server = mcp.mcpServers["markdown-docs"];
    expect(server).toBeDefined();
    expect(server?.command).toBe("npx");
    expect(server?.args[0]).toBe("-y");
    expect(server?.args[1]).toBeDefined();
  });

  it("pins the same npm package + version as package.json", () => {
    const arg = mcp.mcpServers["markdown-docs"]?.args[1] ?? "";
    const [pkgName, pkgVersion] = arg.split("@");
    expect(pkgName).toBe(pkg.name);
    expect(pkgVersion).toBe(pkg.version);
  });

  it("does not bake config env vars (defaults from src/config.ts apply)", () => {
    // Hard-coding env in the bundled .mcp.json would override user-scope
    // settings silently. Env-based config remains opt-in via the user's own
    // MCP config — documented in spec section 10.5.
    const server = mcp.mcpServers["markdown-docs"];
    expect(server?.env).toBeUndefined();
  });
});
