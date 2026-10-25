import type { ExerciseType } from "@/types/database";
import type { FillBlankContent, McqContent } from "@/types/exercises";

// One run through a practice set (a topic's or a lesson's exercises), per
// tab in sessionStorage. Each exercise is its own page, so without this the
// end of a set knew nothing about the answers before it: no score, no list
// of mistakes, no way to practise them again. Nothing here leaves the
// browser; the attempts themselves are recorded as before.

export interface PracticeEntry {
  id: string;
  index: number;
  ok: boolean;
  prompt: string;
  answer: string;
  // Tied to a vocabulary word, so smart review will bring it back.
  word: boolean;
}

export interface PracticeRun {
  setKey: string;
  total: number;
  entries: Record<string, PracticeEntry>;
  // A second pass over the mistakes, in the order they were made.
  retry: { queue: string[]; results: Record<string, boolean> } | null;
}

const KEY = "saylo:practice-run";
const listeners = new Set<() => void>();

function read(): PracticeRun | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PracticeRun) : null;
  } catch {
    return null;
  }
}

function write(run: PracticeRun | null) {
  try {
    if (run) sessionStorage.setItem(KEY, JSON.stringify(run));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Private mode or blocked storage: the set just ends without a summary.
  }
  listeners.forEach((l) => l());
}

// For useSyncExternalStore: the raw string is a stable snapshot.
export function subscribeRun(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function runSnapshot(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export function parseRun(snapshot: string | null): PracticeRun | null {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as PracticeRun;
  } catch {
    return null;
  }
}

// The first exercise of a set starts a fresh run.
export function beginRun(setKey: string, total: number) {
  write({ setKey, total, entries: {}, retry: null });
}

export function recordEntry(setKey: string, total: number, entry: PracticeEntry) {
  const current = read();
  const run = current && current.setKey === setKey ? current : { setKey, total, entries: {}, retry: null };
  // An answer already given in this run stands; reloading a page can't
  // turn a wrong first answer into a right one.
  if (!run.entries[entry.id]) run.entries[entry.id] = entry;
  write(run);
}

export function recordRetry(setKey: string, id: string, ok: boolean) {
  const run = read();
  if (!run || run.setKey !== setKey || !run.retry) return;
  if (run.retry.results[id] === undefined) run.retry.results[id] = ok;
  write(run);
}

// Starts the pass over this run's mistakes and returns the first one.
export function startRetry(setKey: string): string | null {
  const run = read();
  if (!run || run.setKey !== setKey) return null;
  const queue = missedEntries(run).map((e) => e.id);
  if (queue.length === 0) return null;
  write({ ...run, retry: { queue, results: {} } });
  return queue[0];
}

export function missedEntries(run: PracticeRun): PracticeEntry[] {
  return Object.values(run.entries)
    .filter((e) => !e.ok)
    .sort((a, b) => a.index - b.index);
}

export function summarize(run: PracticeRun) {
  const entries = Object.values(run.entries);
  return { answered: entries.length, correct: entries.filter((e) => e.ok).length, missed: missedEntries(run) };
}

// Per position in the set: how it went, or null if not answered in this run.
export function historyOf(run: PracticeRun | null, total: number): ("correct" | "wrong" | null)[] {
  const byIndex = new Map(Object.values(run?.entries ?? {}).map((e) => [e.index, e.ok]));
  return Array.from({ length: total }, (_, i) => (byIndex.has(i) ? (byIndex.get(i) ? "correct" : "wrong") : null));
}

export function retryNext(run: PracticeRun | null, currentId: string): string | null {
  const queue = run?.retry?.queue ?? [];
  const i = queue.indexOf(currentId);
  return i >= 0 && i < queue.length - 1 ? queue[i + 1] : null;
}

// What the learner saw, short enough for a list.
export function promptLabel(type: ExerciseType, content: Record<string, unknown>): string {
  switch (type) {
    case "mcq":
      return (content as unknown as McqContent).prompt;
    case "fill_blank":
      return (content as unknown as FillBlankContent).sentence.replace("___", "_____");
    case "match":
      return "התאמת זוגות";
    case "reorder":
      return "סידור מילים למשפט";
    case "dictation":
      return "הכתבה";
    default:
      return "";
  }
}
