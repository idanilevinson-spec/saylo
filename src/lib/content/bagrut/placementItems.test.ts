import { describe, expect, it } from "vitest";
import { BAGRUT_PLACEMENT_SECTIONS, bagrutReadiness, gradeBagrutSection } from "./placementItems";

describe("Bagrut placement sections", () => {
  for (const section of Object.values(BAGRUT_PLACEMENT_SECTIONS)) {
    it(`${section.units} units: every question has a valid, unique-option answer key`, () => {
      expect(section.questions.length).toBeGreaterThanOrEqual(5);
      for (const q of section.questions) {
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(q.options.length);
        expect(new Set(q.options).size).toBe(q.options.length);
      }
    });

    it(`${section.units} units: the answer key isn't always the same letter`, () => {
      expect(new Set(section.questions.map((q) => q.correctOptionIndex)).size).toBeGreaterThan(1);
    });
  }
});

describe("gradeBagrutSection", () => {
  it("counts unanswered as wrong", () => {
    const key = BAGRUT_PLACEMENT_SECTIONS[3].questions.map((q) => q.correctOptionIndex);
    expect(gradeBagrutSection(3, key).percent).toBe(100);
    expect(gradeBagrutSection(3, [key[0], null, null, null, null])).toEqual({ correct: 1, total: 5, percent: 20 });
  });
});

describe("bagrutReadiness", () => {
  it("maps percent to three coarse bands", () => {
    expect(bagrutReadiness(20)).toBe("foundation");
    expect(bagrutReadiness(60)).toBe("building");
    expect(bagrutReadiness(80)).toBe("ready");
  });
});
