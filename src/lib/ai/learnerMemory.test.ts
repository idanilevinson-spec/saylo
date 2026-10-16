import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { formatLearnerMemory } from "./learnerMemory";

describe("formatLearnerMemory", () => {
  it("is null for a learner with no history", () => {
    expect(formatLearnerMemory({ recurringMistakes: [], recentFixes: [], recentTopics: [], wordsLearning: [] })).toBeNull();
  });

  it("lists only what is known, and forbids inventing more", () => {
    const text = formatLearnerMemory({
      recurringMistakes: [{ label: "השמטת a / an", wrong: "She is doctor", right: "She is a doctor" }],
      recentFixes: [{ original: "I go yesterday", better: "I went yesterday", why: "" }],
      recentTopics: ["Ordering at a Restaurant"],
      wordsLearning: ["receipt", "refund"],
    })!;
    expect(text).toContain('"She is doctor" instead of "She is a doctor"');
    expect(text).toContain('"I go yesterday" → "I went yesterday"');
    expect(text).toContain("Ordering at a Restaurant");
    expect(text).toContain("receipt, refund");
    expect(text).toMatch(/never invent/);
    expect(text).not.toContain("—");
  });

  it("leaves out sections with nothing in them", () => {
    const text = formatLearnerMemory({ recurringMistakes: [], recentFixes: [], recentTopics: [], wordsLearning: ["receipt"] })!;
    expect(text).not.toMatch(/Mistakes that keep coming back/);
    expect(text).toMatch(/learning right now: receipt/);
  });
});
