import { describe, expect, it } from "vitest";
import { mergeFixedNotes } from "./oralReview";
import type { OralSetFeedback } from "./oralSets";

const f: OralSetFeedback = {
  scores: { topic: 82, delivery: 80, vocabulary: 62, language: 72 },
  notesHe: { topic: "א", delivery: "ב", vocabulary: "ישן", language: "ד" },
  missedQuestions: [],
  nextLevelAnswer: "Better.",
  patterns: [],
  words: { usedWell: ["x"], repeated: [], tryNext: [] },
};

describe("mergeFixedNotes", () => {
  it("replaces only the keys that had problems", () => {
    const m = mergeFixedNotes(f, { notesHe: { vocabulary: "חדש", topic: "לא אמור להשתנות" } }, ["vocabulary"]);
    expect(m.notesHe).toEqual({ ...f.notesHe, vocabulary: "חדש" });
    expect(m.scores).toEqual(f.scores);
    expect(m.words).toEqual(f.words);
  });

  it("keeps the original when the fix is unusable", () => {
    expect(mergeFixedNotes(f, null, ["vocabulary"])).toBe(f);
    expect(mergeFixedNotes(f, { notesHe: { vocabulary: " " } }, ["vocabulary"]).notesHe.vocabulary).toBe("ישן");
  });
});
