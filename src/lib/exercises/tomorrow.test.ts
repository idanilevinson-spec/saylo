import { describe, expect, it } from "vitest";
import { sm2, SM2_INITIAL_STATE } from "@/lib/srs/sm2";
import { tomorrowLines } from "./tomorrow";

describe("tomorrowLines", () => {
  it("says nothing when nothing is waiting", () => {
    expect(tomorrowLines({ missedWords: 0, missedOther: 0, unit: null })).toEqual([]);
  });

  it("lists words, other mistakes and the unit, in that order", () => {
    const lines = tomorrowLines({ missedWords: 3, missedOther: 1, unit: { id: "a1-4", number: 4, titleHe: "בבית קפה" } });
    expect(lines.map((l) => l.href)).toEqual(["/review", "/mistakes", "/course/a1-4"]);
    expect(lines[0].text).toBe("3 מילים שטעיתם בהן חוזרות לחזרה החכמה");
    expect(lines[1].text).toBe("הטעות מהיום מחכה במחברת הטעויות");
    expect(lines[2].text).toBe("ממשיכים ביחידה 4: בבית קפה");
  });

  it("only promises what smart review does: a wrong word is due after one day", () => {
    expect(sm2(SM2_INITIAL_STATE, false).intervalDays).toBe(1);
  });
});
