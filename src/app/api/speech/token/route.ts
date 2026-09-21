import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";

// Issues a short-lived Azure Speech auth token so the browser can run
// live pronunciation assessment via the mic without ever seeing
// AZURE_SPEECH_KEY. Tokens expire after ~10 minutes (Azure's own limit).
//
// Only text-to-speech (?purpose=tts) is open to a minor without a guardian's
// consent, since it plays audio and records nothing. Every other request is
// treated as speech recognition, i.e. capturing the user's voice, so a minor
// needs granted consent — including a bare call with no purpose. (An Azure
// token can't be scoped, so this can't stop a client that lies about its
// purpose; it does stop every honest client and any direct call.)
// Azure tokens live 10 minutes. A client may in turn keep what it receives for
// up to the same span below, so the two must add up to comfortably less.
const TOKEN_REUSE_MS = 4 * 60 * 1000;
let cachedToken: { token: string; region: string; expiresAt: number } | null = null;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const purpose = new URL(request.url).searchParams.get("purpose");
  // Recognition streams the learner's voice to Azure, so it needs their
  // agreement first; text-to-speech only reads out fixed lesson text.
  if (purpose !== "tts" && !hasAiConsent(user)) {
    return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });
  }
  // Independent checks, both required: one round trip instead of two. Premium
  // is still reported first when both fail.
  const [premium, cleared] = await Promise.all([
    isPremiumServer(supabase, user.id),
    purpose === "tts" ? Promise.resolve(true) : hasParentalClearance(supabase, user.id),
  ]);
  if (!premium) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }
  if (!cleared) {
    return NextResponse.json({ error: "parental consent required" }, { status: 403 });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json({ error: "speech provider not configured" }, { status: 503 });
  }

  // The token belongs to the app, not to the user, and is good for ~10
  // minutes. Every authorised request used to trigger a fresh call to Azure;
  // a warm server instance now reuses one for a few minutes (see
  // TOKEN_REUSE_MS) instead of adding that round trip to each voice turn.
  const now = Date.now();
  if (cachedToken && cachedToken.region === region && now < cachedToken.expiresAt) {
    return NextResponse.json({ token: cachedToken.token, region });
  }

  const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": key },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "failed to issue speech token" }, { status: 502 });
  }

  const token = await res.text();
  cachedToken = { token, region, expiresAt: now + TOKEN_REUSE_MS };
  return NextResponse.json({ token, region });
}
