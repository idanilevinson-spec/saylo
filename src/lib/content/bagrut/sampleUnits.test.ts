import { describe, expect, it } from "vitest";
import { BAGRUT_SAMPLE_UNITS, getPublishableSampleUnit, getSampleUnit, BAGRUT_AI_CONTENT_DISCLAIMER } from "./sampleUnits";
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
      for (const q of [...unit.readingQuestions, ...(unit.vocabularyQuestions ?? [])]) {
        if (q.formatHe === "רב-ברירה") expect(q.options?.length ?? 0).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("gives every multiple-choice question a correctOptionIndex within range", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      for (const q of [...unit.readingQuestions, ...(unit.vocabularyQuestions ?? [])]) {
        if (q.formatHe !== "רב-ברירה") continue;
        expect(q.correctOptionIndex).toBeDefined();
        expect(q.correctOptionIndex!).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex!).toBeLessThan(q.options!.length);
      }
    }
  });

  it("has no teacher-reviewed content yet — that review is a separate, explicit step", () => {
    // Expected to start failing the day a unit is genuinely checked by a
    // teacher and flipped to teacherReviewed: true — that's the point, same
    // as drills.test.ts in the Hebrew Pattern Coach.
    expect(BAGRUT_SAMPLE_UNITS.every((u) => !u.teacherReviewed)).toBe(true);
  });

  it("discloses every unit as AI content, since none is teacher-reviewed", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      if (!unit.teacherReviewed) expect(unit.aiContentDisclosed).toBe(true);
    }
  });

  it("gives module E a vocabulary section instead of a writing task, and vice versa for B", () => {
    const moduleE = BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === "E")!;
    expect(moduleE.writingTask).toBeUndefined();
    expect(moduleE.vocabularyQuestions?.length).toBe(5);

    const moduleB = BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === "B")!;
    expect(moduleB.writingTask).toBeDefined();
    expect(moduleB.vocabularyQuestions).toBeUndefined();
  });

  it("gives module E between 8 and 10 reading questions, per its verified format", () => {
    const moduleE = BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === "E")!;
    expect(moduleE.readingQuestions.length).toBeGreaterThanOrEqual(8);
    expect(moduleE.readingQuestions.length).toBeLessThanOrEqual(10);
  });
});

describe("BAGRUT_AI_CONTENT_DISCLAIMER", () => {
  it("is real, non-empty text the UI can render", () => {
    expect(BAGRUT_AI_CONTENT_DISCLAIMER.trim().length).toBeGreaterThan(20);
  });
});

describe("getPublishableSampleUnit", () => {
  it("serves content that is disclosed as AI-written, even without teacher review", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      expect(getPublishableSampleUnit(unit.moduleCode)).toBe(unit);
    }
  });

  it("returns undefined for a module with no sample content at all", () => {
    expect(getPublishableSampleUnit("G")).toBeUndefined();
  });
});

describe("getSampleUnit", () => {
  it("returns the unit regardless of review status", () => {
    expect(getSampleUnit("B")).toBeDefined();
  });
});
