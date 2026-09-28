import { describe, expect, it } from "vitest";
import {
  PATTERN_DEFINITIONS,
  aiDetectablePatternsFor,
  getPatternDefinition,
  patternsFor,
} from "./patternDefinitions";

describe("PATTERN_DEFINITIONS", () => {
  it("has exactly 15 patterns with unique codes", () => {
    expect(PATTERN_DEFINITIONS).toHaveLength(15);
    const codes = PATTERN_DEFINITIONS.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("never uses the reserved OTHER code", () => {
    expect(PATTERN_DEFINITIONS.some((p) => p.code === "OTHER")).toBe(false);
  });

  it("restricts every spelling pattern to writing only", () => {
    for (const pattern of PATTERN_DEFINITIONS.filter((p) => p.category === "spelling")) {
      expect(pattern.appliesTo).toEqual(["writing"]);
    }
  });

  it("gives every pattern a non-empty Hebrew label, explanation, and example pair", () => {
    for (const pattern of PATTERN_DEFINITIONS) {
      expect(pattern.labelHe.trim()).not.toBe("");
      expect(pattern.whyHe.trim()).not.toBe("");
      expect(pattern.exampleWrong.trim()).not.toBe("");
      expect(pattern.exampleRight.trim()).not.toBe("");
      expect(pattern.exampleWrong).not.toBe(pattern.exampleRight);
    }
  });
});

describe("getPatternDefinition", () => {
  it("finds a known pattern", () => {
    expect(getPatternDefinition("MISSING_COPULA")?.category).toBe("grammar");
  });

  it("returns undefined for an unknown code", () => {
    expect(getPatternDefinition("NOT_A_REAL_CODE")).toBeUndefined();
  });
});

describe("patternsFor", () => {
  it("includes spelling patterns for writing but not for conversation", () => {
    expect(patternsFor("writing").some((p) => p.code === "APOSTROPHE")).toBe(true);
    expect(patternsFor("conversation").some((p) => p.code === "APOSTROPHE")).toBe(false);
  });
});

describe("aiDetectablePatternsFor", () => {
  it("excludes rule-based spelling patterns but keeps DOUBLE_LETTERS", () => {
    const codes = aiDetectablePatternsFor("writing").map((p) => p.code);
    expect(codes).toContain("DOUBLE_LETTERS");
    expect(codes).not.toContain("CAPITALIZATION");
    expect(codes).not.toContain("APOSTROPHE");
  });

  it("has no spelling patterns at all for conversation", () => {
    const codes = aiDetectablePatternsFor("conversation").map((p) => p.code);
    expect(codes.every((c) => getPatternDefinition(c)?.category === "grammar")).toBe(true);
  });
});
