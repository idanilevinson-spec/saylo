import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendWeeklyReportEmail } from "@/lib/notifications/resend";
import { buildScoreSummary } from "@/lib/reports/buildScoreSummary";

// Fires Saturday evening Israel time (see vercel.json) — deliberately
// before the Israeli week actually rolls over at Sunday midnight, so
// buildScoreSummary's "week" range (current-week-to-date) already covers
// essentially the whole week without needing a separate "last week"
// query shape. Opt-in only (profiles.weekly_report_enabled).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name")
    .eq("weekly_report_enabled", true);

  let sent = 0;
  for (const profile of profiles ?? []) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;

    const summary = await buildScoreSummary(supabaseAdmin, profile.id, "week");
    if (await sendWeeklyReportEmail(email, profile.display_name, summary)) sent++;
  }

  return NextResponse.json({ candidates: (profiles ?? []).length, sent });
}
