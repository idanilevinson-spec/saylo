import { describe, expect, it } from "vitest";
import { LOOKUP_WORD, buildWordLookupPrompt, cleanWordMeaning, isStorableMeaning, normalizeTappedWord } from "./wordLookup";

describe("cleanWordMeaning", () => {
  it("keeps a good answer and normalises it", () => {
    expect(
      cleanWordMeaning({ lemma: "Pursue", he: "לעסוק ב — לרדוף אחר", pos: "verb", level: "B2", distractors: ["Avoid", "borrow", "repair", "x1"] }),
    ).toEqual({ lemma: "pursue", he: "לעסוק ב, לרדוף אחר", pos: "verb", level: "B2", distractors: ["avoid", "borrow", "repair"] });
  });

  it("accepts phrases and drops an unknown part of speech", () => {
    expect(cleanWordMeaning({ lemma: "look forward to", he: "לצפות ל", pos: "idiom" })).toEqual({
      lemma: "look forward to",
      he: "לצפות ל",
      pos: null,
      level: "B1",
      distractors: [],
    });
  });

  it("rejects junk", () => {
    expect(cleanWordMeaning(null)).toBeNull();
    expect(cleanWordMeaning({ lemma: "שלום", he: "x" })).toBeNull();
    expect(cleanWordMeaning({ lemma: "run", he: "" })).toBeNull();
    expect(cleanWordMeaning({ lemma: 5, he: "x" })).toBeNull();
  });
});

describe("isStorableMeaning", () => {
  const good = { lemma: "pursue", he: "לעסוק ב", pos: "verb", level: "B2" as const, distractors: ["avoid", "borrow", "repair"] };
  it("keeps real words with a usable review question", () => {
    expect(isStorableMeaning(good)).toBe(true);
  });
  it("skips names, function words and words without three wrong options", () => {
    expect(isStorableMeaning({ ...good, pos: "name" })).toBe(false);
    expect(isStorableMeaning({ ...good, pos: "other" })).toBe(false);
    expect(isStorableMeaning({ ...good, distractors: ["avoid", "pursue"] })).toBe(false);
    expect(cleanWordMeaning({ ...good, distractors: ["pursue", "avoid", "avoid", "borrow"] })?.distractors).toEqual([]);
  });
});

describe("buildWordLookupPrompt", () => {
  it("includes the sentence for context", () => {
    expect(buildWordLookupPrompt("run", "I run a small business.")).toContain("I run a small business.");
  });
});

describe("LOOKUP_WORD and normalizeTappedWord", () => {
  it("accepts English words and rejects anything else", () => {
    for (const w of ["crowded", "don't", "well-known", "I"]) expect(LOOKUP_WORD.test(w)).toBe(true);
    for (const w of ["", "קבלה", "123", "a b", "x".repeat(41)]) expect(LOOKUP_WORD.test(w)).toBe(false);
  });

  it("normalises case, apostrophes and possessives", () => {
    expect(normalizeTappedWord("Teacher’s")).toBe("teacher");
    expect(normalizeTappedWord("Beach")).toBe("beach");
    expect(normalizeTappedWord("don't")).toBe("don't");
  });
});
