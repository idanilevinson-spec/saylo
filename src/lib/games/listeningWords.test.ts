import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/srs/queue", () => ({ getDailyReview: vi.fn() }));

import { buildListeningItems } from "./listeningWords";

const pool = [
  { vocabularyItemId: "1", headword: "kitchen", translationHe: "מטבח" },
  { vocabularyItemId: "2", headword: "chicken", translationHe: "תרנגולת" },
  { vocabularyItemId: "3", headword: "kitten", translationHe: "גור חתולים" },
  { vocabularyItemId: "4", headword: "garden", translationHe: "גינה" },
  { vocabularyItemId: "5", headword: "window", translationHe: "חלון" },
  { vocabularyItemId: "6", headword: "keep", translationHe: "לשמור" },
];

describe("buildListeningItems", () => {
  const items = buildListeningItems(pool.slice(0, 4), pool);

  it("alternates meaning and spelling questions", () => {
    expect(items.map((i) => i.mode)).toEqual(["meaning", "spelling", "meaning", "spelling"]);
  });

  it("puts the right answer at correctIndex, once, among 4 distinct options", () => {
    for (const item of items) {
      expect(item.options).toHaveLength(4);
      expect(new Set(item.options).size).toBe(4);
      const answer = item.mode === "meaning" ? item.translationHe : item.headword;
      expect(item.options[item.correctIndex]).toBe(answer);
      expect(item.options.filter((o) => o === answer)).toHaveLength(1);
    }
  });

  it("uses Hebrew options for meaning and English for spelling", () => {
    expect(items[0].options.every((o) => /[֐-׿]/.test(o))).toBe(true);
    expect(items[1].options.every((o) => /^[a-z]+$/i.test(o))).toBe(true);
  });

  it("prefers look-alike words as spelling distractors", () => {
    const [spelling] = buildListeningItems([pool[0], pool[0]], pool, () => 0).slice(1);
    // "kitchen": kitten and keep share the k; window/garden don't.
    expect(spelling.options).toContain("kitten");
    expect(spelling.options).not.toContain("window");
  });
});
