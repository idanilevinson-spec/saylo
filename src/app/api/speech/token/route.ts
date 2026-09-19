import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { hasParentalClearance } from "@/lib/auth/consentServer";

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
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const purpose = new URL(request.url).searchParams.get("purpose");
  if (purpose !== "tts" && !(await hasParentalClearance(supabase, user.id))) {
    return NextResponse.json({ error: "parental consent required" }, { status: 403 });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json({ error: "speech provider not configured" }, { status: 503 });
  }

  const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": key },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "failed to issue speech token" }, { status: 502 });
  }

  const token = await res.text();
  return NextResponse.json({ token, region });
}
