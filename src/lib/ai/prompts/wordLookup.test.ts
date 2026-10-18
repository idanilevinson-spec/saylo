import { describe, expect, it } from "vitest";
import { LOOKUP_WORD, buildWordLookupPrompt, cleanWordMeaning, normalizeTappedWord } from "./wordLookup";

describe("cleanWordMeaning", () => {
  it("keeps a good answer and normalises it", () => {
    expect(cleanWordMeaning({ lemma: "Pursue", he: "לעסוק ב — לרדוף אחר", pos: "verb" })).toEqual({
      lemma: "pursue",
      he: "לעסוק ב, לרדוף אחר",
      pos: "verb",
    });
  });

  it("accepts phrases and drops an unknown part of speech", () => {
    expect(cleanWordMeaning({ lemma: "look forward to", he: "לצפות ל", pos: "idiom" })).toEqual({
      lemma: "look forward to",
      he: "לצפות ל",
      pos: null,
    });
  });

  it("rejects junk", () => {
    expect(cleanWordMeaning(null)).toBeNull();
    expect(cleanWordMeaning({ lemma: "שלום", he: "x" })).toBeNull();
    expect(cleanWordMeaning({ lemma: "run", he: "" })).toBeNull();
    expect(cleanWordMeaning({ lemma: 5, he: "x" })).toBeNull();
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
