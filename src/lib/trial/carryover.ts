// The trial lesson (/try) runs with no account, so its mistakes used to
// vanish the moment the visitor signed up. Now the end screen keeps the ids
// of the questions they got wrong on this device, and the first dashboard
// visit with an account puts those into the mistake notebook: vocabulary
// into the word review (srs_items), grammar into the topic queue
// (mistake_review_items), exactly as a wrong answer in the app would.
// No XP, no attempt rows: the trial was not practice inside the account.
// Only exercise ids are stored (public content, nothing about the person).

export const TRIAL_MISTAKES_KEY = "saylo:trial-mistakes";
export const TRIAL_MISTAKES_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_IDS = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Stored {
  v: 1;
  savedAt: number;
  ids: string[];
}

// Pure, so it is unit-tested: anything malformed, stale or empty is null.
export function parseTrialMistakes(raw: string | null, now: number): string[] | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const d = data as Partial<Stored> | null;
  if (!d || d.v !== 1 || typeof d.savedAt !== "number" || !Array.isArray(d.ids)) return null;
  if (now - d.savedAt > TRIAL_MISTAKES_MAX_AGE_MS || d.savedAt > now + 60_000) return null;
  const ids = [...new Set(d.ids.filter((x): x is string => typeof x === "string" && UUID.test(x)))].slice(0, MAX_IDS);
  return ids.length ? ids : null;
}

export function saveTrialMistakes(ids: string[], now: number = Date.now()): void {
  try {
    if (!ids.length) {
      localStorage.removeItem(TRIAL_MISTAKES_KEY);
      return;
    }
    const value: Stored = { v: 1, savedAt: now, ids: ids.slice(0, MAX_IDS) };
    localStorage.setItem(TRIAL_MISTAKES_KEY, JSON.stringify(value));
  } catch {
    // Blocked storage: the trial still works, it just doesn't carry over.
  }
}

export function readTrialMistakes(now: number = Date.now()): string[] | null {
  try {
    return parseTrialMistakes(localStorage.getItem(TRIAL_MISTAKES_KEY), now);
  } catch {
    return null;
  }
}

export function clearTrialMistakes(): void {
  try {
    localStorage.removeItem(TRIAL_MISTAKES_KEY);
  } catch {
    // nothing to do
  }
}

export interface TrialExerciseRow {
  id: string;
  type: string;
  vocabulary_item_id: string | null;
  grammar_topic_id: string | null;
}

export interface CarryoverTargets {
  vocabularyItemIds: string[];
  grammarTopicIds: string[];
}

// Same routing as startAttempt (recordAttempt.ts): vocabulary review only
// for mcq rows tied to a word, the grammar queue for any row on a topic.
export function carryoverTargets(rows: TrialExerciseRow[]): CarryoverTargets {
  const vocab = new Set<string>();
  const grammar = new Set<string>();
  for (const r of rows) {
    if (r.type === "mcq" && r.vocabulary_item_id) vocab.add(r.vocabulary_item_id);
    if (r.grammar_topic_id) grammar.add(r.grammar_topic_id);
  }
  return { vocabularyItemIds: [...vocab], grammarTopicIds: [...grammar] };
}
