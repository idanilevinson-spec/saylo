import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";

// Issues a short-lived Azure Speech auth token so the browser can run
// live pronunciation assessment via the mic without ever seeing
// AZURE_SPEECH_KEY. Tokens expire after ~10 minutes (Azure's own limit).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
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
