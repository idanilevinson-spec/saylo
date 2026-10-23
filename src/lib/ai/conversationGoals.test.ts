import { describe, expect, it } from "vitest";
import { buildGoalsNote, cleanObjectives, mergeDone, splitGoalsLine } from "./conversationGoals";

const objectives = [
  { he: "להזמין מנה עיקרית", en: "Order a main dish" },
  { he: "להזמין משהו לשתות", en: "Order a drink" },
  { he: "לבקש את החשבון", en: "Ask for the bill" },
];

describe("buildGoalsNote", () => {
  it("lists the missions, marks the done ones and asks for the machine line", () => {
    const note = buildGoalsNote(objectives, [0]);
    expect(note).toContain("1. Order a main dish (done)");
    expect(note).toContain("2. Order a drink\n");
    expect(note).toMatch(/GOALS: 1,2/);
    expect(note).not.toContain("—");
  });
});

describe("splitGoalsLine", () => {
  it("removes the line and reads the missions done", () => {
    expect(splitGoalsLine("Coming right up!\nGOALS: 1,2", 3)).toEqual({ text: "Coming right up!", goals: [0, 1] });
  });

  it("reads an empty line as none done, and no line as unknown", () => {
    expect(splitGoalsLine("Hi!\nGOALS:", 3).goals).toEqual([]);
    expect(splitGoalsLine("Hi!", 3).goals).toBeNull();
  });

  it("ignores numbers that aren't missions and keeps the correction line for later", () => {
    const raw = 'Sure.\nFIX:{"original":"a","better":"b","why":"c"}\nGOALS: 3, 7, 0, 3';
    const { text, goals } = splitGoalsLine(raw, 3);
    expect(goals).toEqual([2]);
    expect(text).toBe('Sure.\nFIX:{"original":"a","better":"b","why":"c"}');
  });
});

describe("mergeDone", () => {
  it("never un-ticks a mission", () => {
    expect(mergeDone([0, 2], [1])).toEqual([0, 1, 2]);
    expect(mergeDone([0], null)).toEqual([0]);
  });
});

describe("cleanObjectives", () => {
  it("keeps only complete missions", () => {
    expect(cleanObjectives([...objectives, { he: "", en: "x" }, null, "x"])).toEqual(objectives);
    expect(cleanObjectives(null)).toEqual([]);
  });
});
