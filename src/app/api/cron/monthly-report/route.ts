import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendMonthlyReportEmail } from "@/lib/notifications/resend";
import { buildScoreSummary, isLastDayOfIsraelMonth } from "@/lib/reports/buildScoreSummary";

// Runs daily (see vercel.json) since cron syntax has no clean way to fire
// only on "the last day of the month" — month lengths vary and leap years
// move February, so this checks that itself each run and no-ops on every
// day but the last, same trick isLastDayOfIsraelMonth exists for. Firing
// the evening before the month actually rolls over means buildScoreSummary's
// "month" range (current-month-to-date) already covers essentially the
// whole month. Opt-in only (profiles.monthly_report_enabled).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isLastDayOfIsraelMonth()) {
    return NextResponse.json({ skipped: "not the last day of the month" });
  }

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name")
    .eq("monthly_report_enabled", true);

  let sent = 0;
  for (const profile of profiles ?? []) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;

    const summary = await buildScoreSummary(supabaseAdmin, profile.id, "month");
    if (await sendMonthlyReportEmail(email, profile.display_name, summary)) sent++;
  }

  return NextResponse.json({ candidates: (profiles ?? []).length, sent });
}
