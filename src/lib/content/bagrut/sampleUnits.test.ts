import { describe, expect, it } from "vitest";
import { BAGRUT_SAMPLE_UNITS, getPublishableSampleUnit, getSampleUnit, BAGRUT_AI_CONTENT_DISCLAIMER } from "./sampleUnits";
import { getModuleFormat, type BagrutModuleCode } from "./moduleFormats";
import { countWords } from "@/lib/patterns/textAnalysis";

describe("BAGRUT_SAMPLE_UNITS", () => {
  it("keeps every reading passage within its verified module's word-count range, where one is defined", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      const format = getModuleFormat(unit.moduleCode);
      const readingSection = format.sections.find((s) => s.nameHe === "הבנת הנקרא");
      expect(unit.readingPassages.length).toBeGreaterThan(0);
      // Module D is pre-assigned literature, not a word-count-controlled
      // passage — its format intentionally has no wordCountRange, so there's
      // nothing to check it against here (see moduleFormats.ts).
      if (!readingSection?.wordCountRange) continue;
      const [min, max] = readingSection.wordCountRange;
      // Module A has two separate passages, each independently expected to
      // fall in range (not their combined word count) — every other
      // verified module has exactly one passage, where this is equivalent
      // to the old single-passage check.
      for (const passage of unit.readingPassages) {
        const words = countWords(passage);
        expect(words).toBeGreaterThanOrEqual(min);
        expect(words).toBeLessThanOrEqual(max);
      }
    }
  });

  it("gives module D's pre-assigned-literature passage a plausible short-story length anyway", () => {
    const moduleD = BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === "D")!;
    const words = countWords(moduleD.readingPassages[0]);
    expect(words).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(500);
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

  it("returns undefined for a module code with no sample content registered", () => {
    // Every verified module (A–G) now has sample content as of 2026-10-02 —
    // there's no real gap left to assert against, so this exercises the
    // "not found" path with a code that was never a valid module to begin
    // with, via a type assertion.
    expect(getPublishableSampleUnit("Z" as BagrutModuleCode)).toBeUndefined();
  });
});

describe("getSampleUnit", () => {
  it("returns the unit regardless of review status", () => {
    expect(getSampleUnit("B")).toBeDefined();
  });
});
