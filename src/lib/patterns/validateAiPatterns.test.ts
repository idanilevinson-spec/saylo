import { describe, expect, it } from "vitest";
import { validateAiPatterns } from "./validateAiPatterns";

const TEXT = "I live here since 2020. She happy today, and i dont know why.";

describe("validateAiPatterns", () => {
  it("accepts a pattern whose quote is really in the source text", () => {
    const result = validateAiPatterns(
      [{ code: "PRESENT_PERFECT", quote: "I live here since 2020" }],
      TEXT,
      "writing"
    );
    expect(result).toEqual([{ code: "PRESENT_PERFECT", occurrences: 1 }]);
  });

  it("drops a pattern whose quote does not appear in the source text at all", () => {
    const result = validateAiPatterns(
      [{ code: "MISSING_COPULA", quote: "he was very tired yesterday" }],
      TEXT,
      "writing"
    );
    expect(result).toEqual([]);
  });

  it("is whitespace- and case-insensitive when matching the quote", () => {
    const result = validateAiPatterns([{ code: "MISSING_COPULA", quote: "SHE   happy TODAY" }], TEXT, "writing");
    expect(result).toEqual([{ code: "MISSING_COPULA", occurrences: 1 }]);
  });

  it("drops a code that isn't in the closed list, unless it is OTHER", () => {
    const result = validateAiPatterns(
      [
        { code: "MADE_UP_CODE", quote: "she happy today" },
        { code: "OTHER", quote: "she happy today" },
      ],
      TEXT,
      "writing"
    );
    expect(result).toEqual([{ code: "OTHER", occurrences: 1 }]);
  });

  it("drops a spelling pattern that isn't AI-detectable for the given source", () => {
    const result = validateAiPatterns([{ code: "CAPITALIZATION", quote: "i dont know why" }], TEXT, "writing");
    expect(result).toEqual([]);
  });

  it("never allows a writing-only pattern to be counted from a conversation", () => {
    const result = validateAiPatterns([{ code: "DOUBLE_LETTERS", quote: "she happy today" }], TEXT, "conversation");
    expect(result).toEqual([]);
  });

  it("counts repeated occurrences of the same pattern", () => {
    const result = validateAiPatterns(
      [
        { code: "MISSING_COPULA", quote: "she happy today" },
        { code: "MISSING_COPULA", quote: "I live here since 2020" },
      ],
      TEXT,
      "writing"
    );
    expect(result).toEqual([{ code: "MISSING_COPULA", occurrences: 2 }]);
  });

  it("caps occurrences at 20", () => {
    const many = Array.from({ length: 25 }, () => ({ code: "MISSING_COPULA", quote: "she happy today" }));
    const result = validateAiPatterns(many, TEXT, "writing");
    expect(result).toEqual([{ code: "MISSING_COPULA", occurrences: 20 }]);
  });

  it("ignores malformed entries instead of throwing", () => {
    expect(validateAiPatterns(null, TEXT, "writing")).toEqual([]);
    expect(validateAiPatterns("not an array", TEXT, "writing")).toEqual([]);
    expect(validateAiPatterns([null, 42, {}, { code: 5, quote: "x" }], TEXT, "writing")).toEqual([]);
  });

  it("drops an entry with an empty quote", () => {
    expect(validateAiPatterns([{ code: "MISSING_COPULA", quote: "   " }], TEXT, "writing")).toEqual([]);
  });
});
