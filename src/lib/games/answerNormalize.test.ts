import { describe, expect, it } from "vitest";
import { normalizeAnswer } from "./answerNormalize";
import { checkSpelling } from "./spelling";
import { gradeTestStep } from "./testContent";
import { normalizeSpokenWord } from "./speakingTestContent";

describe("normalizeAnswer", () => {
  it("accepts the iPhone's curly apostrophe for a straight one", () => {
    expect(checkSpelling("You’re welcome", "you're welcome")).toBe(true);
    expect(checkSpelling("what‘s up", "what's up")).toBe(true);
  });

  it("ignores punctuation that speech recognition adds at the end", () => {
    expect(normalizeSpokenWord("How are you?")).toBe(normalizeSpokenWord("how are you"));
    expect(normalizeSpokenWord("Good night.")).toBe("good night");
  });

  it("still rejects a different word", () => {
    expect(checkSpelling("your welcome", "you're welcome")).toBe(false);
    expect(checkSpelling("hi", "hello")).toBe(false);
    expect(normalizeAnswer("cats")).not.toBe(normalizeAnswer("cat"));
  });

  it("grades a typed recall step the same way", () => {
    const step = { type: "recall", correctAnswer: "you're welcome" } as Parameters<typeof gradeTestStep>[0];
    expect(gradeTestStep(step, "You’re  welcome!")).toBe(true);
  });
});
