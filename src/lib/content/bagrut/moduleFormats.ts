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
    sections: [],
    verified: false,
    sourceNotesHe: "לא נמצא מקור מפורט מספיק לחלוקת הנקודות/הזמן. יש לאמת מול שאלון רשמי לפני בניית תוכן.",
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
    sections: [],
    verified: false,
    sourceNotesHe: "לא נמצא מקור מפורט מספיק. יש לאמת מול שאלון רשמי לפני בניית תוכן.",
  },
  D: {
    code: "D",
    studyUnitTracks: [4],
    sections: [],
    verified: false,
    sourceNotesHe: "לא נמצא מקור מפורט מספיק. יש לאמת מול שאלון רשמי לפני בניית תוכן.",
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
    sections: [],
    verified: false,
    sourceNotesHe: "לא נמצא מקור מפורט מספיק. יש לאמת מול שאלון רשמי לפני בניית תוכן.",
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
