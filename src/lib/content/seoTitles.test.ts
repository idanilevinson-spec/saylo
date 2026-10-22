import { describe, expect, it } from "vitest";
import { MAX_TITLE, TITLE_SUFFIX, fittingTitle, grammarTopicTitle } from "./seoTitles";

describe("grammarTopicTitle", () => {
  it("keeps the full title when it fits", () => {
    expect(grammarTopicTitle("Have to", "have to")).toBe("Have to באנגלית: הסבר בעברית ודוגמאות");
    expect(grammarTopicTitle("Used to", "הרגלים בעבר")).toBe("Used to באנגלית: הרגלים בעבר, הסבר בעברית ודוגמאות");
  });

  it("drops words, not the topic, when the title is too long", () => {
    const t = grammarTopicTitle("Gerunds vs Infinitives: Meaning Changes", "gerund או infinitive: שינוי משמעות");
    expect((t + TITLE_SUFFIX).length).toBeLessThanOrEqual(MAX_TITLE);
    expect(t.startsWith("Gerunds vs Infinitives: Meaning Changes")).toBe(true);
  });

  it("every real-length topic name fits", () => {
    for (const [en, he] of [
      ["Concession: although, despite, in spite of", "ניגוד: למרות"],
      ["Prepositions of time and place", "מילות יחס של זמן ומקום"],
      ["Present Perfect vs Past Simple", "הווה מושלם מול עבר פשוט"],
    ])
      expect((grammarTopicTitle(en, he) + TITLE_SUFFIX).length).toBeLessThanOrEqual(MAX_TITLE);
  });
});

describe("fittingTitle", () => {
  it("falls back to the last candidate when nothing fits", () => {
    expect(fittingTitle(["x".repeat(100), "y".repeat(90)])).toBe("y".repeat(90));
  });
});
