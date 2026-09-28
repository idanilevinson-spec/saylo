import { describe, expect, it } from "vitest";
import { getCanDoStatement } from "./canDoStatements";
import type { CefrLevel, SkillArea } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const COVERED_SKILLS: SkillArea[] = ["listening", "reading", "writing", "speaking"];
const UNCOVERED_SKILLS: SkillArea[] = ["vocabulary", "grammar"];

describe("getCanDoStatement", () => {
  it("has a non-empty statement for every covered skill at every CEFR level", () => {
    for (const skill of COVERED_SKILLS) {
      for (const level of CEFR_LEVELS) {
        const statement = getCanDoStatement(skill, level);
        expect(statement).not.toBeNull();
        expect(statement!.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("returns null for skills CEFR doesn't describe on their own", () => {
    for (const skill of UNCOVERED_SKILLS) {
      for (const level of CEFR_LEVELS) {
        expect(getCanDoStatement(skill, level)).toBeNull();
      }
    }
  });

  it("gives every level a distinct statement per skill", () => {
    for (const skill of COVERED_SKILLS) {
      const statements = CEFR_LEVELS.map((level) => getCanDoStatement(skill, level));
      expect(new Set(statements).size).toBe(CEFR_LEVELS.length);
    }
  });
});
