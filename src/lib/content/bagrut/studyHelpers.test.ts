import { describe, expect, it } from "vitest";
import { nextSet, paragraphRef, splitParagraphs } from "./studyHelpers";
import { BAGRUT_SAMPLE_UNITS } from "./sampleUnits";
import type { BagrutUnitProgress } from "@/types/database";

describe("paragraphRef", () => {
  it("reads the paragraph a question names", () => {
    expect(paragraphRef("According to paragraph 3, why...", [5])).toEqual({ passage: 0, paragraph: 3 });
    expect(paragraphRef("Text 2, paragraph 5: what does it mean?", [4, 6])).toEqual({ passage: 1, paragraph: 5 });
    expect(paragraphRef("What is the main idea of the last paragraph?", [5])).toEqual({ passage: 0, paragraph: 5 });
    expect(paragraphRef("According to the final paragraph, ...", [6])).toEqual({ passage: 0, paragraph: 6 });
    expect(paragraphRef("In the first paragraph, ...", [6])).toEqual({ passage: 0, paragraph: 1 });
  });

  it("returns null when no paragraph, or one that doesn't exist, is named", () => {
    expect(paragraphRef("Why did Ruth start the project?", [5])).toBeNull();
    expect(paragraphRef("According to paragraph 9, ...", [5])).toBeNull();
    expect(paragraphRef("Text 3, paragraph 1", [4, 6])).toBeNull();
  });

  it("finds a real paragraph for every paragraph-numbered question in the bank", () => {
    for (const unit of BAGRUT_SAMPLE_UNITS) {
      const counts = unit.readingPassages.map((p) => splitParagraphs(p).length);
      for (const q of unit.readingQuestions) {
        if (!/\bparagraph \d+\b/i.test(q.promptEn)) continue;
        expect(paragraphRef(q.promptEn, counts), `${unit.moduleCode}${unit.unitSlug}: ${q.promptEn}`).not.toBeNull();
      }
    }
  });
});

const row = (code: BagrutUnitProgress["module_code"], slug: string, best: number): BagrutUnitProgress => ({
  profile_id: "p",
  module_code: code,
  unit_slug: slug,
  mc_correct: 1,
  mc_total: 1,
  best_percent: best,
  attempts: 1,
  completed_at: "2026-11-16T10:00:00Z",
});

describe("nextSet", () => {
  it("starts with the first set never done, in questionnaire order", () => {
    expect(nextSet(["E", "F"], [])).toEqual({ code: "E", slug: "1" });
    expect(nextSet(["E", "F"], [row("E", "1", 90), row("E", "2", 40)])).toEqual({ code: "E", slug: "3" });
  });

  it("when all are done, returns the weakest one below a strong score, or null", () => {
    const all = (best: (slug: string) => number) => ["1", "2", "3", "4", "5", "6"].map((s) => row("G", s, best(s)));
    expect(nextSet(["G"], all((s) => (s === "4" ? 50 : s === "2" ? 70 : 95)))).toEqual({ code: "G", slug: "4" });
    expect(nextSet(["G"], all(() => 90))).toBeNull();
  });
});
