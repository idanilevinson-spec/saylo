import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendGuardianConsentEmail } from "@/lib/notifications/resend";

// A minor can ask a handful of times a day (typo, lost email) — enough for a
// real family, too few to use this route as a way to send us-branded mail to
// strangers.
const MAX_REQUESTS_PER_DAY = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    return NextResponse.json({ error: "consent not required" }, { status: 400 });
  }
  if (profile.parental_consent_status === "granted") {
    return NextResponse.json({ error: "already granted" }, { status: 409 });
  }

  // Everything below writes with the service role: a signed-in user has no
  // direct write access to guardian_links or to parental_consent_status
  // (migration 031), so a minor can never mint or read the guardian's token.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("guardian_links")
    .select("id", { count: "exact", head: true })
    .eq("minor_profile_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { data: link, error } = await supabaseAdmin
    .from("guardian_links")
    .insert({ minor_profile_id: user.id, guardian_email: guardianEmail })
    .select()
    .single();
  if (error || !link) {
    return NextResponse.json({ error: "failed to create consent request" }, { status: 500 });
  }

  const consentUrl = `${new URL(request.url).origin}/consent/${link.consent_token}`;
  const emailSent = await sendGuardianConsentEmail(guardianEmail, profile.display_name ?? "", consentUrl);
  if (!emailSent) {
    // Fail closed: the token is never handed to the browser, because the
    // minor must not be able to approve their own request. Drop the unsent
    // request so it neither counts toward the daily limit nor stays valid.
    await supabaseAdmin.from("guardian_links").delete().eq("id", link.id);
    return NextResponse.json({ error: "email not sent" }, { status: 502 });
  }

  // Only the newest link stays valid, so an older one sent to a mistyped
  // address cannot be used to approve.
  await supabaseAdmin
    .from("guardian_links")
    .delete()
    .eq("minor_profile_id", user.id)
    .eq("status", "pending")
    .neq("id", link.id);
  await supabaseAdmin.from("profiles").update({ parental_consent_status: "pending" }).eq("id", user.id);
  return NextResponse.json({ emailSent: true });
}
