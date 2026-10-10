import { supabase } from "@/lib/supabase/browserClient";
import { nearestLevelWith, overallLevel } from "./levelOrder";

export { overallLevel };
import type { CefrLevel, SkillArea } from "@/types/database";
import { fetchAll } from "@/lib/supabase/fetchAll";

// "Today, at your level": one item from each kind of practice, picked at
// the learner's level in that skill (or the overall placement result), so
// the home page opens on what to do now instead of a catalog to search.
//
// For each kind: an item already worked on today stays today's item (and
// shows as done); otherwise the first one not yet worked on at the level,
// in the content's own order; otherwise the one least recently touched.
// An empty level falls back to the nearest level that has content.

export type PlanKind = "grammar" | "vocabulary" | "reading" | "listening" | "writing" | "speaking";

export interface PlanCandidate {
  id: string;
  titleHe: string;
  titleEn: string;
  level: CefrLevel;
  href: string;
  minutes: number;
}

export interface PlanItem extends PlanCandidate {
  kind: PlanKind;
  doneToday: boolean;
  // When the learner's own level had nothing of this kind.
  fallbackFrom: CefrLevel | null;
}

const KIND_SKILL: Record<PlanKind, SkillArea> = {
  grammar: "grammar",
  vocabulary: "vocabulary",
  reading: "reading",
  listening: "listening",
  writing: "writing",
  speaking: "speaking",
};

export function pickForKind(
  kind: PlanKind,
  candidates: PlanCandidate[],
  level: CefrLevel,
  lastTouched: Map<string, number>,
  todayStart: number,
): PlanItem | null {
  const at = nearestLevelWith(level, (l) => candidates.some((c) => c.level === l));
  if (!at) return null;
  const pool = candidates.filter((c) => c.level === at);
  const today = pool.find((c) => (lastTouched.get(c.id) ?? 0) >= todayStart);
  const fresh = pool.find((c) => !lastTouched.has(c.id));
  const oldest = [...pool].sort((a, b) => (lastTouched.get(a.id) ?? 0) - (lastTouched.get(b.id) ?? 0))[0];
  const pick = today ?? fresh ?? oldest;
  return { ...pick, kind, doneToday: pick === today, fallbackFrom: at === level ? null : level };
}

export interface LevelPlan {
  overall: CefrLevel | null;
  bySkill: Partial<Record<SkillArea, CefrLevel>>;
  items: PlanItem[];
  // How much of each kind sits at the learner's level in that skill.
  countsAtLevel: Record<PlanKind, number>;
}

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function getLevelPlan(profileId: string): Promise<LevelPlan> {
  const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
  const [placement, skills, grammar, vocab, reading, listening, writing, scenarios, attempts, submissions, conversations] =
    await Promise.all([
      supabase
        .from("placement_tests")
        .select("result_cefr_overall")
        .eq("profile_id", profileId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", profileId),
      supabase.from("grammar_topics").select("id, slug, name_he, name_en, cefr_level").eq("status", "published").order("sort_order"),
      supabase.from("topics").select("id, slug, name_he, name_en, cefr_level").eq("status", "published").order("sort_order"),
      supabase.from("reading_texts").select("id, title_he, title_en, body_en, cefr_level").eq("status", "published").order("sort_order"),
      supabase.from("listening_clips").select("id, title_he, title_en, transcript_en, cefr_level").eq("status", "published").order("sort_order"),
      supabase.from("writing_prompts").select("id, title_he, prompt_en, cefr_level").eq("status", "published").order("sort_order"),
      supabase.from("conversation_scenarios").select("id, title_he, title_en, cefr_level").eq("status", "published").order("sort_order"),
      fetchAll(
        (from, to) =>
          supabase
            .from("exercise_attempts")
            .select("created_at, exercises(topic_id, grammar_topic_id, reading_text_id, listening_clip_id)")
            .eq("profile_id", profileId)
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .order("id")
            .range(from, to),
        3000,
      ),
      supabase.from("writing_submissions").select("writing_prompt_id, created_at").eq("profile_id", profileId),
      supabase.from("conversations").select("scenario_id, created_at").eq("profile_id", profileId).not("scenario_id", "is", null),
    ]);

  const bySkill: Partial<Record<SkillArea, CefrLevel>> = {};
  for (const s of skills.data ?? []) bySkill[s.skill as SkillArea] = s.cefr_level as CefrLevel;
  const placed = (placement.data?.result_cefr_overall as CefrLevel | null) ?? null;
  const overall = overallLevel(placed, bySkill);

  // Most recent activity per content id, across every kind.
  const lastTouched = new Map<string, number>();
  const touch = (id: string | null | undefined, at: string) => {
    if (!id) return;
    const t = new Date(at).getTime();
    if (t > (lastTouched.get(id) ?? 0)) lastTouched.set(id, t);
  };
  for (const a of attempts.data ?? []) {
    const ex = a.exercises as unknown as {
      topic_id: string | null;
      grammar_topic_id: string | null;
      reading_text_id: string | null;
      listening_clip_id: string | null;
    } | null;
    if (!ex) continue;
    touch(ex.topic_id, a.created_at);
    touch(ex.grammar_topic_id, a.created_at);
    touch(ex.reading_text_id, a.created_at);
    touch(ex.listening_clip_id, a.created_at);
  }
  for (const s of submissions.data ?? []) touch(s.writing_prompt_id, s.created_at);
  for (const c of conversations.data ?? []) touch(c.scenario_id, c.created_at);

  const candidates: Record<PlanKind, PlanCandidate[]> = {
    grammar: (grammar.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.name_he,
      titleEn: t.name_en,
      level: t.cefr_level as CefrLevel,
      href: `/grammar/${t.slug}`,
      minutes: 8,
    })),
    vocabulary: (vocab.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.name_he,
      titleEn: t.name_en,
      level: t.cefr_level as CefrLevel,
      href: `/vocabulary/${t.slug}`,
      minutes: 6,
    })),
    reading: (reading.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.title_he,
      titleEn: t.title_en,
      level: t.cefr_level as CefrLevel,
      href: `/reading/${t.id}`,
      // Reading time at a learner's pace plus the questions.
      minutes: Math.max(1, Math.round(words(t.body_en) / 110)) + 4,
    })),
    listening: (listening.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.title_he,
      titleEn: t.title_en,
      level: t.cefr_level as CefrLevel,
      href: `/listening/${t.id}`,
      minutes: Math.max(1, Math.round(words(t.transcript_en) / 130)) + 3,
    })),
    writing: (writing.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.title_he,
      titleEn: t.prompt_en,
      level: t.cefr_level as CefrLevel,
      href: `/writing/${t.id}`,
      minutes: 10,
    })),
    speaking: (scenarios.data ?? []).map((t) => ({
      id: t.id,
      titleHe: t.title_he,
      titleEn: t.title_en,
      level: t.cefr_level as CefrLevel,
      href: `/speaking`,
      minutes: 10,
    })),
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const levelOf = (kind: PlanKind) => bySkill[KIND_SKILL[kind]] ?? overall;

  const kinds: PlanKind[] = ["grammar", "vocabulary", "reading", "listening", "speaking", "writing"];
  const items: PlanItem[] = [];
  const countsAtLevel = {} as Record<PlanKind, number>;
  for (const kind of kinds) {
    const level = levelOf(kind);
    countsAtLevel[kind] = level ? candidates[kind].filter((c) => c.level === level).length : 0;
    if (!level) continue;
    const item = pickForKind(kind, candidates[kind], level, lastTouched, todayStart.getTime());
    if (item) items.push(item);
  }

  return { overall, bySkill, items, countsAtLevel };
}
