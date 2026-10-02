// The real structural shape of the English Bagrut (Israeli matriculation)
// exam — see docs/specs/bagrut-track.md §2 for the full source list and the
// distinction this spec insists on: a module's STRUCTURE (sections, point
// values, word counts, timing) is a public structural fact, verified here
// against the Ministry of Education's own exam archive plus corroborating
// third-party exam-prep guides. It is NOT the same thing as verified
// CONTENT — nothing in this file or sampleUnits.ts has been checked by a
// qualified English teacher, and nothing here is shown to a learner (see
// sampleUnits.ts's `reviewed` gate, same pattern as drills.ts in the
// Hebrew Pattern Coach).

export type BagrutModuleCode = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type BagrutStudyUnits = 3 | 4 | 5;

export interface BagrutModuleSection {
  nameHe: string;
  points: number;
  // Word count range for the passage (reading) or the required response
  // (writing) this section is built around, when the structure specifies one.
  wordCountRange?: [number, number];
  questionCount?: number;
  questionFormatsHe?: string[];
  notesHe?: string;
}

export interface BagrutModuleFormat {
  code: BagrutModuleCode;
  // Which study-unit tracks include this module. 3 יח"ל = A+B+C,
  // 4 יח"ל = C+D+E, 5 יח"ל = E+F+G.
  studyUnitTracks: BagrutStudyUnits[];
  percentOfFinalGrade?: number;
  timeMinutes?: number;
  sections: BagrutModuleSection[];
  // false = structure not yet confirmed against a solid enough source; do
  // not build sample content for this module until it is.
  verified: boolean;
  sourceNotesHe: string;
}

export const BAGRUT_MODULE_FORMATS: Record<BagrutModuleCode, BagrutModuleFormat> = {
  A: {
    code: "A",
    studyUnitTracks: [3],
    timeMinutes: 75,
    sections: [
      {
        nameHe: "הבנת הנשמע",
        points: 30,
        notesHe: "קטע שמע קצר (כ-3 דקות) — שיחה, ראיון, תיאור או דוח.",
      },
      {
        nameHe: "הבנת הנקרא",
        points: 70,
        wordCountRange: [300, 350],
        notesHe: "שני קטעי קריאה נפרדים, כל אחד כ-300–350 מילים.",
      },
    ],
    verified: true,
    sourceNotesHe:
      "kidum.com (מדריך 3 יח\"ל) + high-q.co.il (סקירת שאלונים) — שני מקורות עצמאיים מסכימים על 30/70 ו-75 דק'. ראו docs/specs/bagrut-track.md §2.1.",
  },
  B: {
    code: "B",
    studyUnitTracks: [3],
    percentOfFinalGrade: 26,
    sections: [
      { nameHe: "הבנת הנקרא", points: 70, wordCountRange: [220, 260] },
      { nameHe: "כתיבה", points: 30, wordCountRange: [35, 40] },
    ],
    verified: true,
    sourceNotesHe: "kidum.com, מדריך מודול B (3 יח\"ל) — ראו docs/specs/bagrut-track.md §2.1.",
  },
  C: {
    code: "C",
    studyUnitTracks: [3, 4],
    timeMinutes: 90,
    sections: [
      // No wordCountRange here — confirmed only the point split and
      // section order, not a specific passage length (see sourceNotesHe).
      { nameHe: "הבנת הנקרא", points: 70 },
      { nameHe: "כתיבה", points: 30, wordCountRange: [70, 90] },
    ],
    verified: true,
    sourceNotesHe:
      "הוכרע סופית ב-2.10.2026 מול השאלון הרשמי הנוכחי בפועל (מועד חורף תשפ\"ו 2026, מספר שאלון 16382, ארכיון משרד החינוך) — לא מול מדריך צד שלישי. נקראו ונוצלו אך ורק עמודי ההוראות המנהליות של השאלון (משך הבחינה, חלוקת הנקודות בין שני הפרקים, הנחיית אורך המילים לחיבור) — בדיוק אותו סוג מידע שכבר צוטט מעמוד ההוראות של כל מודול אחר. התוכן עצמו (קטע הקריאה, השאלות) לא נקרא בכוונה, לא שימש ולא ישמש שום דבר באתר הזה. זה מיישב סופית את הסתירה שתועדה קודם: הגרסה הנוכחית כן כוללת כתיבה (70/30, חיבור 70–90 מילים) — הגרסאות שתיארו קריאה בלבד (kidum.com, limudnaim.co.il) מתארות ככל הנראה פורמט ישן יותר.",
  },
  D: {
    code: "D",
    studyUnitTracks: [4],
    timeMinutes: 75,
    sections: [
      {
        nameHe: "הבנת הנקרא",
        points: 70,
        notesHe: "קטעי ספרות (סיפור קצר ושיר, מתוך רשימה שמתעדכנת מדי מחזור) שנלמדים מראש — לא טקסט לא מוכר.",
      },
      { nameHe: "כתיבה", points: 30, wordCountRange: [100, 120] },
    ],
    verified: true,
    sourceNotesHe:
      "kidum.com + limudnaim.co.il — שני מדריכי הכנה עצמאיים מסכימים על 70/30, 100–120 מילים ו-75 דק'. מקור שלישי (matic.co.il) תיאר את המודול כציון פנימי של בית הספר בלבד; זה לא תואם את ארכיון הבחינות הרשמי של משרד החינוך (pop.education.gov.il), שמראה שמדובר בבחינה חיצונית מלאה עם קוד שאלון (16483/16484) — לכן המקור הזה נפסל. ראו docs/specs/bagrut-track.md §2.1.",
  },
  E: {
    code: "E",
    studyUnitTracks: [4, 5],
    timeMinutes: 75,
    sections: [
      {
        nameHe: "הבנת הנקרא",
        points: 70,
        wordCountRange: [1, 400],
        questionCount: 9,
        questionFormatsHe: ["רב-ברירה", "שאלות פתוחות", "השלמת משפטים", "מארגן גרפי"],
        notesHe: "טקסט אחד בלבד, עד 400 מילים, 8–10 שאלות.",
      },
      {
        nameHe: "אוצר מילים",
        points: 30,
        questionCount: 5,
        questionFormatsHe: ["השלמת משפטים", "רב-ברירה", "התאמה"],
        notesHe: "מתוך רשימות המילים הרשמיות (Core). אין במודול הזה כתיבה או האזנה — טעות נפוצה לחשוב שיש.",
      },
    ],
    verified: true,
    sourceNotesHe: "safotsheli.co.il, מדריך מודול E — ראו docs/specs/bagrut-track.md §2.1.",
  },
  F: {
    code: "F",
    studyUnitTracks: [5],
    timeMinutes: 90,
    sections: [
      { nameHe: "הבנת הנקרא", points: 60, wordCountRange: [400, 450] },
      { nameHe: "חיבור", points: 40, wordCountRange: [120, 140], notesHe: "מאז 2020 אין ספרות במודול זה, רק חיבורים." },
    ],
    verified: true,
    sourceNotesHe: "jpostlite.co.il, מדריך מודולים E/F/G — ראו docs/specs/bagrut-track.md §2.1.",
  },
  G: {
    code: "G",
    studyUnitTracks: [5],
    timeMinutes: 105,
    sections: [
      { nameHe: "הבנת הנקרא", points: 60, notesHe: "קטע ברמת קושי גבוהה יותר ואוצר מילים מתקדם יותר ממודולים קודמים." },
      {
        nameHe: "חיבור",
        points: 40,
        wordCountRange: [120, 140],
        notesHe: "סוגי חיבור אפשריים: תיאורי, דעה, ולעיתים נדירות מכתב רשמי.",
      },
    ],
    verified: true,
    sourceNotesHe:
      "jpostlite.co.il (מדריך ייעודי למודול G) + high-q.co.il (סקירה כללית) — שני מקורות עצמאיים מסכימים על חלוקת 60/40 ועל 105 דק'. ראו docs/specs/bagrut-track.md §2.1.",
  },
};

export function getModuleFormat(code: BagrutModuleCode): BagrutModuleFormat {
  return BAGRUT_MODULE_FORMATS[code];
}

export function modulesForUnits(units: BagrutStudyUnits): BagrutModuleCode[] {
  return (Object.values(BAGRUT_MODULE_FORMATS) as BagrutModuleFormat[])
    .filter((m) => m.studyUnitTracks.includes(units))
    .map((m) => m.code);
}
