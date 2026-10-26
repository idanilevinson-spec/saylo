import { supabase } from "@/lib/supabase/browserClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import { overallLevel } from "./levelOrder";
import { loadTopicWordProgress, withWordProgress } from "./vocabWordProgress";
import {
  COURSE_LEVELS,
  COURSE_UNITS,
  UNIT_CHECK_QUESTIONS,
  UNIT_CHECK_XP_PREFIX,
  unitNumber,
  type CourseStep,
  type CourseStepKind,
  type CourseUnit,
} from "./course";
import type { CefrLevel, Exercise, SkillArea } from "@/types/database";

// The learner's place in the course, computed from what is already
// recorded (exercise attempts, writing submissions, conversations, the
// unit-check XP events), so there is no progress table to keep in sync.

export type StepStatus = "done" | "started" | "todo";

export interface ResolvedStep extends CourseStep {
  contentId: string;
  titleHe: string;
  titleEn: string | null;
  href: string;
  minutes: number;
  status: StepStatus;
  // The numbers behind the status, so the unit page can say how close a
  // step is (courseStepText.ts). Only what applies to the step's kind.
  detail?: StepDetail;
}

export interface StepDetail {
  // Exercise answers on the topic, and how many were right.
  answered?: number;
  correct?: number;
  // A text's or clip's questions, and how many have an answer.
  questions?: number;
  questionsAnswered?: number;
  // A vocabulary topic's words, and how many are mastered in the games.
  words?: number;
  wordsMastered?: number;
}

export interface UnitProgress {
  unit: CourseUnit;
  number: number;
  steps: ResolvedStep[];
  checkPassed: boolean;
  status: StepStatus;
  // Steps plus the unit check.
  done: number;
  total: number;
  // Steps practised but not finished: the blue segments of the track. The
  // counters show them next to "done", so a practised step never reads as
  // "0 of 6" while the track shows it in progress.
  inProgress: number;
  // When the learner last practised anything in this unit (ISO), if ever.
  lastActive?: string | null;
}

export interface CourseProgress {
  // The learner's overall level (placement, then per-skill levels).
  level: CefrLevel | null;
  units: UnitProgress[];
  // Where "continue" goes: the first unfinished unit from the learner's
  // level on (or from A1 before placement).
  current: UnitProgress | null;
}

// Same bar as topicMastery.ts: a topic counts as learned at 80% over at
// least three answers.
export const MASTERED_THRESHOLD = 80;
export const MIN_ATTEMPTS_FOR_MASTERY = 3;

export function topicStatus(correct: number, total: number): StepStatus {
  if (total === 0) return "todo";
  return total >= MIN_ATTEMPTS_FOR_MASTERY && (correct / total) * 100 >= MASTERED_THRESHOLD ? "done" : "started";
}

// A text or clip is done once every one of its questions has an answer.
export function questionsStatus(answered: number, questions: number): StepStatus {
  if (answered === 0) return "todo";
  return answered >= Math.max(1, questions) ? "done" : "started";
}

export function summarizeUnit(unit: CourseUnit, steps: ResolvedStep[], checkPassed: boolean): UnitProgress {
  const done = steps.filter((s) => s.status === "done").length + (checkPassed ? 1 : 0);
  const total = steps.length + 1;
  const anything = done > 0 || steps.some((s) => s.status === "started");
  return {
    unit,
    number: unitNumber(unit),
    steps,
    checkPassed,
    status: checkPassed ? "done" : anything ? "started" : "todo",
    done,
    total,
    inProgress: steps.filter((s) => s.status === "started").length,
  };
}

export function pickCurrent(units: UnitProgress[], level: CefrLevel | null): UnitProgress | null {
  // "Continue" means continue: a unit the learner is in the middle of comes
  // first, the one practised most recently (owner, 2026-10-24: it used to
  // send a learner with units 6 and 8 under way back to unit 1).
  const underway = units.filter((u) => u.status === "started");
  if (underway.length > 0) {
    return underway.reduce((best, u) => ((u.lastActive ?? "") > (best.lastActive ?? "") ? u : best));
  }
  const from = level ? COURSE_LEVELS.indexOf(level) : 0;
  const ahead = units.filter((u) => COURSE_LEVELS.indexOf(u.unit.level) >= from);
  return ahead.find((u) => u.status !== "done") ?? null;
}

// The next thing to do inside a unit: its first unfinished step, else the
// unit check.
export function nextInUnit(progress: UnitProgress): ResolvedStep | "check" | null {
  if (progress.checkPassed) return null;
  return progress.steps.find((s) => s.status !== "done") ?? "check";
}

interface ContentRow {
  id: string;
  key: string;
  titleHe: string;
  titleEn: string | null;
  minutes: number;
}

function words(text: string | null) {
  return (text ?? "").trim().split(/\s+/).filter(Boolean).length;
}

async function loadContent(): Promise<Record<CourseStepKind, Map<string, ContentRow>>> {
  const [vocab, grammar, reading, listening, writing, scenarios] = await Promise.all([
    supabase.from("topics").select("id, slug, name_he, name_en").eq("status", "published"),
    supabase.from("grammar_topics").select("id, slug, name_he, name_en").eq("status", "published"),
    supabase.from("reading_texts").select("id, title_he, title_en, body_en").eq("status", "published"),
    supabase.from("listening_clips").select("id, title_he, title_en, transcript_en").eq("status", "published"),
    supabase.from("writing_prompts").select("id, title_he").eq("status", "published"),
    supabase.from("conversation_scenarios").select("id, slug, title_he, title_en").eq("status", "published"),
  ]);
  const index = (rows: ContentRow[]) => new Map(rows.map((r) => [r.key, r]));
  return {
    vocabulary: index((vocab.data ?? []).map((t) => ({ id: t.id, key: t.slug, titleHe: t.name_he, titleEn: t.name_en, minutes: 6 }))),
    grammar: index((grammar.data ?? []).map((t) => ({ id: t.id, key: t.slug, titleHe: t.name_he, titleEn: t.name_en, minutes: 8 }))),
    reading: index(
      (reading.data ?? []).map((t) => ({
        id: t.id,
        key: t.title_en,
        titleHe: t.title_he,
        titleEn: t.title_en,
        minutes: Math.max(1, Math.round(words(t.body_en) / 110)) + 4,
      })),
    ),
    listening: index(
      (listening.data ?? []).map((t) => ({
        id: t.id,
        key: t.title_en,
        titleHe: t.title_he,
        titleEn: t.title_en,
        minutes: Math.max(1, Math.round(words(t.transcript_en) / 130)) + 3,
      })),
    ),
    writing: index((writing.data ?? []).map((t) => ({ id: t.id, key: t.id, titleHe: t.title_he, titleEn: null, minutes: 10 }))),
    speaking: index((scenarios.data ?? []).map((t) => ({ id: t.id, key: t.slug, titleHe: t.title_he, titleEn: t.title_en, minutes: 10 }))),
  };
}

export function stepHref(kind: CourseStepKind, row: { id: string; key: string }): string {
  switch (kind) {
    case "vocabulary":
      return `/vocabulary/${row.key}`;
    case "grammar":
      return `/grammar/${row.key}`;
    case "reading":
      return `/reading/${row.id}`;
    case "listening":
      return `/listening/${row.id}`;
    case "writing":
      return `/writing/${row.id}`;
    case "speaking":
      return `/speaking?scenario=${encodeURIComponent(row.key)}`;
  }
}

export async function getCourseProgress(profileId: string): Promise<CourseProgress> {
  const [content, placement, skills, attempts, questions, submissions, conversations, checks, wordProgress] = await Promise.all([
    loadContent(),
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", profileId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", profileId),
    fetchAll((from, to) =>
      supabase
        .from("exercise_attempts")
        .select("exercise_id, is_correct, created_at, exercises(topic_id, grammar_topic_id, reading_text_id, listening_clip_id)")
        .eq("profile_id", profileId)
        .order("id")
        .range(from, to),
    ),
    fetchAll((from, to) =>
      supabase
        .from("exercises")
        .select("reading_text_id, listening_clip_id")
        .eq("status", "published")
        .or("reading_text_id.not.is.null,listening_clip_id.not.is.null")
        .order("id")
        .range(from, to),
    ),
    supabase.from("writing_submissions").select("writing_prompt_id, created_at").eq("profile_id", profileId),
    supabase.from("conversations").select("scenario_id, status, created_at").eq("profile_id", profileId).not("scenario_id", "is", null),
    supabase.from("xp_events").select("source").eq("profile_id", profileId).like("source", `${UNIT_CHECK_XP_PREFIX}%`),
    loadTopicWordProgress(profileId),
  ]);

  const bySkill: Partial<Record<SkillArea, CefrLevel>> = {};
  for (const row of skills.data ?? []) bySkill[row.skill as SkillArea] = row.cefr_level as CefrLevel;
  const level = overallLevel((placement.data?.result_cefr_overall as CefrLevel | null) ?? null, bySkill);

  // Topic accuracy, and distinct questions answered per text or clip.
  const topicStats = new Map<string, { correct: number; total: number }>();
  const answered = new Map<string, Set<string>>();
  // Latest practice per piece of content, to find the unit worked on last.
  const lastActive = new Map<string, string>();
  const touch = (id: string | null, at: string | null | undefined) => {
    if (id && at && at > (lastActive.get(id) ?? "")) lastActive.set(id, at);
  };
  for (const a of attempts.data) {
    const ex = a.exercises as unknown as {
      topic_id: string | null;
      grammar_topic_id: string | null;
      reading_text_id: string | null;
      listening_clip_id: string | null;
    } | null;
    if (!ex) continue;
    for (const id of [ex.topic_id, ex.grammar_topic_id, ex.reading_text_id, ex.listening_clip_id]) touch(id, a.created_at);
    for (const topicId of [ex.topic_id, ex.grammar_topic_id]) {
      if (!topicId) continue;
      const stat = topicStats.get(topicId) ?? { correct: 0, total: 0 };
      stat.total += 1;
      if (a.is_correct) stat.correct += 1;
      topicStats.set(topicId, stat);
    }
    const textId = ex.reading_text_id ?? ex.listening_clip_id;
    if (textId) {
      const set = answered.get(textId) ?? new Set<string>();
      set.add(a.exercise_id);
      answered.set(textId, set);
    }
  }
  const questionCount = new Map<string, number>();
  for (const q of questions.data) {
    const textId = q.reading_text_id ?? q.listening_clip_id;
    if (textId) questionCount.set(textId, (questionCount.get(textId) ?? 0) + 1);
  }
  const submitted = new Set((submissions.data ?? []).map((s) => s.writing_prompt_id));
  for (const s of submissions.data ?? []) touch(s.writing_prompt_id, s.created_at);
  const talked = new Map<string, StepStatus>();
  for (const c of conversations.data ?? []) {
    if (!c.scenario_id) continue;
    touch(c.scenario_id, c.created_at);
    if (c.status === "completed") talked.set(c.scenario_id, "done");
    else if (!talked.has(c.scenario_id)) talked.set(c.scenario_id, "started");
  }
  const passed = new Set((checks.data ?? []).map((e) => e.source.slice(UNIT_CHECK_XP_PREFIX.length)));

  function statusOf(kind: CourseStepKind, id: string): StepStatus {
    switch (kind) {
      case "vocabulary": {
        const stat = topicStats.get(id);
        return withWordProgress(topicStatus(stat?.correct ?? 0, stat?.total ?? 0), wordProgress.get(id));
      }
      case "grammar": {
        const stat = topicStats.get(id);
        return topicStatus(stat?.correct ?? 0, stat?.total ?? 0);
      }
      case "reading":
      case "listening":
        return questionsStatus(answered.get(id)?.size ?? 0, questionCount.get(id) ?? 0);
      case "writing":
        return submitted.has(id) ? "done" : "todo";
      case "speaking":
        return talked.get(id) ?? "todo";
    }
  }

  function detailOf(kind: CourseStepKind, id: string): StepDetail | undefined {
    switch (kind) {
      case "vocabulary": {
        const stat = topicStats.get(id);
        const words = wordProgress.get(id);
        return { answered: stat?.total ?? 0, correct: stat?.correct ?? 0, words: words?.words ?? 0, wordsMastered: words?.mastered ?? 0 };
      }
      case "grammar": {
        const stat = topicStats.get(id);
        return { answered: stat?.total ?? 0, correct: stat?.correct ?? 0 };
      }
      case "reading":
      case "listening":
        return { questions: questionCount.get(id) ?? 0, questionsAnswered: answered.get(id)?.size ?? 0 };
      default:
        return undefined;
    }
  }

  const units = COURSE_UNITS.map((unit) => {
    const steps: ResolvedStep[] = [];
    for (const step of unit.steps) {
      // A step whose content was unpublished drops out rather than
      // blocking the unit; course-audit.mjs reports it.
      const row = content[step.kind].get(step.ref);
      if (!row) continue;
      steps.push({
        ...step,
        contentId: row.id,
        titleHe: row.titleHe,
        titleEn: row.titleEn,
        href: stepHref(step.kind, row),
        minutes: row.minutes,
        status: statusOf(step.kind, row.id),
        detail: detailOf(step.kind, row.id),
      });
    }
    const unitActive = steps.reduce<string | null>((latest, s) => {
      const at = lastActive.get(s.contentId) ?? wordProgress.get(s.contentId)?.lastPractised ?? null;
      return at && at > (latest ?? "") ? at : latest;
    }, null);
    return { ...summarizeUnit(unit, steps, passed.has(unit.id)), lastActive: unitActive };
  });

  return { level, units, current: pickCurrent(units, level) };
}

// Questions for the unit check: the unit's own vocabulary and grammar
// exercises, as even a mix of the two as the unit allows, shuffled.
export async function getUnitCheckExercises(progress: UnitProgress): Promise<Exercise[]> {
  const topicIds = progress.steps.filter((s) => s.kind === "vocabulary").map((s) => s.contentId);
  const grammarIds = progress.steps.filter((s) => s.kind === "grammar").map((s) => s.contentId);
  const types = ["mcq", "fill_blank", "reorder"];
  const [vocab, grammar] = await Promise.all([
    topicIds.length
      ? supabase.from("exercises").select("*").eq("status", "published").in("topic_id", topicIds).in("type", types).limit(400)
      : Promise.resolve({ data: [] as Exercise[] }),
    grammarIds.length
      ? supabase.from("exercises").select("*").eq("status", "published").in("grammar_topic_id", grammarIds).in("type", types).limit(400)
      : Promise.resolve({ data: [] as Exercise[] }),
  ]);
  return pickCheckQuestions((vocab.data ?? []) as Exercise[], (grammar.data ?? []) as Exercise[], UNIT_CHECK_QUESTIONS);
}

export function pickCheckQuestions<T>(vocab: T[], grammar: T[], count: number, random = Math.random): T[] {
  const shuffle = (items: T[]) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const a = shuffle(vocab);
  const b = shuffle(grammar);
  // Half from each when both have enough; the other side fills any gap.
  const fromGrammar = Math.min(b.length, Math.max(count - a.length, Math.ceil(count / 2)));
  const fromVocab = Math.min(a.length, count - fromGrammar);
  return shuffle([...a.slice(0, fromVocab), ...b.slice(0, fromGrammar)]);
}
