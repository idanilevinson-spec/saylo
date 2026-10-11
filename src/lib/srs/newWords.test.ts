import { describe, expect, it } from "vitest";
import { newWordsAtLevel } from "./newWords";

const words = [
  { id: "team", cefr_level: "A2" },
  { id: "red", cefr_level: "A1" },
  { id: "dilemma", cefr_level: "C2" },
  { id: "verdict", cefr_level: "B2" },
  { id: "innovation", cefr_level: "C1" },
  { id: "statute", cefr_level: "C2" },
];

describe("newWordsAtLevel", () => {
  it("gives a C2 learner C2 and C1 words first, not A1/A2 ones", () => {
    expect(newWordsAtLevel(words, "C2", 3)).toEqual(["dilemma", "innovation", "statute"]);
  });

  it("tops up from the nearest levels when the learner's level runs out", () => {
    expect(newWordsAtLevel(words, "C2", 4)).toEqual(["dilemma", "innovation", "statute", "verdict"]);
  });

  it("keeps the table order without a level", () => {
    expect(newWordsAtLevel(words, null, 2)).toEqual(["team", "red"]);
  });
});
