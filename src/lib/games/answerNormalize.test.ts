import { describe, expect, it } from "vitest";
import { normalizeWordAnswer } from "./answerNormalize";
import { checkSpelling } from "./spelling";
import { gradeTestStep } from "./testContent";
import { normalizeSpokenWord } from "./speakingTestContent";

describe("normalizeWordAnswer", () => {
  it("accepts the iPhone's curly apostrophe for a straight one", () => {
    expect(checkSpelling("You’re welcome", "you're welcome")).toBe(true);
    expect(checkSpelling("what‘s up", "what's up")).toBe(true);
  });

  it("ignores punctuation that speech recognition adds at the end", () => {
    expect(normalizeSpokenWord("How are you?")).toBe(normalizeSpokenWord("how are you"));
    expect(normalizeSpokenWord("Good night.")).toBe("good night");
  });

  it("reads digits from speech recognition back as number words", () => {
    expect(normalizeSpokenWord("11.")).toBe(normalizeSpokenWord("eleven"));
    expect(normalizeSpokenWord("100")).toBe(normalizeSpokenWord("hundred"));
    expect(normalizeSpokenWord("a hundred")).toBe(normalizeSpokenWord("hundred"));
    expect(normalizeSpokenWord("1st")).toBe(normalizeSpokenWord("first"));
    expect(normalizeSpokenWord("12")).not.toBe(normalizeSpokenWord("eleven"));
    expect(checkSpelling("11", "eleven")).toBe(false);
  });

  it("still rejects a different word", () => {
    expect(checkSpelling("your welcome", "you're welcome")).toBe(false);
    expect(checkSpelling("hi", "hello")).toBe(false);
    expect(normalizeWordAnswer("cats")).not.toBe(normalizeWordAnswer("cat"));
  });

  it("grades a typed recall step the same way", () => {
    const step = { type: "recall", correctAnswer: "you're welcome" } as Parameters<typeof gradeTestStep>[0];
    expect(gradeTestStep(step, "You’re  welcome!")).toBe(true);
  });
});
