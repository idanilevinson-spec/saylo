import { describe, expect, it } from "vitest";
import { buildIdiomsQuiz } from "./idiomsQuiz";
import type { CefrLevel, IdiomPhrasalVerb } from "@/types/database";

const idiom = (id: string, cefr_level: CefrLevel, type: "idiom" | "phrasal_verb" = "idiom") =>
  ({ id, phrase: id, type, meaning_he: id, example_en: id, cefr_level }) as IdiomPhrasalVerb;

const all = [
  idiom("a1-1", "A1"),
  idiom("a2-1", "A2"),
  idiom("b1-1", "B1"),
  idiom("c1-1", "C1"),
  idiom("c1-2", "C1"),
  idiom("c2-1", "C2"),
  idiom("c2-2", "C2"),
  idiom("c2-3", "C2"),
];

describe("buildIdiomsQuiz", () => {
  it("asks a C2 learner C2 and C1 items first", () => {
    const qs = buildIdiomsQuiz(all, 5, "C2");
    expect(qs.map((q) => q.id).sort()).toEqual(["c1-1", "c1-2", "c2-1", "c2-2", "c2-3"]);
  });

  it("draws distractors from the nearest levels too", () => {
    for (const q of buildIdiomsQuiz(all, 5, "C2")) {
      expect(q.options.filter((o) => o.startsWith("a1") || o.startsWith("a2"))).toEqual([]);
    }
  });

  it("puts the right answer among the options", () => {
    for (const q of buildIdiomsQuiz(all, 3, "A1")) expect(q.options[q.correctIndex]).toBe(q.id);
  });

  it("works without a level", () => {
    expect(buildIdiomsQuiz(all, 4)).toHaveLength(4);
  });
});
