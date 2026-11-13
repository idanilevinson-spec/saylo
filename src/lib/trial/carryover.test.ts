import { describe, expect, it } from "vitest";
import { carryoverTargets, parseTrialMistakes, TRIAL_MISTAKES_MAX_AGE_MS } from "./carryover";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const NOW = 1_800_000_000_000;

const raw = (o: unknown) => JSON.stringify(o);

describe("parseTrialMistakes", () => {
  it("reads fresh ids, deduplicated", () => {
    expect(parseTrialMistakes(raw({ v: 1, savedAt: NOW - 1000, ids: [A, B, A] }), NOW)).toEqual([A, B]);
  });

  it("drops anything that is not an exercise id", () => {
    expect(parseTrialMistakes(raw({ v: 1, savedAt: NOW, ids: [A, "x", 3, null, "<script>"] }), NOW)).toEqual([A]);
  });

  it("is null when stale, from the future, empty, malformed or missing", () => {
    expect(parseTrialMistakes(raw({ v: 1, savedAt: NOW - TRIAL_MISTAKES_MAX_AGE_MS - 1, ids: [A] }), NOW)).toBeNull();
    expect(parseTrialMistakes(raw({ v: 1, savedAt: NOW + 10 * 60_000, ids: [A] }), NOW)).toBeNull();
    expect(parseTrialMistakes(raw({ v: 1, savedAt: NOW, ids: [] }), NOW)).toBeNull();
    expect(parseTrialMistakes(raw({ v: 2, savedAt: NOW, ids: [A] }), NOW)).toBeNull();
    expect(parseTrialMistakes("{not json", NOW)).toBeNull();
    expect(parseTrialMistakes("null", NOW)).toBeNull();
    expect(parseTrialMistakes(null, NOW)).toBeNull();
  });
});

describe("carryoverTargets", () => {
  it("routes words to the word review and topics to the grammar queue, like a wrong answer in the app", () => {
    expect(
      carryoverTargets([
        { id: "1", type: "mcq", vocabulary_item_id: "w1", grammar_topic_id: null },
        { id: "2", type: "fill_blank", vocabulary_item_id: "w2", grammar_topic_id: "g1" },
        { id: "3", type: "mcq", vocabulary_item_id: null, grammar_topic_id: "g1" },
        { id: "4", type: "mcq", vocabulary_item_id: null, grammar_topic_id: null },
      ]),
    ).toEqual({ vocabularyItemIds: ["w1"], grammarTopicIds: ["g1"] });
  });
});
