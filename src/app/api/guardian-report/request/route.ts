import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendGuardianReportConsentEmail } from "@/lib/notifications/resend";

// Same shape as /api/consent/request (Hebrew Pattern Coach's guardian-email
// flow), applied to a SEPARATE, narrower consent — see
// docs/specs/guardian-ongoing-report.md. Every write here goes through the
// service role: a minor's own session must never be able to write
// guardian_report_consents directly (migration 037), the same lesson as
// guardian_links (migration 031).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// One row per minor (unique constraint), so there's no request count to
// rate-limit on the way the pattern-coach route does — instead, refuse a
// re-request that would just re-send mail within a short cooldown.
const RESEND_COOLDOWN_MINUTES = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { guardianEmail?: unknown } | null;
  const guardianEmail = typeof body?.guardianEmail === "string" ? body.guardianEmail.trim() : "";
  if (!guardianEmail) {
    return NextResponse.json({ error: "missing guardianEmail" }, { status: 400 });
  }
  if (guardianEmail.length > 254 || !EMAIL_PATTERN.test(guardianEmail)) {
    return NextResponse.json({ error: "invalid guardianEmail" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, age_band, parental_consent_status")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.age_band === "adult") {
    return NextResponse.json({ error: "guardian report is only for minors" }, { status: 400 });
  }
  // This consent is offered only once the voice-feature consent already
  // exists — asking a guardian who hasn't even approved voice features yet
  // to separately approve an activity report is backwards (spec §3.2).
  if (profile.parental_consent_status !== "granted") {
    return NextResponse.json({ error: "voice feature consent required first" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("guardian_report_consents")
    .select("id, created_at")
    .eq("minor_profile_id", user.id)
    .maybeSingle();
  if (existing && Date.now() - new Date(existing.created_at).getTime() < RESEND_COOLDOWN_MINUTES * 60_000) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { data: consent, error } = await supabaseAdmin
    .from("guardian_report_consents")
    .upsert(
      { minor_profile_id: user.id, guardian_email: guardianEmail, status: "pending", resolved_at: null },
      { onConflict: "minor_profile_id" }
    )
    .select()
    .single();
  if (error || !consent) {
    return NextResponse.json({ error: "failed to create consent request" }, { status: 500 });
  }

  const consentUrl = `${new URL(request.url).origin}/guardian-report/${consent.consent_token}`;
  const emailSent = await sendGuardianReportConsentEmail(guardianEmail, profile.display_name ?? "", consentUrl);
  if (!emailSent) {
    // Fail closed, same as the pattern-coach consent route: the token is
    // never handed to the browser, and the unsent request is dropped so a
    // retry doesn't just hit the cooldown above.
    await supabaseAdmin.from("guardian_report_consents").delete().eq("id", consent.id);
    return NextResponse.json({ error: "email not sent" }, { status: 502 });
  }

  return NextResponse.json({ emailSent: true });
}
