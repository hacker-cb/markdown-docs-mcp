// Env-var driven configuration for response caps. Validates that loadConfig
// parses values, falls back on invalid input (with stderr warning), and clamps
// to the documented 500K maxResultSizeChars ceiling.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadConfig, DEFAULT_CONFIG } from "../../src/config.js";

describe("loadConfig", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("returns defaults when no env vars are set", () => {
    const cfg = loadConfig({});
    expect(cfg).toEqual(DEFAULT_CONFIG);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("parses valid MARKDOWN_DOCS_MAX_TOC_BYTES", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_TOC_BYTES: "65536" });
    expect(cfg.maxViewTocBytes).toBe(65536);
    expect(cfg.maxSectionBytes).toBe(DEFAULT_CONFIG.maxSectionBytes);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("parses valid MARKDOWN_DOCS_MAX_SECTION_BYTES", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_SECTION_BYTES: "102400" });
    expect(cfg.maxSectionBytes).toBe(102400);
    expect(cfg.maxViewTocBytes).toBe(DEFAULT_CONFIG.maxViewTocBytes);
  });

  it("falls back to default on non-numeric value with warning", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_TOC_BYTES: "abc" });
    expect(cfg.maxViewTocBytes).toBe(DEFAULT_CONFIG.maxViewTocBytes);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/MARKDOWN_DOCS_MAX_TOC_BYTES/);
  });

  it("falls back on zero with warning", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_TOC_BYTES: "0" });
    expect(cfg.maxViewTocBytes).toBe(DEFAULT_CONFIG.maxViewTocBytes);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("falls back on negative value with warning", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_SECTION_BYTES: "-1" });
    expect(cfg.maxSectionBytes).toBe(DEFAULT_CONFIG.maxSectionBytes);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("clamps view_toc bytes to the 500K maxResultSizeChars ceiling", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_TOC_BYTES: "999999" });
    expect(cfg.maxViewTocBytes).toBe(500_000);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/clamp|500/i);
  });

  it("clamps section bytes to 500K too", () => {
    const cfg = loadConfig({ MARKDOWN_DOCS_MAX_SECTION_BYTES: "10000000" });
    expect(cfg.maxSectionBytes).toBe(500_000);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("ignores empty string env vars (treats as unset)", () => {
    const cfg = loadConfig({
      MARKDOWN_DOCS_MAX_TOC_BYTES: "",
      MARKDOWN_DOCS_MAX_SECTION_BYTES: "",
    });
    expect(cfg).toEqual(DEFAULT_CONFIG);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("DEFAULT_CONFIG matches documented values", () => {
    expect(DEFAULT_CONFIG.maxViewTocBytes).toBe(50 * 1024);
    expect(DEFAULT_CONFIG.maxSectionBytes).toBe(200 * 1024);
  });
});
