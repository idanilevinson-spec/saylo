import { describe, expect, it } from "vitest";
import { PART_A_TOPICS, PART_B_SETS, PART_C_PASSAGES } from "./bagrutOral";
import { wordCount } from "@/lib/speech/longAnswer";

const allSets = [
  ...PART_A_TOPICS,
  ...PART_B_SETS,
  ...PART_C_PASSAGES.flatMap((p) => p.sets),
];
const HEBREW = /[֐-׿]/;

describe("oral Bagrut question bank", () => {
  it("has enough of each part for varied simulations", () => {
    expect(PART_A_TOPICS.length).toBeGreaterThanOrEqual(12);
    expect(PART_B_SETS.length).toBeGreaterThanOrEqual(6);
    expect(PART_C_PASSAGES.length).toBeGreaterThanOrEqual(5);
  });

  it("every set has exactly two questions, in English, ending with a question or a task", () => {
    for (const s of allSets) {
      expect(s.questions, s.id).toHaveLength(2);
      for (const q of s.questions) {
        expect(HEBREW.test(q), `${s.id}: ${q}`).toBe(false);
        expect(/[?.]$/.test(q.trim()), `${s.id}: ${q}`).toBe(true);
      }
    }
  });

  it("ids are unique", () => {
    const ids = [...allSets.map((s) => s.id), ...PART_C_PASSAGES.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Part C passages are about a minute of speech, in English, with Hebrew titles", () => {
    for (const p of PART_C_PASSAGES) {
      const words = wordCount(p.script);
      expect(words, p.id).toBeGreaterThanOrEqual(110);
      expect(words, p.id).toBeLessThanOrEqual(170);
      expect(HEBREW.test(p.script), p.id).toBe(false);
      expect(HEBREW.test(p.titleHe), p.id).toBe(true);
    }
  });

  it("Part A topics have Hebrew labels", () => {
    for (const t of PART_A_TOPICS) expect(HEBREW.test(t.topicHe), t.id).toBe(true);
  });
});
