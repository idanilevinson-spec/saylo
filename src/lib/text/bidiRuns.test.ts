import { describe, expect, it } from "vitest";
import { splitBidiRuns } from "./bidiRuns";

describe("splitBidiRuns", () => {
  it("keeps a quoted English phrase, quotes included, as one run", () => {
    expect(splitBidiRuns("שימוש בהווה פשוט: 'I work three years' במקום 'I have worked'")).toEqual([
      { text: "שימוש בהווה פשוט: ", english: false },
      { text: "'I work three years'", english: true },
      { text: " במקום ", english: false },
      { text: "'I have worked'", english: true },
    ]);
  });

  it("handles single words, double quotes and question marks", () => {
    expect(splitBidiRuns('צריך "am" ולא is?').map((r) => r.text)).toEqual(["צריך ", '"am"', " ולא ", "is?"]);
  });

  it("leaves Hebrew-only and English-only text whole", () => {
    expect(splitBidiRuns("הכול בעברית.")).toEqual([{ text: "הכול בעברית.", english: false }]);
    expect(splitBidiRuns("All English, here.")).toEqual([{ text: "All English, here.", english: true }]);
  });

  it("puts the text back exactly", () => {
    const s = "באנגלית גיל מבטאים עם to be, לא have (למשל 'I am 25').";
    expect(splitBidiRuns(s).map((r) => r.text).join("")).toBe(s);
  });
});
