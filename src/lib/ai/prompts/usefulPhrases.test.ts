import { describe, expect, it } from "vitest";
import { cleanUsefulPhrases } from "./usefulPhrases";

const good = {
  en: "Look forward to",
  he: "לצפות ל",
  pos: "phrase",
  level: "A2",
  distractors: ["give up", "put off", "get along with"],
  example: "I'm really looking forward to hearing about your trip.",
};

describe("cleanUsefulPhrases", () => {
  it("keeps complete phrases in dictionary form", () => {
    expect(cleanUsefulPhrases([good])).toEqual([
      {
        lemma: "look forward to",
        he: "לצפות ל",
        pos: "phrase",
        level: "A2",
        distractors: ["give up", "put off", "get along with"],
        example: "I'm really looking forward to hearing about your trip.",
      },
    ]);
  });

  it("drops items that can't become a review question, duplicates and junk", () => {
    expect(
      cleanUsefulPhrases([
        good,
        { ...good, en: "look forward to" },
        { ...good, en: "spot", distractors: ["place"] },
        { ...good, en: "dana", pos: "name" },
        { ...good, en: "crowded", example: "" },
        "x",
        null,
      ]),
    ).toHaveLength(1);
  });

  it("drops examples that quote a correction, and the 'to' of verbs", () => {
    expect(cleanUsefulPhrases([{ ...good, example: `It's "it was very crowded".` }])).toEqual([]);
    expect(cleanUsefulPhrases([{ ...good, en: "to make a move", pos: "verb" }])[0].lemma).toBe("make a move");
    expect(cleanUsefulPhrases([{ ...good, en: "to be honest" }])[0].lemma).toBe("to be honest");
  });

  it("keeps everyday expressions with punctuation", () => {
    expect(cleanUsefulPhrases([{ ...good, en: "Can you simplify that?" }])[0].lemma).toBe("can you simplify that?");
  });

  it("returns at most five, and nothing for a non-array", () => {
    const many = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"].map((en) => ({ ...good, en }));
    expect(cleanUsefulPhrases(many)).toHaveLength(5);
    expect(cleanUsefulPhrases(undefined)).toEqual([]);
  });
});
