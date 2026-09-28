import { describe, expect, it } from "vitest";
import { GOLDEN_SET } from "./goldenSet";
import { aiDetectablePatternsFor } from "./patternDefinitions";

describe("GOLDEN_SET", () => {
  it("covers every AI-detectable writing pattern with at least one positive and one negative example", () => {
    const codes = aiDetectablePatternsFor("writing").map((p) => p.code);
    for (const code of codes) {
      const examples = GOLDEN_SET.filter((e) => e.code === code);
      expect(examples.some((e) => e.expected)).toBe(true);
      expect(examples.some((e) => !e.expected)).toBe(true);
    }
  });

  it("never targets a rule-based-only spelling pattern", () => {
    const codes = new Set(GOLDEN_SET.map((e) => e.code));
    expect(codes.has("CAPITALIZATION")).toBe(false);
    expect(codes.has("APOSTROPHE")).toBe(false);
  });

  it("has no duplicate (code, sentence) pairs", () => {
    const seen = new Set(GOLDEN_SET.map((e) => `${e.code}::${e.sentence}`));
    expect(seen.size).toBe(GOLDEN_SET.length);
  });
});
