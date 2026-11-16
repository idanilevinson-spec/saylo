import type { BagrutExamKind, BagrutUnitProgress } from "@/types/database";
import { modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { SETS_PER_SIMULATION } from "./oralAllowance";

// The countdown and this week's plan on /bagrut, from the exam date the
// learner typed in (profiles.bagrut_exam_date) and only what the app
// already measures: practice-set scores and times (bagrut_unit_progress),
// oral grading rows (ai_usage_log) and teacher conversations. Saylo never
// states official exam dates. Weeks start on Sunday, Israel time.

export const SETS_PER_WEEK = 2;
// A set below this best score is worth doing again before the exam.
export const STRONG_PERCENT = 80;
export const MAX_DAYS_AHEAD = 400;

const ZONE = "Asia/Jerusalem";
const DAY_MS = 86_400_000;

// The calendar date in Israel, as YYYY-MM-DD.
export function israelDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return dayNumber(toIso) - dayNumber(fromIso);
}

function isRealDate(iso: string): boolean {
  if (!ISO_DATE.test(iso)) return false;
  const d = new Date(dayNumber(iso) * DAY_MS);
  return d.toISOString().slice(0, 10) === iso;
}

// The Sunday that starts the week of this date.
export function weekStart(iso: string): string {
  const n = dayNumber(iso);
  const weekday = new Date(n * DAY_MS).getUTCDay();
  return new Date((n - weekday) * DAY_MS).toISOString().slice(0, 10);
}

export function examKindsFor(track: BagrutStudyUnits | null): BagrutExamKind[] {
  if (!track) return ["A", "B", "C", "D", "E", "F", "G", "oral"];
  // The computerised oral exam is part of the 4- and 5-point Bagrut only.
  return [...modulesForUnits(track), ...(track >= 4 ? (["oral"] as const) : [])];
}

// A Latin letter next to digits in Hebrew text swaps places with them
// ("שאלון E: 20%" shows the score before the letter); isolating it fixes it.
const isolate = (s: string) => `⁨${s}⁩`;

export function examKindLabel(kind: BagrutExamKind): string {
  return kind === "oral" ? "הבחינה בעל פה" : `שאלון ${isolate(kind)}`;
}

// After a prefix letter (ל/ב), Hebrew drops the definite ה: "לבחינה בעל פה".
export function examKindAfter(prefix: "ל" | "ב", kind: BagrutExamKind): string {
  return kind === "oral" ? `${prefix}בחינה בעל פה` : `${prefix}שאלון ${isolate(kind)}`;
}

export type ExamDateCheck = "ok" | "invalid" | "past" | "too-far";

export function checkExamDate(dateIso: string, todayIso: string): ExamDateCheck {
  if (!isRealDate(dateIso)) return "invalid";
  const days = daysBetween(todayIso, dateIso);
  if (days < 0) return "past";
  if (days > MAX_DAYS_AHEAD) return "too-far";
  return "ok";
}

export interface PlanTask {
  key: string;
  labelHe: string;
  href: string;
  done: boolean;
}

export type ExamPlan =
  | { status: "past"; daysAgo: number }
  | { status: "today" }
  | { status: "upcoming"; daysLeft: number; weeksLeft: number; finalWeek: boolean; tasks: PlanTask[] };

export interface ExamPlanInput {
  todayIso: string;
  examDate: string;
  kind: BagrutExamKind;
  // The publishable practice sets of this questionnaire, in order.
  sets: { unitSlug: string }[];
  progress: BagrutUnitProgress[];
  // Since this week's Sunday (Israel time).
  oralGradesThisWeek: number;
  conversationsThisWeek: number;
}

function writtenTasks(input: ExamPlanInput, finalWeek: boolean): PlanTask[] {
  const { kind, sets, progress, todayIso } = input;
  const start = weekStart(todayIso);
  const rows = new Map(progress.filter((p) => p.module_code === kind).map((p) => [p.unit_slug, p]));
  const doneThisWeek = (slug: string) => {
    const row = rows.get(slug);
    return !!row && israelDate(new Date(row.completed_at)) >= start;
  };
  const timed = finalWeek ? ", עם השעון של הבחינה" : "";

  // What to do next: sets never done, then weak ones (lowest first), then
  // strong ones least recently done, to practise the timing.
  const fresh = sets.filter((s) => !rows.has(s.unitSlug));
  const weak = sets
    .filter((s) => rows.has(s.unitSlug) && rows.get(s.unitSlug)!.best_percent < STRONG_PERCENT)
    .sort((a, b) => rows.get(a.unitSlug)!.best_percent - rows.get(b.unitSlug)!.best_percent);
  const strong = sets
    .filter((s) => rows.has(s.unitSlug) && rows.get(s.unitSlug)!.best_percent >= STRONG_PERCENT)
    .sort((a, b) => rows.get(a.unitSlug)!.completed_at.localeCompare(rows.get(b.unitSlug)!.completed_at));

  const tasks: PlanTask[] = [];
  const href = (slug: string) => `/bagrut/${kind}/${slug}`;
  for (const s of sets) {
    if (tasks.length >= SETS_PER_WEEK) break;
    if (!doneThisWeek(s.unitSlug)) continue;
    const best = rows.get(s.unitSlug)!.best_percent;
    tasks.push({ key: s.unitSlug, labelHe: `ערכה ${s.unitSlug} בשאלון ${isolate(kind)}: ${best}%`, href: href(s.unitSlug), done: true });
  }
  for (const s of [...fresh, ...weak, ...strong]) {
    if (tasks.length >= SETS_PER_WEEK) break;
    if (doneThisWeek(s.unitSlug)) continue;
    const row = rows.get(s.unitSlug);
    const labelHe = !row
      ? `ערכה ${s.unitSlug} בשאלון ${isolate(kind)}${timed}`
      : row.best_percent < STRONG_PERCENT
        ? `לחזור על ערכה ${s.unitSlug} בשאלון ${isolate(kind)} (${row.best_percent}%)${timed}`
        : `ערכה ${s.unitSlug} בשאלון ${isolate(kind)} שוב, עם השעון של הבחינה`;
    tasks.push({ key: s.unitSlug, labelHe, href: href(s.unitSlug), done: false });
  }
  return tasks;
}

function oralTasks(input: ExamPlanInput): PlanTask[] {
  return [
    {
      key: "oral-simulation",
      labelHe: "סימולציה מלאה של הבחינה בעל פה",
      href: "/bagrut/oral",
      done: input.oralGradesThisWeek >= SETS_PER_SIMULATION,
    },
    {
      key: "teacher-conversation",
      labelHe: "שיחה אחת באנגלית עם המורה",
      href: "/speaking",
      done: input.conversationsThisWeek >= 1,
    },
  ];
}

export function buildExamPlan(input: ExamPlanInput): ExamPlan {
  const daysLeft = daysBetween(input.todayIso, input.examDate);
  if (daysLeft < 0) return { status: "past", daysAgo: -daysLeft };
  if (daysLeft === 0) return { status: "today" };
  // Weeks that still have a practice day before the exam (an exam on a
  // Sunday leaves no practice day in its own week).
  const weeksLeft = Math.floor((daysBetween(weekStart(input.todayIso), input.examDate) - 1) / 7) + 1;
  const finalWeek = weeksLeft === 1;
  const tasks = input.kind === "oral" ? oralTasks(input) : writtenTasks(input, finalWeek);
  return { status: "upcoming", daysLeft, weeksLeft, finalWeek, tasks };
}

export function daysLeftHe(days: number): string {
  return days === 1 ? "עוד יום אחד" : `עוד ${days} ימים`;
}
