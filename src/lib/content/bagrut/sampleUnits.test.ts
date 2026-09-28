import { describe, expect, it } from "vitest";
import { BAGRUT_SAMPLE_UNITS, getReviewedSampleUnit, getSampleUnit } from "./sampleUnits";
import { getModuleFormat } from "./moduleFormats";
import { countWords } from "@/lib/patterns/textAnalysis";

describe("BAGRUT_SAMPLE_UNITS", () => {
  it("keeps every reading passage within its verified module's word-count range", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      const format = getModuleFormat(unit.moduleCode);
      const readingSection = format.sections.find((s) => s.nameHe === "הבנת הנקרא");
      expect(readingSection?.wordCountRange).toBeDefined();
      const [min, max] = readingSection!.wordCountRange!;
      const words = countWords(unit.readingBodyEn);
      expect(words).toBeGreaterThanOrEqual(min);
      expect(words).toBeLessThanOrEqual(max);
    }
  });

  it("only builds sample content for modules whose structure is verified", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      expect(getModuleFormat(unit.moduleCode).verified).toBe(true);
    }
  });

  it("gives every reading question a prompt and a model answer", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      for (const q of unit.readingQuestions) {
        expect(q.promptEn.trim().length).toBeGreaterThan(0);
        expect(q.modelAnswerHe.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every multiple-choice question at least 3 options", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      for (const q of unit.readingQuestions.filter((q) => q.formatHe === "רב-ברירה")) {
        expect(q.options?.length ?? 0).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("has no reviewed sample content yet — a real exam-prep review is a separate, explicit step", () => {
    // Expected to start failing the day a unit is genuinely reviewed and
    // flipped to reviewed: true — that's the point, same as drills.test.ts
    // in the Hebrew Pattern Coach.
    expect(BAGRUT_SAMPLE_UNITS.every((u) => !u.reviewed)).toBe(true);
  });
});

describe("getReviewedSampleUnit", () => {
  it("returns undefined for every module today, since nothing is reviewed", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      expect(getReviewedSampleUnit(unit.moduleCode)).toBeUndefined();
    }
  });

  it("returns undefined for a module with no sample content at all", () => {
    expect(getReviewedSampleUnit("G")).toBeUndefined();
  });
});

describe("getSampleUnit", () => {
  it("returns the unit regardless of review status", () => {
    expect(getSampleUnit("B")).toBeDefined();
  });
});
