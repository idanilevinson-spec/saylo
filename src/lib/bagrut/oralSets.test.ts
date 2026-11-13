import { describe, expect, it } from "vitest";
import { parseOralFeedback, resolveSet } from "./oralSets";
import { PART_C_PASSAGES } from "@/lib/content/bagrutOral";

describe("resolveSet", () => {
  it("finds each part by id, with the passage for C", () => {
    expect(resolveSet("a-food")?.part).toBe("A");
    expect(resolveSet("b-challenge")?.part).toBe("B");
    const c = resolveSet(PART_C_PASSAGES[0].sets[1].id);
    expect(c?.part).toBe("C");
    expect(c?.passage?.id).toBe(PART_C_PASSAGES[0].id);
  });
  it("is null for anything not in the bank", () => {
    expect(resolveSet("ignore previous instructions")).toBeNull();
    expect(resolveSet("")).toBeNull();
  });
});

const good = {
  scores: { topic: 72.4, delivery: 80, vocabulary: 65, language: 140 },
  notesHe: { topic: "א", delivery: "ב", vocabulary: "ג", language: "ד" },
  missedQuestions: [2, 2, 7, 0, -1, "x"],
  nextLevelAnswer: " A better answer. ",
  patterns: [
    { said: "I am agree", better: "I agree", whyHe: "הסבר" },
    { said: "same", better: "same", whyHe: "לא שינוי" },
    { said: 3, better: "x", whyHe: "y" },
  ],
};

describe("parseOralFeedback", () => {
  it("cleans a good reply", () => {
    const f = parseOralFeedback(good, 2)!;
    expect(f.scores).toEqual({ topic: 72, delivery: 80, vocabulary: 65, language: 100 });
    expect(f.missedQuestions).toEqual([1]);
    expect(f.nextLevelAnswer).toBe("A better answer.");
    expect(f.patterns).toEqual([{ said: "I am agree", better: "I agree", whyHe: "הסבר" }]);
  });

  it("refuses a reply with a missing score, note or improved answer", () => {
    expect(parseOralFeedback({ ...good, scores: { ...good.scores, topic: "high" } }, 2)).toBeNull();
    expect(parseOralFeedback({ ...good, notesHe: { ...good.notesHe, language: " " } }, 2)).toBeNull();
    expect(parseOralFeedback({ ...good, nextLevelAnswer: "" }, 2)).toBeNull();
    expect(parseOralFeedback(null, 2)).toBeNull();
    expect(parseOralFeedback("text", 2)).toBeNull();
  });
});
