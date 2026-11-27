import type { ActiveUnit } from "@/lib/content/courseSession";

// "Tomorrow" at the end of a practice set: what is really waiting the next
// day, so there is a reason to come back. Only facts the app keeps: a wrong
// word is due again after one day in smart review (sm2: interval 1), every
// mistake sits in the mistake notebook, and a unit stepped out of is still
// there to finish.

export interface TomorrowLine {
  text: string;
  href: string;
}

export function tomorrowLines({
  missedWords,
  missedOther,
  unit,
}: {
  missedWords: number;
  missedOther: number;
  unit: Pick<ActiveUnit, "id" | "number" | "titleHe"> | null;
}): TomorrowLine[] {
  const lines: TomorrowLine[] = [];
  if (missedWords > 0) {
    lines.push({
      text: missedWords === 1 ? "מילה אחת שטעיתם בה חוזרת לחזרה החכמה" : `${missedWords} מילים שטעיתם בהן חוזרות לחזרה החכמה`,
      href: "/review",
    });
  }
  if (missedOther > 0) {
    lines.push({
      text: missedOther === 1 ? "הטעות מהיום מחכה במחברת הטעויות" : `${missedOther} הטעויות מהיום מחכות במחברת הטעויות`,
      href: "/mistakes",
    });
  }
  if (unit) {
    lines.push({ text: `ממשיכים ביחידה ${unit.number}: ${unit.titleHe}`, href: `/course/${unit.id}` });
  }
  return lines;
}
