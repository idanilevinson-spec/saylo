import { COURSE_LEVELS, unitsForLevel } from "@/lib/content/course";
import type { CefrLevel } from "@/types/database";

// "Come back" emails for learners who stepped away before the product had
// a chance: a placement test left half done, a placement finished with no
// learning after it, or a few quiet days. Only for learners who turned
// email reminders on (they are opt-in, see migration 030); an active streak
// gets the streak reminder instead. Pure, so the rules are tested apart
// from the daily job that sends them.

export type ComebackKind = "finish_placement" | "start_course" | "inactive";

export interface ComebackInput {
  now: Date;
  hasActiveStreak: boolean;
  lastComebackAt: Date | null;
  // Last exercise answer or placement answer, whichever is later.
  lastActiveAt: Date | null;
  placementCompletedAt: Date | null;
  placedLevel: CefrLevel | null;
  // The latest unfinished test, if it has answers.
  openPlacement: { answered: number; total: number; startedAt: Date } | null;
  // Any course practice (an exercise answer) after placement.
  practisedSincePlacement: boolean;
}

export interface Comeback {
  kind: ComebackKind;
  subject: string;
  heading: string;
  body: string;
  cta: string;
  href: string;
}

const DAY = 24 * 60 * 60 * 1000;
// Never more often than this, whatever the reason.
export const COMEBACK_MIN_GAP_DAYS = 5;
// Quiet for at least this long before anything is sent.
const QUIET_DAYS = 3;
// After this long away, stop writing.
const GIVE_UP_DAYS = 30;
// Same window as the placement page's resume offer.
const RESUME_WINDOW_DAYS = 7;

const daysSince = (now: Date, then: Date | null) => (then ? (now.getTime() - then.getTime()) / DAY : Infinity);

export function pickComeback(input: ComebackInput): Comeback | null {
  const { now } = input;
  if (input.hasActiveStreak) return null;
  if (daysSince(now, input.lastComebackAt) < COMEBACK_MIN_GAP_DAYS) return null;
  const quiet = daysSince(now, input.lastActiveAt);
  // Someone active in the last day isn't away. Someone long gone is left alone.
  if (quiet < 1 || (input.lastActiveAt && quiet > GIVE_UP_DAYS)) return null;

  if (!input.placementCompletedAt) {
    const open = input.openPlacement;
    if (!open || open.answered === 0 || daysSince(now, open.startedAt) > RESUME_WINDOW_DAYS) return null;
    return {
      kind: "finish_placement",
      subject: "מבחן הרמה שלכם מחכה באמצע",
      heading: `עניתם על ${open.answered} מתוך ${open.total} שאלות`,
      body: "התשובות שמורות. ממשיכים בדיוק מהמקום שבו עצרתם, ובסוף מקבלים את הרמה בכל מיומנות ואת היחידה הראשונה במסלול.",
      cta: "להמשיך את המבחן",
      href: "https://saylolearn.com/placement",
    };
  }

  if (!input.practisedSincePlacement) {
    if (daysSince(now, input.placementCompletedAt) < 1) return null;
    const level = input.placedLevel && COURSE_LEVELS.includes(input.placedLevel) ? input.placedLevel : null;
    const first = level ? unitsForLevel(level)[0] : null;
    return {
      kind: "start_course",
      subject: "היחידה הראשונה שלכם מוכנה",
      heading: first ? `יחידה 1: ${first.titleHe}` : "המסלול שלכם מוכן",
      body: first
        ? `בנינו לכם מסלול לפי מבחן הרמה. ביחידה הראשונה תלמדו ${first.goalHe}. זה לוקח בערך רבע שעה.`
        : "בנינו לכם מסלול לפי מבחן הרמה. היחידה הראשונה לוקחת בערך רבע שעה.",
      cta: "להתחיל את היחידה",
      href: first ? `https://saylolearn.com/course/${first.id}` : "https://saylolearn.com/course",
    };
  }

  if (quiet < QUIET_DAYS) return null;
  return {
    kind: "inactive",
    subject: "היחידה הבאה שלכם במסלול מחכה",
    heading: "ממשיכים מאיפה שעצרתם",
    body: "ההתקדמות שלכם שמורה. כמה דקות היום מספיקות כדי להתקדם עוד שלב ביחידה.",
    cta: "להמשיך במסלול",
    href: "https://saylolearn.com/dashboard",
  };
}
