import { describe, expect, it } from "vitest";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import { skillsForModule } from "@/lib/content/bagrut/skills";
import {
  countWords,
  gradeWriting,
  lengthDeduction,
  minWordsToCheck,
  WRITING_CRITERIA,
  WRITING_RUBRICS,
  writingRulesFor,
} from "./writingRules";

const MODULES = Object.keys(BAGRUT_MODULE_FORMATS) as BagrutModuleCode[];

describe("the two published rubrics", () => {
  it("add up to the task's points: 30 and 40", () => {
    for (const id of ["C", "G"] as const) {
      const r = WRITING_RUBRICS[id];
      expect(WRITING_CRITERIA.reduce((sum, { key }) => sum + r.levels[key][0], 0)).toBe(r.total);
      for (const { key } of WRITING_CRITERIA) {
        expect(r.levels[key]).toHaveLength(4);
        expect(r.levels[key][3]).toBe(0);
        expect([...r.levels[key]].sort((a, b) => b - a)).toEqual([...r.levels[key]]);
      }
    }
    expect(WRITING_RUBRICS.C.total).toBe(30);
    expect(WRITING_RUBRICS.G.total).toBe(40);
  });

  it("every module with a writing task has rules, worth what the module format says", () => {
    for (const code of MODULES) {
      const hasTask = getPublishableSampleUnits(code).some((u) => u.writingTask);
      const rules = writingRulesFor(code);
      expect(!!rules, code).toBe(hasTask);
      if (!rules) continue;
      const section = BAGRUT_MODULE_FORMATS[code].sections.find((s) => s.nameHe === "כתיבה" || s.nameHe === "חיבור");
      expect(section?.points, code).toBe(WRITING_RUBRICS[rules.rubric].total);
    }
  });

  it("a text inside a set's own word range never loses points for length", () => {
    for (const code of MODULES) {
      for (const unit of getPublishableSampleUnits(code)) {
        if (!unit.writingTask) continue;
        const [min, max] = unit.writingTask.wordCountRange;
        expect(lengthDeduction(code, min), `${code}/${unit.unitSlug}`).toBe(0);
        expect(lengthDeduction(code, max), `${code}/${unit.unitSlug}`).toBe(0);
        expect(minWordsToCheck(code)).toBeLessThan(min);
      }
    }
  });

  it("every module with a writing task has a model answer to show", () => {
    for (const code of MODULES) {
      if (!writingRulesFor(code)) continue;
      expect(skillsForModule(code).some((s) => s.kind === "writing" && s.example.modelAnswerEn), code).toBe(true);
    }
  });
});

describe("lengthDeduction, by the Ministry's tables", () => {
  it("module C (70-90 words)", () => {
    expect([90, 70, 69, 60, 59, 50, 49, 40, 39, 30, 29, 25, 24].map((w) => lengthDeduction("C", w))).toEqual([
      0, 0, 1, 1, 3, 3, 6, 6, 10, 10, 15, 15, 30,
    ]);
  });
  it("module D", () => {
    expect([80, 79, 70, 69, 60, 59, 49, 39, 29, 24].map((w) => lengthDeduction("D", w))).toEqual([0, 1, 1, 2, 2, 3, 6, 10, 15, 30]);
  });
  it("module G (120-140 words)", () => {
    expect([140, 120, 119, 109, 99, 89, 79, 69, 59, 50, 49].map((w) => lengthDeduction("G", w))).toEqual([
      0, 0, 2, 4, 8, 12, 16, 18, 20, 20, 40,
    ]);
  });
  it("module F", () => {
    expect([100, 99, 89, 79, 69, 59, 49, 40, 39].map((w) => lengthDeduction("F", w))).toEqual([0, 2, 4, 8, 12, 16, 18, 18, 40]);
  });
  it("the short task (35-40 words)", () => {
    expect([40, 35, 34, 31, 30, 26, 25, 21, 20, 16, 15, 11, 10].map((w) => lengthDeduction("B", w))).toEqual([
      0, 0, 1, 1, 3, 3, 6, 6, 10, 10, 15, 15, 30,
    ]);
  });
  it("a text that is too long loses nothing", () => {
    expect(lengthDeduction("G", 400)).toBe(0);
  });
  it("modules without a writing task have no rules", () => {
    expect(writingRulesFor("A")).toBeNull();
    expect(writingRulesFor("E")).toBeNull();
    expect(gradeWriting("E", {}, 100)).toBeNull();
  });
});

describe("gradeWriting", () => {
  it("adds the criteria and then takes the length deduction off", () => {
    const g = gradeWriting("G", { content: 8, vocabulary: 6, language: 10, mechanics: 4 }, 105)!;
    expect(g).toMatchObject({ rubric: "G", onMerit: 28, lengthOff: 4, total: 24, outOf: 40 });
    expect(g.max).toEqual({ content: 8, vocabulary: 10, language: 16, mechanics: 6 });
  });

  it("clamps what the AI returns to the rubric, and rounds", () => {
    const g = gradeWriting("C", { content: 99, vocabulary: -3, language: 4.6, mechanics: Number.NaN }, 80)!;
    expect(g.points).toEqual({ content: 10, vocabulary: 0, language: 5, mechanics: 0 });
    expect(g.total).toBe(15);
  });

  it("never goes below zero, and a missing score is zero", () => {
    const g = gradeWriting("C", { content: 3 }, 26)!;
    expect(g).toMatchObject({ onMerit: 3, lengthOff: 3, total: 0 });
  });

  it("an off-topic text is zero whatever the scores say", () => {
    const g = gradeWriting("G", { content: 8, vocabulary: 10, language: 16, mechanics: 6 }, 130, { zero: true })!;
    expect(g.total).toBe(0);
    expect(g.onMerit).toBe(0);
  });
});

describe("countWords", () => {
  it("counts runs of non-space characters", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords(" I  went\nhome. ")).toBe(3);
  });
});
