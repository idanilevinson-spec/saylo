import type { createClient } from "@/lib/supabase/serverClient";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Rolling-24h caps on the AI features that have no limit of their own
// (writing and reading responses are capped in the database, new
// conversations per day too, but not the turns inside them or the helpers
// around them). Counted from ai_usage_log, which every AI call already
// writes. Far above what a real learner does in a day; they exist so a
// script, or a stuck retry loop, can't run up the bill.
export const DAILY_AI_LIMITS = {
  conversation_turn: 300,
  word_lookup: 300,
  conversation_ideas: 100,
  conversation_opener: 40,
  conversation_scoring: 40,
  speaking_test_questions: 30,
  speaking_test_response: 100,
} as const;

export type LimitedAiFeature = keyof typeof DAILY_AI_LIMITS;

export const DAILY_LIMIT_ERROR = "daily ai limit reached";

// True while the learner is under today's cap for this feature. A failed
// count never blocks anyone: the cap is a safety net, not a gate.
export async function underDailyAiLimit(
  supabase: SupabaseClient,
  profileId: string,
  feature: LimitedAiFeature,
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("feature", feature)
      .gte("created_at", since);
    if (error) return true;
    return (count ?? 0) < DAILY_AI_LIMITS[feature];
  } catch {
    return true;
  }
}
