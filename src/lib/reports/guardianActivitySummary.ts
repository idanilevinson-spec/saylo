import type { SupabaseClient } from "@supabase/supabase-js";
import { buildScoreSummary } from "@/lib/reports/buildScoreSummary";
import type { GuardianActivitySummary } from "@/lib/notifications/resend";

// Deliberately assembles only the four coarse fields
// docs/specs/guardian-ongoing-report.md §3.1 allows in a guardian report —
// buildScoreSummary's own `items` list (per-activity detail) is read here
// but never passed through.
export async function getGuardianActivitySummary(
  supabase: SupabaseClient,
  profileId: string
): Promise<GuardianActivitySummary> {
  const [summary, streakRes, placementRes] = await Promise.all([
    buildScoreSummary(supabase, profileId, "week"),
    supabase.from("streaks").select("current_streak").eq("profile_id", profileId).maybeSingle(),
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", profileId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    testsCount: summary.testsCount,
    xpEarned: summary.xpEarned,
    currentStreak: streakRes.data?.current_streak ?? 0,
    cefrLevel: placementRes.data?.result_cefr_overall ?? null,
  };
}
