import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
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

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("guardian_links")
    .select("id", { count: "exact", head: true })
    .eq("minor_profile_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { data: link, error } = await supabase
    .from("guardian_links")
    .insert({ minor_profile_id: user.id, guardian_email: guardianEmail })
    .select()
    .single();
  if (error || !link) {
    return NextResponse.json({ error: "failed to create consent request" }, { status: 500 });
  }

  await supabase.from("profiles").update({ parental_consent_status: "pending" }).eq("id", user.id);

  const consentUrl = `${new URL(request.url).origin}/consent/${link.consent_token}`;
  const emailSent = await sendGuardianConsentEmail(guardianEmail, profile.display_name ?? "", consentUrl);

  // The link only goes back to the browser when the email could not be sent —
  // otherwise the minor would be holding the very link meant for the parent.
  return NextResponse.json({ emailSent, consentToken: emailSent ? null : link.consent_token });
}
