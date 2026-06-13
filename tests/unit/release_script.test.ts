// Pure-transform tests for scripts/release.mjs. The script also has I/O and
// git side effects but those are deferred to manual `pnpm release` invocation —
// here we only verify the in-memory rewrite is correct, since that's the part
// that silently corrupts the version invariant if it drifts.

import { describe, it, expect } from "vitest";
// @ts-expect-error - .mjs has no .d.ts; runtime import is fine for tests.
import { applyVersionToFiles, normalizeVersion } from "../../scripts/release.mjs";

const sampleFiles = () => ({
  "package.json": { name: "markdown-docs-mcp", version: "0.1.0", scripts: {} },
  ".mcp.json": {
    mcpServers: {
      "markdown-docs": {
        command: "npx",
        args: ["-y", "markdown-docs-mcp@0.1.0"],
      },
    },
  },
});

describe("normalizeVersion", () => {
  it("accepts plain semver", () => {
    expect(normalizeVersion("0.1.0")).toBe("0.1.0");
    expect(normalizeVersion("12.34.56")).toBe("12.34.56");
  });

  it("strips a leading v", () => {
    expect(normalizeVersion("v1.2.3")).toBe("1.2.3");
  });

  it("accepts prerelease suffixes", () => {
    expect(normalizeVersion("1.2.3-rc.1")).toBe("1.2.3-rc.1");
    expect(normalizeVersion("v0.0.1-alpha.7")).toBe("0.0.1-alpha.7");
  });

  it("rejects non-semver input", () => {
    expect(() => normalizeVersion("1.2")).toThrow();
    expect(() => normalizeVersion("not-a-version")).toThrow();
    expect(() => normalizeVersion("1.2.3.4")).toThrow();
    expect(() => normalizeVersion("")).toThrow();
  });
});

describe("applyVersionToFiles", () => {
  it("updates both canonical version locations", () => {
    const out = applyVersionToFiles("0.2.0", sampleFiles());
    expect(out["package.json"].version).toBe("0.2.0");
    expect(out[".mcp.json"].mcpServers["markdown-docs"].args[1]).toBe(
      "markdown-docs-mcp@0.2.0"
    );
  });

  it("preserves untouched fields", () => {
    const before = sampleFiles();
    const out = applyVersionToFiles("9.9.9", before);
    expect(out["package.json"].name).toBe("markdown-docs-mcp");
    expect(out[".mcp.json"].mcpServers["markdown-docs"].command).toBe("npx");
    expect(out[".mcp.json"].mcpServers["markdown-docs"].args[0]).toBe("-y");
  });

  it("does not mutate the input map", () => {
    const before = sampleFiles();
    const beforeJson = JSON.stringify(before);
    applyVersionToFiles("3.0.0", before);
    expect(JSON.stringify(before)).toBe(beforeJson);
  });

  it("throws if .mcp.json args has no <pkg>@<ver> entry", () => {
    const broken = sampleFiles();
    broken[".mcp.json"].mcpServers["markdown-docs"].args = ["-y", "something-else"];
    expect(() => applyVersionToFiles("1.0.0", broken)).toThrow(/markdown-docs-mcp@/);
  });

  it("rejects invalid version", () => {
    expect(() => applyVersionToFiles("not-semver", sampleFiles())).toThrow();
  });
});
