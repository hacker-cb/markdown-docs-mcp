// tests/unit/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("toolchain smoke test", () => {
  it("vitest runs and assertions work", () => {
    expect(1 + 1).toBe(2);
  });

  it("node 20+ available", () => {
    const major = parseInt(process.versions.node.split(".")[0]!, 10);
    expect(major).toBeGreaterThanOrEqual(20);
  });
});
