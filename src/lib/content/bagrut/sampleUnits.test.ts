import { describe, expect, it } from "vitest";
import {
  BAGRUT_SAMPLE_UNITS,
  getPublishableSampleUnit,
  getPublishableSampleUnits,
  getSampleUnit,
  BAGRUT_AI_CONTENT_DISCLAIMER,
} from "./sampleUnits";
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

  it("gives every module D unit a plausible literature-passage length anyway", () => {
    // Unit 2 is a short poem rather than a story, so the floor is lower
    // than unit 1's prose-story minimum — both still read as "a real
    // literary text," not a one-line placeholder or a full novella.
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      if (unit.moduleCode !== "D") continue;
      const words = countWords(unit.readingPassages[0]);
      expect(words).toBeGreaterThanOrEqual(60);
      expect(words).toBeLessThanOrEqual(500);
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

  it("gives every module E unit a vocabulary section instead of a writing task, and vice versa for B", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      if (unit.moduleCode === "E") {
        expect(unit.writingTask).toBeUndefined();
        expect(unit.vocabularyQuestions?.length).toBe(5);
      }
      if (unit.moduleCode === "B") {
        expect(unit.writingTask).toBeDefined();
        expect(unit.vocabularyQuestions).toBeUndefined();
      }
    }
  });

  it("gives every module E unit between 8 and 10 reading questions, per its verified format", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      if (unit.moduleCode !== "E") continue;
      expect(unit.readingQuestions.length).toBeGreaterThanOrEqual(8);
      expect(unit.readingQuestions.length).toBeLessThanOrEqual(10);
    }
  });

  it("gives every module a unique unitSlug per module (no two units with the same slug)", () => {
    const seen = new Set<string>();
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      const key = `${unit.moduleCode}:${unit.unitSlug}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
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
      expect(getPublishableSampleUnit(unit.moduleCode, unit.unitSlug)).toBe(unit);
    }
  });

  it("returns undefined for a module/unitSlug combination with no sample content registered", () => {
    // Every verified module (A–G) now has sample content as of 2026-10-02 —
    // there's no real gap left to assert against, so this exercises the
    // "not found" path with a code that was never a valid module to begin
    // with, via a type assertion.
    expect(getPublishableSampleUnit("Z" as BagrutModuleCode, "1")).toBeUndefined();
  });

  it("returns undefined for a unitSlug that doesn't exist on an otherwise real module", () => {
    expect(getPublishableSampleUnit("B", "99")).toBeUndefined();
  });
});

describe("getPublishableSampleUnits", () => {
  it("returns every unit for a module, all publishable", () => {
    for (const code of ["A", "B", "C", "D", "E", "F", "G"] as const) {
      const units = getPublishableSampleUnits(code);
      expect(units.length).toBeGreaterThanOrEqual(2);
      for (const unit of units) {
        expect(unit.moduleCode).toBe(code);
        expect(unit.teacherReviewed || unit.aiContentDisclosed).toBe(true);
      }
    }
  });

  it("returns an empty array for a module with no units", () => {
    expect(getPublishableSampleUnits("Z" as BagrutModuleCode)).toEqual([]);
  });
});

describe("getSampleUnit", () => {
  it("returns the unit regardless of review status", () => {
    expect(getSampleUnit("B", "1")).toBeDefined();
  });
});
