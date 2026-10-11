import { describe, expect, it } from "vitest";
import { lessonLineDir } from "./GrammarLessonContent";

// Real lines from published grammar lessons.
describe("lessonLineDir", () => {
  it("runs an English term with its Hebrew explanation right to left", () => {
    for (const line of [
      'I am: עם "אני" (לרוב מתקצר ל-I\'m)',
      "must: חובה חזקה / הכרח:",
      "have to + בסיס = חייבים, בדרך כלל בגלל חוק, כלל או נסיבות.",
      "my brother's room = החדר של אח שלי",
      "stop → stopped (תנועה קצרה + עיצור אחד: מכפילים את העיצור)",
      "maybe היא מילה, לא פועל, והיא באה בתחילת המשפט: Maybe she's busy. = She might be busy.",
    ]) {
      expect(lessonLineDir(line).dir, line).toBe("rtl");
    }
  });

  it("keeps an English sentence followed by a Hebrew gloss left to right", () => {
    for (const line of [
      "I wish I had studied harder. (לא למדתי מספיק)",
      "You mustn't smoke here. = אסור.",
      "Who is that woman? (מי)",
      "I've read three chapters. (כמות, ולכן הווה מושלם רגיל)",
    ]) {
      expect(lessonLineDir(line).dir, line).toBe("ltr");
    }
  });

  it("runs pure English left to right and leaves symbol-only lines alone", () => {
    expect(lessonLineDir("She is happy.")).toEqual({ dir: "ltr", endMark: false });
    expect(lessonLineDir("→ 3")).toEqual({ dir: undefined, endMark: false });
  });

  it("marks a right-to-left line that ends inside English punctuation", () => {
    expect(lessonLineDir("any: בשאלות ובשלילה: Do you have any milk? I don't have any money.")).toEqual({
      dir: "rtl",
      endMark: true,
    });
    expect(lessonLineDir("must: חובה חזקה / הכרח:").endMark).toBe(false);
    expect(lessonLineDir("there is + יחיד או בלתי ספיר: There is a cat in the garden").endMark).toBe(false);
  });
});
