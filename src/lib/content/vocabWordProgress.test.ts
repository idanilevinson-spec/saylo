import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/browserClient", () => ({ supabase: {} }));

import { summarizeWordProgress, withWordProgress } from "./vocabWordProgress";
import { summarizeUnit, type ResolvedStep } from "./courseProgress";
import { findUnit, COURSE_UNITS } from "./course";

const words = [
  { id: "w1", topic_id: "food" },
  { id: "w2", topic_id: "food" },
  { id: "w3", topic_id: "food" },
  { id: "w4", topic_id: "travel" },
];

describe("word progress per topic", () => {
  it("counts practised and mastered words per topic", () => {
    const p = summarizeWordProgress(words, [
      { vocabulary_item_id: "w1", repetitions: 4 },
      { vocabulary_item_id: "w2", repetitions: 1 },
    ]);
    expect(p.get("food")).toEqual({ words: 3, practised: 2, mastered: 1 });
    expect(p.get("travel")).toEqual({ words: 1, practised: 0, mastered: 0 });
  });

  it("ignores reviews of words outside the published list", () => {
    const p = summarizeWordProgress(words, [{ vocabulary_item_id: "gone", repetitions: 9 }]);
    expect(p.get("food")?.practised).toBe(0);
  });
});

describe("a vocabulary topic's status", () => {
  it("starts once any word was practised in the learn game or a test", () => {
    expect(withWordProgress("todo", { words: 3, practised: 1, mastered: 0 })).toBe("started");
  });

  it("is done when every word is mastered, even without exercises", () => {
    expect(withWordProgress("todo", { words: 3, practised: 3, mastered: 3 })).toBe("done");
    expect(withWordProgress("started", { words: 3, practised: 3, mastered: 3 })).toBe("done");
  });

  it("keeps exercise mastery, and stays put with no word practice", () => {
    expect(withWordProgress("done", { words: 3, practised: 1, mastered: 0 })).toBe("done");
    expect(withWordProgress("todo", undefined)).toBe("todo");
    expect(withWordProgress("started", { words: 3, practised: 0, mastered: 0 })).toBe("started");
  });

  it("never finishes a topic with no words", () => {
    expect(withWordProgress("started", { words: 0, practised: 0, mastered: 0 })).toBe("started");
  });
});

describe("unit counters", () => {
  const unit = findUnit(COURSE_UNITS[0].id)!;
  const step = (status: ResolvedStep["status"], i: number): ResolvedStep => ({
    ...unit.steps[0],
    contentId: `c${i}`,
    titleHe: "x",
    titleEn: null,
    href: "/x",
    minutes: 5,
    status,
  });

  it("reports in-progress steps next to done ones, so the count matches the track", () => {
    const p = summarizeUnit(unit, [step("started", 1), step("todo", 2), step("done", 3)], false);
    expect(p.done).toBe(1);
    expect(p.inProgress).toBe(1);
    expect(p.total).toBe(4);
    expect(p.status).toBe("started");
  });

  it("a unit with only a practised step is in progress with 0 done", () => {
    const p = summarizeUnit(unit, [step("started", 1), step("todo", 2)], false);
    expect(p.done).toBe(0);
    expect(p.inProgress).toBe(1);
    expect(p.status).toBe("started");
  });
});
