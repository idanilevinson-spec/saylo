import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import { stepGoal, stepProgressText } from "./courseStepText";

describe("what finishes a step", () => {
  it("states the real rule for each kind", () => {
    expect(stepGoal("grammar")).toBe("80% נכונות בתרגול, על 3 תשובות לפחות");
    expect(stepGoal("vocabulary")).toContain("או שליטה בכל המילים");
    expect(stepGoal("reading")).toBe("תשובה לכל שאלות ההבנה");
    expect(stepGoal("speaking")).toBe("שיחה אחת עם המורה עד הסוף");
  });
});

describe("how close a step is", () => {
  it("says nothing for steps not started or done", () => {
    expect(stepProgressText({ kind: "grammar", status: "todo", detail: { answered: 0 } })).toBeNull();
    expect(stepProgressText({ kind: "grammar", status: "done", detail: { answered: 5, correct: 5 } })).toBeNull();
  });

  it("counts answers still needed below the minimum", () => {
    expect(stepProgressText({ kind: "grammar", status: "started", detail: { answered: 1, correct: 1 } })).toBe(
      "עניתם על 1. עוד 2 לפחות, ב-80% נכונות",
    );
  });

  it("shows accuracy against the bar once there are enough answers", () => {
    expect(stepProgressText({ kind: "grammar", status: "started", detail: { answered: 6, correct: 4 } })).toBe(
      "67% נכונות על 6 תשובות. צריך 80%",
    );
  });

  it("adds mastered words for a vocabulary topic", () => {
    expect(
      stepProgressText({ kind: "vocabulary", status: "started", detail: { answered: 0, correct: 0, words: 10, wordsMastered: 3 } }),
    ).toBe("3 מתוך 10 מילים בשליטה");
  });

  it("counts answered questions for reading and listening", () => {
    expect(stepProgressText({ kind: "listening", status: "started", detail: { questions: 4, questionsAnswered: 2 } })).toBe(
      "עניתם על 2 מתוך 4 שאלות",
    );
  });
});
