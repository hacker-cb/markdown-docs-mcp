// Cross-file invariants for the Claude Code plugin packaging. The three plugin
// JSONs ship a public install surface that must stay in lockstep with
// package.json — a stale version in any of them silently breaks `/plugin install`.
// The release pipeline (PR-08) is responsible for bumping; this test only
// guarantees that a stale version cannot reach `dev`.

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

type PluginManifest = {
  name: string;
  version: string;
  description: string;
  license: string;
};

type Marketplace = {
  name: string;
  owner: { name: string };
  plugins: Array<{
    name: string;
    source: string;
    version: string;
  }>;
};

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

describe("plugin manifest invariants", () => {
  const pkg = readJson<PackageJson>("package.json");
  const plugin = readJson<PluginManifest>(".claude-plugin/plugin.json");
  const marketplace = readJson<Marketplace>(".claude-plugin/marketplace.json");
  const mcp = readJson<McpConfig>(".mcp.json");

  it("plugin.json has all required fields", () => {
    expect(plugin.name).toBe("markdown-docs");
    expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(plugin.description.length).toBeGreaterThan(20);
    expect(plugin.license).toBe("MIT");
  });

  it("marketplace.json declares a single plugin pointing at repo root", () => {
    expect(marketplace.name).toBe("hacker-cb");
    expect(marketplace.owner.name).toBe("hacker-cb");
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0]?.name).toBe("markdown-docs");
    expect(marketplace.plugins[0]?.source).toBe("./");
  });

  it("plugin.json and marketplace.json agree on name + version", () => {
    expect(plugin.name).toBe(marketplace.plugins[0]?.name);
    expect(plugin.version).toBe(marketplace.plugins[0]?.version);
  });

  it(".mcp.json registers the server via npx with auto-yes flag", () => {
    const server = mcp.mcpServers["markdown-docs"];
    expect(server).toBeDefined();
    expect(server?.command).toBe("npx");
    expect(server?.args[0]).toBe("-y");
    expect(server?.args[1]).toBeDefined();
  });

  it(".mcp.json pins the same npm package + version as package.json", () => {
    const arg = mcp.mcpServers["markdown-docs"]?.args[1] ?? "";
    const [pkgName, pkgVersion] = arg.split("@");
    expect(pkgName).toBe(pkg.name);
    expect(pkgVersion).toBe(pkg.version);
    expect(pkgVersion).toBe(plugin.version);
  });

  it(".mcp.json does not bake config env vars (defaults from src/config.ts apply)", () => {
    // Hard-coding env in the bundled .mcp.json would override user-scope
    // settings silently. Env-based config remains opt-in via the user's own
    // MCP config — documented in spec section 10.5.
    const server = mcp.mcpServers["markdown-docs"];
    expect(server?.env).toBeUndefined();
  });
});
