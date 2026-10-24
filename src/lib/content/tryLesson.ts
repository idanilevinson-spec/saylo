import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { unitsForLevel } from "@/lib/content/course";
import type { CefrLevel, ExerciseType } from "@/types/database";

// The public taster lesson (/try): real questions from the first unit of a
// beginner, middle and advanced level, so a visitor feels the product
// before signing up. Read with the admin client on the server (content is
// behind sign-in otherwise), cached for an hour; the visitor's answers are
// graded in the browser and never stored.

export const TRY_LEVELS: CefrLevel[] = ["A1", "B1", "C1"];
const TYPES: ExerciseType[] = ["mcq", "fill_blank", "reorder"];
const POOL_PER_SIDE = 12;

export interface TryQuestion {
  id: string;
  type: ExerciseType;
  content: Record<string, unknown>;
  side: "vocabulary" | "grammar";
}

export interface TryLevel {
  level: CefrLevel;
  unitTitleHe: string;
  unitGoalHe: string;
  pool: TryQuestion[];
}

export const getTryLevels = unstable_cache(
  async (): Promise<TryLevel[]> => {
    const out: TryLevel[] = [];
    for (const level of TRY_LEVELS) {
      const unit = unitsForLevel(level)[0];
      if (!unit) continue;
      const vocabSlugs = unit.steps.filter((s) => s.kind === "vocabulary").map((s) => s.ref);
      const grammarSlugs = unit.steps.filter((s) => s.kind === "grammar").map((s) => s.ref);
      const [topics, grammarTopics] = await Promise.all([
        vocabSlugs.length ? supabaseAdmin.from("topics").select("id").in("slug", vocabSlugs) : Promise.resolve({ data: [] }),
        grammarSlugs.length ? supabaseAdmin.from("grammar_topics").select("id").in("slug", grammarSlugs) : Promise.resolve({ data: [] }),
      ]);
      const topicIds = (topics.data ?? []).map((t) => t.id);
      const grammarIds = (grammarTopics.data ?? []).map((t) => t.id);
      const [vocab, grammar] = await Promise.all([
        topicIds.length
          ? supabaseAdmin.from("exercises").select("id, type, content").eq("status", "published").in("topic_id", topicIds).in("type", TYPES).limit(POOL_PER_SIDE)
          : Promise.resolve({ data: [] }),
        grammarIds.length
          ? supabaseAdmin.from("exercises").select("id, type, content").eq("status", "published").in("grammar_topic_id", grammarIds).in("type", TYPES).limit(POOL_PER_SIDE)
          : Promise.resolve({ data: [] }),
      ]);
      const pool: TryQuestion[] = [
        ...((vocab.data ?? []) as Omit<TryQuestion, "side">[]).map((q) => ({ ...q, side: "vocabulary" as const })),
        ...((grammar.data ?? []) as Omit<TryQuestion, "side">[]).map((q) => ({ ...q, side: "grammar" as const })),
      ];
      if (pool.length > 0) out.push({ level, unitTitleHe: unit.titleHe, unitGoalHe: unit.goalHe, pool });
    }
    return out;
  },
  ["try-lesson-levels-v1"],
  { revalidate: 3600 },
);
