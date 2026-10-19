import type { SupabaseClient } from "@supabase/supabase-js";
import { isPremiumActive } from "./entitlements";

// A taste of the AI teacher during the free trial. The teacher is the paid
// feature, so until now a trial learner couldn't try it at all; this lets
// them have their first two conversations (up to twelve messages each,
// enough to reach the corrections and the end-of-conversation summary)
// before deciding. Paid subscribers are not affected. The routes enforce
// it; the pages only explain it.

export const TRIAL_TEACHER_CONVERSATIONS = 2;
export const TRIAL_TEACHER_MESSAGES = 12;
export const TRIAL_TEACHER_LIMIT_ERROR = "trial teacher limit";

// The conversations a trial learner may use (their first two), or null when
// they are not in an active trial (no row, trial over, or already paying,
// which the callers check first).
export async function trialTeacherConversationIds(supabase: SupabaseClient, profileId: string): Promise<string[] | null> {
  try {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_end")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (!sub || sub.status !== "trialing" || !isPremiumActive(sub)) return null;
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true })
      .limit(TRIAL_TEACHER_CONVERSATIONS);
    return ((conversations ?? []) as { id: string }[]).map((c) => c.id);
  } catch {
    return null;
  }
}
