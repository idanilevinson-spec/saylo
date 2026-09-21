import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/serverClient";

// Email links (password reset, sign-up confirmation) that carry a one-time
// token_hash instead of a PKCE code. Verifying it here, on the server, signs
// the learner in without needing anything from the browser that asked for the
// email — a PKCE code only works in that same browser, so a reset link opened
// from a mail app (which is how the iOS app's users open it) used to lead
// nowhere. The email template points here: see the Supabase "Reset Password"
// template.
const ALLOWED_TYPES: EmailOtpType[] = ["recovery", "signup", "email"];

// Only ever send the learner to a page on this site.
function safeNext(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const isRecovery = type === "recovery";
  // A failed reset link lands on the reset page, which explains it and offers
  // a new one; anything else goes to the login page.
  const failureUrl = `${origin}${isRecovery ? "/reset-password/confirm" : "/login"}`;

  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.redirect(failureUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(failureUrl);

  const next = safeNext(searchParams.get("next"), isRecovery ? "/reset-password/confirm" : "/dashboard");
  return NextResponse.redirect(`${origin}${next}`);
}
