import { describe, expect, it } from "vitest";
import { draftKey, isEmptyDraft, parseDraft, summarizeMarks } from "./setDraft";

const shape = { optionCounts: { R0: 4, R2: 3, V0: 4 }, openKeys: ["R1", "V1"], hasWriting: true };
const now = new Date("2026-11-16T12:00:00Z");
const raw = (o: object) => JSON.stringify({ savedAt: "2026-11-15T12:00:00Z", answers: {}, marks: {}, writing: "", ...o });

describe("parseDraft", () => {
  it("restores answers, self-marks and writing that still fit the set", () => {
    expect(parseDraft(raw({ answers: { R0: 2, V0: 0 }, marks: { R1: "partial" }, writing: "I think" }), shape, now)).toEqual({
      answers: { R0: 2, V0: 0 },
      marks: { R1: "partial" },
      writing: "I think",
      savedAt: "2026-11-15T12:00:00.000Z",
    });
  });

  it("drops answers that no longer fit: unknown question, option out of range, bad mark", () => {
    const d = parseDraft(raw({ answers: { R0: 7, R2: 1, R9: 0, V0: -1 }, marks: { R1: "great", V1: "wrong", R0: "right" } }), shape, now);
    expect(d).toMatchObject({ answers: { R2: 1 }, marks: { V1: "wrong" } });
  });

  it("returns null for nothing, junk, an empty draft, or a draft older than 30 days", () => {
    expect(parseDraft(null, shape, now)).toBeNull();
    expect(parseDraft("{not json", shape, now)).toBeNull();
    expect(parseDraft(raw({}), shape, now)).toBeNull();
    expect(parseDraft(raw({ answers: { R0: 1 }, savedAt: "2026-10-01T12:00:00Z" }), shape, now)).toBeNull();
    expect(parseDraft(raw({ answers: { R0: 1 }, savedAt: "yesterday" }), shape, now)).toBeNull();
  });

  it("ignores writing when the set has no writing task", () => {
    expect(parseDraft(raw({ writing: "text" }), { ...shape, hasWriting: false }, now)).toBeNull();
  });
});

describe("helpers", () => {
  it("keys drafts per questionnaire and set", () => {
    expect(draftKey("E", "4")).toBe("saylo:bagrut-set:E:4");
  });

  it("counts self-marks", () => {
    expect(summarizeMarks({ R1: "right", R3: "right", V1: "partial" })).toEqual({ right: 2, partial: 1, wrong: 0 });
  });

  it("treats whitespace-only writing as empty", () => {
    expect(isEmptyDraft({ answers: {}, marks: {}, writing: "   " })).toBe(true);
  });
});
