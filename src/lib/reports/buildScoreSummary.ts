import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetchAll";

export type ScoreRange = "week" | "month" | "all";

export interface ScoreSummaryItem {
  id: string;
  createdAt: string;
  typeLabel: string;
  detail: string;
  scorePct: number | null;
}

export interface ScoreSummary {
  range: ScoreRange;
  since: string | null;
  testsCount: number;
  averageScore: number | null;
  xpEarned: number;
  items: ScoreSummaryItem[];
}

const GAME_TYPE_LABELS: Record<string, string> = {
  speed_round: "סיבוב מהירות",
  spelling: "אתגר איות",
  daily_challenge: "אתגר יומי",
  definition: "זיהוי לפי הגדרה",
  match: "משחק התאמה",
  word_catch: "תפסו את המילה",
  memory: "זיכרון",
  learn: "למידה",
  test: "מבחן תרגול",
  idioms: "ניבים וביטויים",
  speaking_test: "מבחן דיבור",
};

const IL_TZ = "Asia/Jerusalem";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "This week"/"this month" means Israel-local calendar boundaries to the
// user, regardless of which timezone the code happens to run in (a
// Vercel cron function runs in UTC, the browser runs in the viewer's own
// zone) — so this can't rely on the runtime's own Date/getHours(), it has
// to compute the actual Israel offset for the instant in question.
function israelOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IL_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return (asIfUtc - instant.getTime()) / 60000;
}

function israelMidnightUtc(year: number, month: number, day: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offset = israelOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}

function israelDateParts(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), weekday: get("weekday") };
}

export function israelWeekStart(now: Date = new Date()): Date {
  const { year, month, day, weekday } = israelDateParts(now);
  const dowIndex = WEEKDAYS.indexOf(weekday);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - dowIndex);
  return israelMidnightUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function israelMonthStart(now: Date = new Date()): Date {
  const { year, month } = israelDateParts(now);
  return israelMidnightUtc(year, month, 1);
}

// The monthly report cron has no clean cron-syntax way to fire only on
// "the last day of the month" (lengths vary, leap years move Feb) — so
// instead it runs daily and asks this on each run, sending only when
// today's Israel-local calendar date rolls into a new month tomorrow.
export function isLastDayOfIsraelMonth(now: Date = new Date()): boolean {
  const today = israelDateParts(now);
  const tomorrow = israelDateParts(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  return tomorrow.month !== today.month;
}

// Exercises (practice, review, the reading exam's questions) are answered
// one at a time, so listing each attempt would bury everything else. They
// are folded into one row per Israel-local day: how many, and how many
// right. Before this the summary skipped them entirely, and a learner who
// only practised saw "0 activities" for the week.
export function practiceDayItems(attempts: { is_correct: boolean; created_at: string }[]): ScoreSummaryItem[] {
  const byDay = new Map<string, { total: number; correct: number; latest: string }>();
  for (const a of attempts) {
    const { year, month, day } = israelDateParts(new Date(a.created_at));
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = byDay.get(key) ?? { total: 0, correct: 0, latest: a.created_at };
    entry.total += 1;
    if (a.is_correct) entry.correct += 1;
    if (a.created_at > entry.latest) entry.latest = a.created_at;
    byDay.set(key, entry);
  }
  return [...byDay.entries()].map(([key, d]) => ({
    id: `practice-${key}`,
    createdAt: d.latest,
    typeLabel: "תרגול",
    detail: `${d.correct}/${d.total} נכונות`,
    scorePct: Math.round((d.correct / d.total) * 100),
  }));
}

function rangeStart(range: ScoreRange, now: Date = new Date()): Date | null {
  if (range === "week") return israelWeekStart(now);
  if (range === "month") return israelMonthStart(now);
  return null;
}

// Shared by the progress page and the weekly/monthly report emails, so the
// dashboard and the numbers mailed to a learner can never drift apart —
// pulls every scored activity (vocabulary games incl. the speaking test,
// AI-graded reading responses, AI-scored conversations) into one flat,
// sorted list plus the aggregate stats a report needs.
export async function buildScoreSummary(
  supabase: SupabaseClient,
  profileId: string,
  range: ScoreRange
): Promise<ScoreSummary> {
  const since = rangeStart(range);
  const sinceIso = since?.toISOString() ?? null;

  let gameQuery = supabase
    .from("vocabulary_game_sessions")
    .select("id, game_type, total_questions, correct_count, xp_awarded, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (sinceIso) gameQuery = gameQuery.gte("created_at", sinceIso);

  let readingQuery = supabase
    .from("reading_responses")
    .select("id, score, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (sinceIso) readingQuery = readingQuery.gte("created_at", sinceIso);

  let conversationQuery = supabase
    .from("conversations")
    .select("id, created_at, conversation_scores(overall_score)")
    .eq("profile_id", profileId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });
  if (sinceIso) conversationQuery = conversationQuery.gte("created_at", sinceIso);

  // XP from every source (exercises, games, streak bonuses), not only the
  // games' own share, so it matches the XP chart on the progress page.
  const xpEvents = fetchAll<{ amount: number }>((from, to) => {
    let q = supabase.from("xp_events").select("amount").eq("profile_id", profileId).order("id").range(from, to);
    if (sinceIso) q = q.gte("created_at", sinceIso);
    return q;
  });
  const attempts = fetchAll<{ is_correct: boolean; created_at: string }>((from, to) => {
    let q = supabase
      .from("exercise_attempts")
      .select("is_correct, created_at")
      .eq("profile_id", profileId)
      .order("id")
      .range(from, to);
    if (sinceIso) q = q.gte("created_at", sinceIso);
    return q;
  });

  const [gamesRes, readingRes, conversationsRes, xpRes, attemptsRes] = await Promise.all([
    gameQuery,
    readingQuery,
    conversationQuery,
    xpEvents,
    attempts,
  ]);

  const items: ScoreSummaryItem[] = practiceDayItems(attemptsRes.data);
  const xpEarned = xpRes.data.reduce((sum, e) => sum + e.amount, 0);

  for (const g of gamesRes.data ?? []) {
    const scorePct = g.total_questions > 0 ? Math.round((g.correct_count / g.total_questions) * 100) : null;
    items.push({
      id: g.id,
      createdAt: g.created_at,
      typeLabel: GAME_TYPE_LABELS[g.game_type] ?? g.game_type,
      detail: `${g.correct_count}/${g.total_questions} נכונות`,
      scorePct,
    });
  }

  for (const r of readingRes.data ?? []) {
    items.push({
      id: r.id,
      createdAt: r.created_at,
      typeLabel: "הבנת הנקרא",
      detail: `${r.score}/100`,
      scorePct: r.score,
    });
  }

  for (const c of conversationsRes.data ?? []) {
    const score = (c.conversation_scores as unknown as { overall_score: number }[] | null)?.[0]?.overall_score;
    if (typeof score !== "number") continue;
    items.push({
      id: c.id,
      createdAt: c.created_at,
      typeLabel: "שיחה עם AI",
      detail: `${score}/100`,
      scorePct: score,
    });
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const scored = items.filter((i): i is ScoreSummaryItem & { scorePct: number } => i.scorePct !== null);
  const averageScore =
    scored.length > 0 ? Math.round(scored.reduce((sum, i) => sum + i.scorePct, 0) / scored.length) : null;

  return {
    range,
    since: sinceIso,
    testsCount: items.length,
    averageScore,
    xpEarned,
    items,
  };
}
