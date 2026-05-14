import { describe, it, expect } from "vitest";
import { extractNumbering } from "../../../src/parser/numbering.js";

describe("extractNumbering", () => {
  it("returns numeric prefix", () => {
    expect(extractNumbering("1 Scope")).toBe("1");
    expect(extractNumbering("4.1 System")).toBe("4.1");
    expect(extractNumbering("4.1.1.2 RISC-V Trace Encoder (TRACE)")).toBe(
      "4.1.1.2"
    );
  });

  it("returns alphabetical prefix", () => {
    expect(extractNumbering("A Foo")).toBe("A");
    expect(extractNumbering("AB Notes")).toBe("AB");
  });

  it("returns Annex prefix as letter.digits", () => {
    expect(extractNumbering("Annex A Examples")).toBe("A");
    expect(extractNumbering("Annex A.1 Examples")).toBe("A.1");
    expect(extractNumbering("Annex B.2.3 Detail")).toBe("B.2.3");
  });

  it("returns null when no recognizable numbering", () => {
    expect(extractNumbering("FOREWORD")).toBeNull();
    expect(extractNumbering("Introduction")).toBeNull();
    expect(extractNumbering("Note")).toBeNull();
    expect(extractNumbering("Getting Started")).toBeNull();
  });

  it("ignores trailing context inside title", () => {
    expect(extractNumbering("3.1.4 примечание (см. 2.1)")).toBe("3.1.4");
  });

  it("requires whitespace after numbering", () => {
    expect(extractNumbering("1Scope")).toBeNull();
    expect(extractNumbering("4.1System")).toBeNull();
  });
});
