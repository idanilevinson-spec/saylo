import { supabase } from "@/lib/supabase/browserClient";
import type { CefrLevel } from "@/types/database";

export type TopicMasteryStatus = "not_started" | "in_progress" | "mastered";

export interface TopicWithMastery {
  id: string;
  slug: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
  kind: "vocabulary" | "grammar";
  href: string;
  status: TopicMasteryStatus;
  accuracy: number | null;
}

const MASTERED_THRESHOLD = 80;
const MIN_ATTEMPTS_FOR_MASTERY = 3;

function statusFor(correct: number, total: number): { status: TopicMasteryStatus; accuracy: number | null } {
  if (total === 0) return { status: "not_started", accuracy: null };
  const accuracy = Math.round((correct / total) * 100);
  const status = total >= MIN_ATTEMPTS_FOR_MASTERY && accuracy >= MASTERED_THRESHOLD ? "mastered" : "in_progress";
  return { status, accuracy };
}

// Replaces the old static, hand-seeded learning_path_nodes list (which
// only ever covered the original 11 A1 topics and silently went stale
// every time new content was added this session) with a live view
// computed straight from topics/grammar_topics + the learner's own
// exercise_attempts — it can never drift out of sync with real content
// because there is nothing to re-seed.
export async function listTopicsWithMastery(profileId: string): Promise<TopicWithMastery[]> {
  const [{ data: vocabTopics }, { data: grammarTopics }, { data: attempts }] = await Promise.all([
    supabase.from("topics").select("*").eq("status", "published").order("cefr_level").order("sort_order"),
    supabase.from("grammar_topics").select("*").eq("status", "published").order("cefr_level").order("sort_order"),
    supabase
      .from("exercise_attempts")
      .select("is_correct, exercises(topic_id, grammar_topic_id)")
      .eq("profile_id", profileId),
  ]);

  const vocabStats = new Map<string, { correct: number; total: number }>();
  const grammarStats = new Map<string, { correct: number; total: number }>();

  for (const a of attempts ?? []) {
    const ex = a.exercises as unknown as { topic_id: string | null; grammar_topic_id: string | null } | null;
    if (!ex) continue;
    if (ex.topic_id) {
      const s = vocabStats.get(ex.topic_id) ?? { correct: 0, total: 0 };
      s.total += 1;
      if (a.is_correct) s.correct += 1;
      vocabStats.set(ex.topic_id, s);
    }
    if (ex.grammar_topic_id) {
      const s = grammarStats.get(ex.grammar_topic_id) ?? { correct: 0, total: 0 };
      s.total += 1;
      if (a.is_correct) s.correct += 1;
      grammarStats.set(ex.grammar_topic_id, s);
    }
  }

  const vocabEntries: TopicWithMastery[] = (vocabTopics ?? []).map((t) => {
    const s = vocabStats.get(t.id) ?? { correct: 0, total: 0 };
    const { status, accuracy } = statusFor(s.correct, s.total);
    return {
      id: t.id,
      slug: t.slug,
      name_he: t.name_he,
      name_en: t.name_en,
      cefr_level: t.cefr_level,
      kind: "vocabulary",
      href: `/vocabulary/${t.slug}`,
      status,
      accuracy,
    };
  });

  const grammarEntries: TopicWithMastery[] = (grammarTopics ?? []).map((t) => {
    const s = grammarStats.get(t.id) ?? { correct: 0, total: 0 };
    const { status, accuracy } = statusFor(s.correct, s.total);
    return {
      id: t.id,
      slug: t.slug,
      name_he: t.name_he,
      name_en: t.name_en,
      cefr_level: t.cefr_level,
      kind: "grammar",
      href: `/grammar/${t.slug}`,
      status,
      accuracy,
    };
  });

  const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return [...vocabEntries, ...grammarEntries].sort(
    (a, b) => CEFR_ORDER.indexOf(a.cefr_level) - CEFR_ORDER.indexOf(b.cefr_level)
  );
}

// Deterministic "pick one" for the daily lesson: same topic all day for
// a given user (stable across refreshes/devices), different users get
// different topics, and it changes at local midnight since the date
// string is the seed.
function seededIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

// skillLevels comes from the placement test / live skill_levels table
// (see src/lib/assessment/skillLevel.ts) so the daily pick is actually
// "adapted to the placement test" rather than picking any random
// not-yet-mastered topic regardless of how far it is from the learner's
// tested level.
export async function pickDailyLessonTopic(
  profileId: string,
  skillLevels: { vocabulary?: CefrLevel; grammar?: CefrLevel }
): Promise<TopicWithMastery | null> {
  const all = await listTopicsWithMastery(profileId);
  if (all.length === 0) return null;

  const notMastered = all.filter((t) => t.status !== "mastered");
  const pool = notMastered.length > 0 ? notMastered : all;

  const atLevel = pool.filter((t) => {
    const level = t.kind === "vocabulary" ? skillLevels.vocabulary : skillLevels.grammar;
    return level ? t.cefr_level === level : false;
  });
  const finalPool = atLevel.length > 0 ? atLevel : pool;

  const today = new Date().toISOString().slice(0, 10);
  const index = seededIndex(`${profileId}:${today}`, finalPool.length);
  return finalPool[index];
}
