// A practice set in progress, kept in this browser's localStorage so a
// learner who leaves in the middle (a break, a dead battery, a tap on the
// wrong link) comes back to their answers instead of an empty set. Only in
// this browser, never the server: the saved score is still written once,
// when the set is finished (BagrutPracticeUnit), and the draft is then
// cleared so the next attempt starts fresh.

// How a learner rated their own answer to an open question, after reading
// the model answer. Shown back to them only; it never enters the saved
// score, which stays the multiple-choice result.
export type SelfMark = "right" | "partial" | "wrong";

export interface SetDraft {
  // Chosen option per multiple-choice question ("R0", "V2", "L1").
  answers: Record<string, number>;
  // Self-rating per open question.
  marks: Record<string, SelfMark>;
  writing: string;
  savedAt: string;
}

// A draft older than this is dropped: by then it's a different study
// session, not a set left in the middle.
export const DRAFT_MAX_AGE_DAYS = 30;

export const draftKey = (moduleCode: string, unitSlug: string) => `saylo:bagrut-set:${moduleCode}:${unitSlug}`;

const MARKS: SelfMark[] = ["right", "partial", "wrong"];

export function isEmptyDraft(d: Pick<SetDraft, "answers" | "marks" | "writing">): boolean {
  return Object.keys(d.answers).length === 0 && Object.keys(d.marks).length === 0 && d.writing.trim() === "";
}

// Reads a stored draft against the set as it is now: answers to questions
// that no longer exist or options out of range are dropped, so a set whose
// content was edited never shows a stale or impossible answer.
export function parseDraft(
  raw: string | null,
  shape: { optionCounts: Record<string, number>; openKeys: string[]; hasWriting: boolean },
  now: Date = new Date(),
): SetDraft | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<SetDraft>;
  const savedAt = typeof d.savedAt === "string" ? new Date(d.savedAt) : null;
  if (!savedAt || Number.isNaN(savedAt.getTime())) return null;
  if (now.getTime() - savedAt.getTime() > DRAFT_MAX_AGE_DAYS * 86_400_000) return null;

  const answers: Record<string, number> = {};
  for (const [key, value] of Object.entries(d.answers ?? {})) {
    const count = shape.optionCounts[key];
    if (count && Number.isInteger(value) && value >= 0 && value < count) answers[key] = value;
  }
  const marks: Record<string, SelfMark> = {};
  for (const [key, value] of Object.entries(d.marks ?? {})) {
    if (shape.openKeys.includes(key) && MARKS.includes(value as SelfMark)) marks[key] = value as SelfMark;
  }
  const writing = shape.hasWriting && typeof d.writing === "string" ? d.writing.slice(0, 5000) : "";
  const draft = { answers, marks, writing, savedAt: savedAt.toISOString() };
  return isEmptyDraft(draft) ? null : draft;
}

// Storage can be missing or throw (private mode, blocked site data); a set
// then simply works as before, without saving.
export function loadDraftRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: Omit<SetDraft, "savedAt">): void {
  try {
    if (isEmptyDraft(draft)) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  } catch {
    // Not saved this time; nothing else depends on it.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to clear.
  }
}

// What the learner said about their open answers, for the end of the set.
export function summarizeMarks(marks: Record<string, SelfMark>): Record<SelfMark, number> {
  const out: Record<SelfMark, number> = { right: 0, partial: 0, wrong: 0 };
  for (const m of Object.values(marks)) out[m] += 1;
  return out;
}
