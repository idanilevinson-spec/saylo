import { describe, expect, it } from "vitest";
import { historyOf, missedEntries, promptLabel, retryNext, summarize, type PracticeRun } from "./practiceSession";

const entry = (id: string, index: number, ok: boolean, word = false) => ({
  id,
  index,
  ok,
  prompt: `p-${id}`,
  answer: `a-${id}`,
  word,
});

const run: PracticeRun = {
  setKey: "/vocabulary/work-office",
  total: 5,
  entries: {
    c: entry("c", 2, false, true),
    a: entry("a", 0, true),
    b: entry("b", 1, false),
  },
  retry: null,
};

describe("a practice run", () => {
  it("scores what was answered in this run", () => {
    const s = summarize(run);
    expect(s.answered).toBe(3);
    expect(s.correct).toBe(1);
    expect(s.missed.map((m) => m.id)).toEqual(["b", "c"]);
  });

  it("lists mistakes in the order they came up", () => {
    expect(missedEntries(run).map((m) => m.index)).toEqual([1, 2]);
  });

  it("gives the progress track each position's real result", () => {
    expect(historyOf(run, 5)).toEqual(["correct", "wrong", "wrong", null, null]);
    expect(historyOf(null, 2)).toEqual([null, null]);
  });

  it("walks the retry queue and stops at its end", () => {
    const withRetry: PracticeRun = { ...run, retry: { queue: ["b", "c"], results: {} } };
    expect(retryNext(withRetry, "b")).toBe("c");
    expect(retryNext(withRetry, "c")).toBeNull();
    expect(retryNext(run, "b")).toBeNull();
  });

  it("labels prompts for the list", () => {
    expect(promptLabel("mcq", { prompt: "מה המילה?", options: ["a", "b"], correctIndex: 0 })).toBe("מה המילה?");
    expect(promptLabel("fill_blank", { sentence: "I ___ here.", correctAnswer: "live" })).toBe("I _____ here.");
    expect(promptLabel("match", { pairs: [] })).toBe("התאמת זוגות");
  });
});
