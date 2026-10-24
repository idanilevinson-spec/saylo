import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendComebackEmail } from "@/lib/notifications/resend";
import { pickComeback } from "@/lib/notifications/comeback";
import type { CefrLevel } from "@/types/database";

// The come-back part of the daily reminders job: for every learner who
// turned email reminders on, gathers what pickComeback needs and sends at
// most one email. Skipped entirely until migration 049 has added
// profiles.last_comeback_email_at.
export async function runComebackEmails(now = new Date()): Promise<{ sent: number; checked: number; skipped?: string }> {
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, last_comeback_email_at")
    .eq("email_reminders_enabled", true);
  if (error) return { sent: 0, checked: 0, skipped: "profiles.last_comeback_email_at not available" };
  if (!profiles?.length) return { sent: 0, checked: 0 };

  const ids = profiles.map((p) => p.id);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [streaks, tests, questionCount] = await Promise.all([
    supabaseAdmin.from("streaks").select("profile_id, current_streak, last_active_date").in("profile_id", ids),
    supabaseAdmin
      .from("placement_tests")
      .select("id, profile_id, status, created_at, completed_at, result_cefr_overall")
      .in("profile_id", ids)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("placement_questions").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  let sent = 0;
  for (const profile of profiles) {
    const streak = (streaks.data ?? []).find((s) => s.profile_id === profile.id);
    const hasActiveStreak = !!streak && streak.current_streak > 0 && !!streak.last_active_date && streak.last_active_date >= yesterday;

    const mine = (tests.data ?? []).filter((t) => t.profile_id === profile.id);
    const completed = mine.find((t) => t.status === "completed" && t.completed_at) ?? null;
    const open = completed ? null : (mine.find((t) => t.status === "in_progress") ?? null);

    const [lastAttempt, openAnswers] = await Promise.all([
      supabaseAdmin
        .from("exercise_attempts")
        .select("created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      open
        ? supabaseAdmin
            .from("placement_test_responses")
            .select("created_at")
            .eq("placement_test_id", open.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as { created_at: string }[] }),
    ]);

    const attemptAt = lastAttempt.data?.created_at ? new Date(lastAttempt.data.created_at) : null;
    const placementAt = openAnswers.data?.[0]?.created_at
      ? new Date(openAnswers.data[0].created_at)
      : completed?.completed_at
        ? new Date(completed.completed_at)
        : null;
    const lastActiveAt = [attemptAt, placementAt].filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    const completedAt = completed?.completed_at ? new Date(completed.completed_at) : null;

    const message = pickComeback({
      now,
      hasActiveStreak,
      lastComebackAt: profile.last_comeback_email_at ? new Date(profile.last_comeback_email_at) : null,
      lastActiveAt,
      placementCompletedAt: completedAt,
      placedLevel: (completed?.result_cefr_overall as CefrLevel | null) ?? null,
      openPlacement: open
        ? { answered: openAnswers.data?.length ?? 0, total: questionCount.count ?? 0, startedAt: new Date(open.created_at) }
        : null,
      practisedSincePlacement: !!(attemptAt && completedAt && attemptAt > completedAt),
    });
    if (!message) continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;
    if (await sendComebackEmail(email, profile.display_name ?? "", message)) {
      sent++;
      await supabaseAdmin.from("profiles").update({ last_comeback_email_at: now.toISOString() }).eq("id", profile.id);
    }
  }

  return { sent, checked: profiles.length };
}
