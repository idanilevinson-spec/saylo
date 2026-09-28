import { describe, expect, it } from "vitest";
import { countWords, detectApostropheIssues, detectCapitalizationIssues } from "./textAnalysis";

describe("countWords", () => {
  it("counts space-separated words", () => {
    expect(countWords("This is a test")).toBe(4);
  });

  it("collapses extra whitespace", () => {
    expect(countWords("  hello    world  ")).toBe(2);
  });

  it("returns 0 for empty or whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("detectCapitalizationIssues", () => {
  it("flags a lowercase start of the text", () => {
    expect(detectCapitalizationIssues("hello there.")).toBeGreaterThanOrEqual(1);
  });

  it("does not flag a properly capitalized sentence", () => {
    expect(detectCapitalizationIssues("Hello there. I am fine.")).toBe(0);
  });

  it("flags a lowercase letter after sentence-ending punctuation", () => {
    expect(detectCapitalizationIssues("I went home. it was late.")).toBe(1);
  });

  it("flags a standalone lowercase i as its own word", () => {
    expect(detectCapitalizationIssues("i am from israel")).toBeGreaterThanOrEqual(1);
  });

  it("does not flag i inside a longer word", () => {
    expect(detectCapitalizationIssues("This is fine")).toBe(0);
  });

  it("counts a standalone i even inside a contraction", () => {
    expect(detectCapitalizationIssues("i'm happy")).toBeGreaterThanOrEqual(1);
  });
});

describe("detectApostropheIssues", () => {
  it("flags common contractions missing an apostrophe", () => {
    expect(detectApostropheIssues("I dont know if its ready")).toBe(1);
  });

  it("does not flag correctly written contractions", () => {
    expect(detectApostropheIssues("I don't know if it's ready")).toBe(0);
  });

  it("is case-insensitive", () => {
    expect(detectApostropheIssues("Dont worry")).toBe(1);
  });

  it("does not flag words that merely contain a listed substring", () => {
    expect(detectApostropheIssues("The scandal caused a stir")).toBe(0);
  });

  it("counts multiple distinct occurrences", () => {
    expect(detectApostropheIssues("I cant go and I wont stay")).toBe(2);
  });
});
