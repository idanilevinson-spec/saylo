import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendStreakReminderEmail } from "@/lib/notifications/resend";
import { sendPushNotification } from "@/lib/notifications/webpush";

// Daily job (see vercel.json) — reminds anyone with an active streak who
// hasn't practiced yet today, at most once per day. Runs with the
// service-role client since it must read across every user, not just the
// caller's own row.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: atRiskStreaks } = await supabaseAdmin
    .from("streaks")
    .select("profile_id, current_streak, last_active_date, last_reminder_sent_at")
    .gt("current_streak", 0)
    .neq("last_active_date", today);

  const candidates = (atRiskStreaks ?? []).filter(
    (s) => !s.last_reminder_sent_at || s.last_reminder_sent_at.slice(0, 10) !== today
  );

  let remindedEmail = 0;
  let remindedPush = 0;

  for (const streak of candidates) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, email_reminders_enabled, push_reminders_enabled")
      .eq("id", streak.profile_id)
      .maybeSingle();
    if (!profile) continue;

    if (profile.email_reminders_enabled) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(streak.profile_id);
      const email = userData?.user?.email;
      if (email && (await sendStreakReminderEmail(email, profile.display_name))) {
        remindedEmail++;
      }
    }

    if (profile.push_reminders_enabled) {
      const { data: subs } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("profile_id", streak.profile_id);

      for (const sub of subs ?? []) {
        const result = await sendPushNotification(sub, {
          title: "אל תשברו את הרצף! 🔥",
          body: `${streak.current_streak} ימים ברצף — 5 דקות מספיקות כדי לשמור עליו`,
          url: "/dashboard",
        });
        if (result.ok) remindedPush++;
        if (result.expired) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    await supabaseAdmin
      .from("streaks")
      .update({ last_reminder_sent_at: new Date().toISOString() })
      .eq("profile_id", streak.profile_id);
  }

  return NextResponse.json({ candidates: candidates.length, remindedEmail, remindedPush });
}
