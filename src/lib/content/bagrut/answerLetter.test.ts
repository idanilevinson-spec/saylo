import { describe, expect, it } from "vitest";
import { withoutAnswerLetter } from "./answerLetter";
import { BAGRUT_SAMPLE_UNITS } from "./sampleUnits";

describe("withoutAnswerLetter", () => {
  it("drops the letter and keeps the explanation", () => {
    expect(withoutAnswerLetter("תשובה נכונה: B. מכירת ירקות מחוץ לבית הספר אינה מוזכרת בטקסט.")).toBe(
      "מכירת ירקות מחוץ לבית הספר אינה מוזכרת בטקסט.",
    );
  });

  it("leaves nothing when there is only a letter", () => {
    expect(withoutAnswerLetter("תשובה נכונה: A.")).toBe("");
  });

  it("leaves other model answers alone", () => {
    expect(withoutAnswerLetter("תשובה מקובלת: זמן שבילו עם שכן.")).toBe("תשובה מקובלת: זמן שבילו עם שכן.");
  });

  it("no multiple-choice model answer still names a letter after stripping", () => {
    const left = BAGRUT_SAMPLE_UNITS.flatMap((u) => [...u.readingQuestions, ...(u.vocabularyQuestions ?? [])])
      .filter((q) => q.options)
      .map((q) => withoutAnswerLetter(q.modelAnswerHe))
      .filter((t) => /\b[A-D]\b/.test(t));
    expect(left).toEqual([]);
  });
});
