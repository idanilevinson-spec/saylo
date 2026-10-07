import { describe, expect, it } from "vitest";
import { BAGRUT_SKILLS, skillsForModule } from "./skills";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "./moduleFormats";

describe("Bagrut skills library", () => {
  it("has unique slugs", () => {
    const slugs = BAGRUT_SKILLS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every module at least one skill to strengthen", () => {
    for (const code of Object.keys(BAGRUT_MODULE_FORMATS) as BagrutModuleCode[]) {
      expect(skillsForModule(code).length).toBeGreaterThan(0);
    }
  });

  it("only links listening to the one module that has a listening section", () => {
    const listening = BAGRUT_SKILLS.filter((s) => s.kind === "listening").flatMap((s) => s.modules);
    expect(listening).toEqual(["A"]);
  });

  it("never links writing skills to module E, which has no writing section", () => {
    const writingModules = BAGRUT_SKILLS.filter((s) => s.kind === "writing").flatMap((s) => s.modules);
    expect(writingModules).not.toContain("E");
    expect(writingModules).not.toContain("A");
  });

  for (const skill of BAGRUT_SKILLS) {
    it(`${skill.slug}: a multiple-choice example has a valid answer key`, () => {
      const { options, correctOptionIndex } = skill.example;
      if (!options) return;
      expect(correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(correctOptionIndex).toBeLessThan(options.length);
    });

    it(`${skill.slug}: Hebrew copy addresses the learner in the plural, never a slash form`, () => {
      const hebrew = [skill.whatHe, skill.summaryHe, ...skill.stepsHe, ...skill.trapsHe, skill.example.explanationHe].join(" ");
      expect(hebrew).not.toMatch(/[א-ת]\/[א-ת]/);
      // ("את" alone is also the direct-object particle, so only "אתה" is checked.)
      expect(hebrew).not.toMatch(/(^|\s)אתה\s/);
    });
  }
});
