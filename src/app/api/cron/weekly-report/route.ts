import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendWeeklyReportEmail, sendGuardianActivityReportEmail } from "@/lib/notifications/resend";
import { buildScoreSummary } from "@/lib/reports/buildScoreSummary";
import { getGuardianActivitySummary } from "@/lib/reports/guardianActivitySummary";

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

  // Independent of the loop above — a minor may have consented to the
  // guardian report without enabling their own weekly email, and vice
  // versa (docs/specs/guardian-ongoing-report.md). Same cron trigger, no
  // new schedule needed.
  const { data: guardianConsents } = await supabaseAdmin
    .from("guardian_report_consents")
    .select("minor_profile_id, guardian_email, consent_token, profiles(display_name)")
    .eq("status", "granted");

  let guardianReportsSent = 0;
  for (const consent of guardianConsents ?? []) {
    const displayName = (consent.profiles as unknown as { display_name: string } | null)?.display_name ?? "";
    const summary = await getGuardianActivitySummary(supabaseAdmin, consent.minor_profile_id);
    const unsubscribeUrl = `${new URL(request.url).origin}/guardian-report/${consent.consent_token}`;
    if (await sendGuardianActivityReportEmail(consent.guardian_email, displayName, summary, unsubscribeUrl)) {
      guardianReportsSent++;
    }
  }

  return NextResponse.json({
    candidates: (profiles ?? []).length,
    sent,
    guardianCandidates: (guardianConsents ?? []).length,
    guardianReportsSent,
  });
}
