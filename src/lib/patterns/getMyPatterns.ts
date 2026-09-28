import type { SupabaseClient } from "@supabase/supabase-js";

// "My Patterns" (docs/specs/hebrew-pattern-coach.md §6): surfaces the
// mistake patterns that actually keep recurring for a learner, not every
// pattern ever seen once. These thresholds are what keep a single unlucky
// paragraph from turning into a headline.
export const MIN_OCCURRENCES = 3;
export const MIN_DISTINCT_SOURCES = 2;
export const MIN_WORDS_FOR_TREND = 100;
export const WINDOW_DAYS = 30;
export const TOP_PATTERNS_SHOWN = 3;

export interface PatternObservationRow {
  pattern_code: string;
  occurrences: number;
  sample_words: number;
  source: string;
  source_id: string;
  created_at: string;
}

export type PatternTrend = "worsening" | "improving" | "flat" | null;

export interface PatternStat {
  code: string;
  occurrences: number;
  distinctSources: number;
  perHundredWords: number;
  trend: PatternTrend;
}

interface WindowTotals {
  totalWords: number;
  byCode: Map<string, { occurrences: number; sources: Set<string> }>;
}

function summarizeWindow(rows: PatternObservationRow[]): WindowTotals {
  const wordsBySource = new Map<string, number>();
  const byCode = new Map<string, { occurrences: number; sources: Set<string> }>();

  for (const row of rows) {
    // sample_words is repeated on every pattern row for the same
    // submission/conversation, so it's only counted once per source here —
    // otherwise a text with three tagged patterns would triple-count its
    // own word count.
    wordsBySource.set(row.source_id, row.sample_words);

    const entry = byCode.get(row.pattern_code) ?? { occurrences: 0, sources: new Set<string>() };
    entry.occurrences += row.occurrences;
    entry.sources.add(row.source_id);
    byCode.set(row.pattern_code, entry);
  }

  const totalWords = [...wordsBySource.values()].reduce((sum, w) => sum + w, 0);
  return { totalWords, byCode };
}

// Pure aggregation over already-fetched rows — kept separate from the fetch
// below so the thresholds and trend math can be unit-tested without a
// database.
export function aggregatePatternStats(rows: PatternObservationRow[], now: Date = new Date()): PatternStat[] {
  const windowMs = WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const currentStart = new Date(now.getTime() - windowMs);
  const previousStart = new Date(now.getTime() - 2 * windowMs);

  const current = rows.filter((r) => new Date(r.created_at) >= currentStart);
  const previous = rows.filter((r) => {
    const t = new Date(r.created_at);
    return t >= previousStart && t < currentStart;
  });

  const currentTotals = summarizeWindow(current);
  const previousTotals = summarizeWindow(previous);

  const stats: PatternStat[] = [];
  for (const [code, { occurrences, sources }] of currentTotals.byCode) {
    if (occurrences < MIN_OCCURRENCES || sources.size < MIN_DISTINCT_SOURCES) continue;

    const perHundredWords = currentTotals.totalWords > 0 ? (occurrences / currentTotals.totalWords) * 100 : 0;

    let trend: PatternTrend = null;
    if (currentTotals.totalWords >= MIN_WORDS_FOR_TREND && previousTotals.totalWords >= MIN_WORDS_FOR_TREND) {
      const previousEntry = previousTotals.byCode.get(code);
      const previousRate = previousEntry ? (previousEntry.occurrences / previousTotals.totalWords) * 100 : 0;
      const delta = perHundredWords - previousRate;
      // A tenth of an occurrence per 100 words either way reads as noise,
      // not a real change.
      trend = Math.abs(delta) < 0.1 ? "flat" : delta > 0 ? "worsening" : "improving";
    }

    stats.push({ code, occurrences, distinctSources: sources.size, perHundredWords, trend });
  }

  return stats.sort((a, b) => b.occurrences - a.occurrences).slice(0, TOP_PATTERNS_SHOWN);
}

export async function fetchMyPatternStats(supabase: SupabaseClient, profileId: string): Promise<PatternStat[]> {
  const since = new Date(Date.now() - 2 * WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("learner_pattern_observations")
    .select("pattern_code, occurrences, sample_words, source, source_id, created_at")
    .eq("profile_id", profileId)
    .gte("created_at", since);

  return aggregatePatternStats((data as PatternObservationRow[] | null) ?? []);
}
