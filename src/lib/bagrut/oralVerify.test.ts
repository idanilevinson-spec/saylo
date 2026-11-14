import { describe, expect, it } from "vitest";
import {
  countPhrase,
  keepPatternsFromTranscript,
  noteProblems,
  stripProblemSentences,
  verifyWords,
} from "./oralVerify";
import type { OralSetFeedback } from "./oralSets";

// The real transcript and the real false claims from the 2026-11-14 run.
const T =
  "I think people come because it saves money and also because they don't want to throw things away. Another reason is that they learn how to fix things by themselves. Yes, I would volunteer at a place like this because I like to fix bikes.";

const base: OralSetFeedback = {
  scores: { topic: 70, delivery: 65, vocabulary: 60, language: 70 },
  notesHe: { topic: "א.", delivery: "ב.", vocabulary: "ג.", language: "ד." },
  missedQuestions: [],
  nextLevelAnswer: "x",
  patterns: [],
  words: { usedWell: [], repeated: [], tryNext: [] },
};

describe("countPhrase", () => {
  it("counts whole words, ignoring case and punctuation", () => {
    expect(countPhrase(T, "because")).toBe(3);
    expect(countPhrase(T, "things")).toBe(2);
    expect(countPhrase(T, "repair")).toBe(0);
    expect(countPhrase(T, "Fix")).toBe(2);
    expect(countPhrase(T, "by themselves")).toBe(1);
    expect(countPhrase(T, "the")).toBe(0); // only inside "they"/"themselves"
    expect(countPhrase(T, "")).toBe(0);
  });
});

describe("verifyWords", () => {
  it("keeps only true word claims, with real counts", () => {
    const f = verifyWords(
      {
        ...base,
        words: {
          usedWell: ["by themselves", "repair"],
          repeated: [{ phrase: "things", times: 0 }, { phrase: "free time", times: 0 }],
          tryNext: ["because", "for example"],
        },
      },
      T,
    );
    expect(f.words).toEqual({
      usedWell: ["by themselves"],
      repeated: [{ phrase: "things", times: 2 }],
      tryNext: ["for example"],
    });
  });
});

describe("notes", () => {
  const bad: OralSetFeedback = {
    ...base,
    notesHe: {
      ...base.notesHe,
      vocabulary: "יש שימוש נכון במילים כמו 'repair' ו-'by themselves'. אוצר המילים מוגבל.",
      language: "המשפטים נכונים. כדאי לחבר עם because או so.",
      delivery: "חוזרים על 'things' כמה פעמים. המשפטים ברורים.",
      topic: "כדאי לגוון במקום לחזור על אותם ביטויים.",
    },
  };

  it("finds quotes that weren't said, English outside quotes and repetition claims", () => {
    const p = noteProblems(bad, T);
    expect(p.vocabulary).toEqual(["'repair' does not appear in the answer"]);
    expect(p.language?.[0]).toMatch(/English outside a quote: because, so/);
    expect(p.delivery).toEqual(["claims something is repeated"]);
    expect(p.topic).toEqual(["claims something is repeated"]);
  });

  it("cuts only the sentences that break a rule", () => {
    const s = stripProblemSentences(bad, T).notesHe;
    expect(s.vocabulary).toBe("אוצר המילים מוגבל.");
    expect(s.language).toBe("המשפטים נכונים.");
    expect(s.delivery).toBe("המשפטים ברורים.");
  });

  it("a note left empty gets a plain true sentence", () => {
    const s = stripProblemSentences({ ...base, notesHe: { ...base.notesHe, topic: "Try harder." } }, T).notesHe;
    expect(s.topic).toMatch(/כדאי/);
  });
});

it("drops a pattern that wasn't said", () => {
  const f = keepPatternsFromTranscript(
    { ...base, patterns: [{ said: "I am agree", better: "I agree", whyHe: "x" }, { said: "fix bikes", better: "fix bikes", whyHe: "y" }] },
    T,
  );
  expect(f.patterns.map((p) => p.said)).toEqual(["fix bikes"]);
});
