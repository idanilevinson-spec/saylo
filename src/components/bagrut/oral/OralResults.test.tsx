import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import OralResults, { type GradedSet } from "./OralResults";

// The grading reply below is the real one the AI returned for a test answer
// on 2026-11-13 (shortened), so the screen is checked against real output.
const feedback = {
  scores: { topic: 60, delivery: 55, vocabulary: 45, language: 45 },
  notesHe: { topic: "פיתוח", delivery: "שטף", vocabulary: "מילים", language: "דקדוק" },
  missedQuestions: [1],
  nextLevelAnswer: "So, my project is about bees in my city. [one example of something new you learned about bees]",
  patterns: [{ said: "I am agree with him", better: "I agree with him", whyHe: "בעברית אומרים 'אני מסכים', ובאנגלית 'I agree'." }],
};

const base: Omit<GradedSet, "setId" | "part" | "labelHe" | "result"> = {
  questions: ["Describe your project in a few sentences.", "What was the hardest part?"],
  answer: { transcript: "um so my project is about the bees in my city", seconds: 48 },
};

const sets: GradedSet[] = [
  { ...base, setId: "a", part: "A", labelHe: "A", result: { status: "ok", grade: 80, lengthDeduction: 0, feedback } },
  { ...base, setId: "b", part: "B", labelHe: "B", result: { status: "ok", grade: 49, lengthDeduction: 0.1, feedback } },
  { ...base, setId: "c1", part: "C", labelHe: "C1", result: { status: "error", message: "לא הצלחנו לבדוק", retryable: true } },
  { ...base, setId: "c2", part: "C", labelHe: "C2", result: { status: "loading" } },
];

describe("OralResults", () => {
  const html = renderToStaticMarkup(<OralResults sets={sets} examGrade={null} onRetry={() => {}} />);

  it("waits for every part before showing a total", () => {
    expect(html).toContain("הציון הכולל יופיע כשכל החלקים ייבדקו");
  });

  it("shows criteria, the missed question, the length deduction and the error with its retry", () => {
    expect(html).toContain("פיתוח הנושא");
    expect(html).toContain("What was the hardest part?");
    expect(html).toContain("ירדו 10%");
    expect(html).toContain("לא הצלחנו לבדוק");
    expect(html).toContain("לבדוק שוב");
  });

  it("marks only what changed in the improved answer", () => {
    expect(html).toMatch(/<mark[^>]*>\[one<\/mark>/);
    expect(html).not.toMatch(/<mark[^>]*>project<\/mark>/);
  });

  it("offers no retry when the problem is the daily limit", () => {
    const limited = [{ ...sets[2], result: { status: "error" as const, message: "הגעתם למספר הסימולציות ליום", retryable: false } }];
    expect(renderToStaticMarkup(<OralResults sets={limited} examGrade={null} onRetry={() => {}} />)).not.toContain("לבדוק שוב");
  });

  it("states that it is an estimate, not an official grade", () => {
    expect(html).toContain("לא ציון של בוחן");
  });

  it("shows the total once all four sets are graded", () => {
    const done = sets.map((s) => ({ ...s, result: { status: "ok" as const, grade: 70, lengthDeduction: 0, feedback } }));
    expect(renderToStaticMarkup(<OralResults sets={done} examGrade={70} onRetry={() => {}} />)).toContain(">70<");
  });
});
