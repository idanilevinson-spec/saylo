import { describe, expect, it } from "vitest";
import { PATTERN_DRILLS, getPatternDrill, getReviewedDrill } from "./drills";
import { PATTERN_DEFINITIONS } from "./patternDefinitions";

describe("PATTERN_DRILLS", () => {
  it("has a drill for every defined pattern", () => {
    const drillCodes = new Set(PATTERN_DRILLS.map((d) => d.code));
    for (const pattern of PATTERN_DEFINITIONS) {
      expect(drillCodes.has(pattern.code)).toBe(true);
    }
  });

  it("has no drill for an unknown pattern code", () => {
    const patternCodes = new Set(PATTERN_DEFINITIONS.map((p) => p.code));
    for (const drill of PATTERN_DRILLS) {
      expect(patternCodes.has(drill.code)).toBe(true);
    }
  });

  it("gives every item at least 4 options for grammar/vocabulary items or 2 for true/false-style spelling items, with a valid correct index", () => {
    for (const drill of PATTERN_DRILLS) {
      for (const item of drill.items) {
        expect(item.options.length).toBeGreaterThanOrEqual(2);
        expect(item.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(item.correctOptionIndex).toBeLessThan(item.options.length);
        expect(item.promptWithBlank).toContain("___");
      }
    }
  });

  it("gives every pattern at least 4 drill items", () => {
    for (const drill of PATTERN_DRILLS) {
      expect(drill.items.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("has no reviewed drills yet — content review is a separate, explicit approval step", () => {
    // This test is expected to start failing the day a drill is genuinely
    // reviewed and flipped to `reviewed: true` — that's the point: it forces
    // a conscious decision to update this test, rather than a pattern
    // silently going live.
    expect(PATTERN_DRILLS.every((d) => !d.reviewed)).toBe(true);
  });
});

describe("getReviewedDrill", () => {
  it("returns undefined for every pattern today, since none are reviewed", () => {
    for (const drill of PATTERN_DRILLS) {
      expect(getReviewedDrill(drill.code)).toBeUndefined();
    }
  });

  it("returns undefined for an unknown code", () => {
    expect(getReviewedDrill("NOT_A_REAL_CODE")).toBeUndefined();
  });
});

describe("getPatternDrill", () => {
  it("returns the drill regardless of review status", () => {
    expect(getPatternDrill("MISSING_COPULA")).toBeDefined();
  });
});
