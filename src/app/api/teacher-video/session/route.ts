import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { DAILY_LIMIT_ERROR, underDailyAiLimit } from "@/lib/ai/dailyLimit";
import { logAiUsage } from "@/lib/ai/usageLog";

// Opens a video-teacher session for a voice call: a short-lived Simli
// session token (and the ICE servers for the video connection) so the
// browser can show a talking face for the teacher's voice without ever
// seeing SIMLI_API_KEY. The face only renders the audio we send it; the
// learner's camera is never used.
//
// Not configured (no key, or no face for this voice): 404, and the call
// keeps the illustrated teacher. Each session is capped in length, and
// sessions per day are capped like the other AI features, so the per-minute
// bill can't run away.

const SIMLI_URL = "https://api.simli.ai";
const MAX_SESSION_SECONDS = 15 * 60;
const MAX_IDLE_SECONDS = 5 * 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { voice?: unknown };
  const voice = body.voice === "male" ? "male" : "female";
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = voice === "male" ? process.env.SIMLI_FACE_MALE : process.env.SIMLI_FACE_FEMALE;
  if (!apiKey || !faceId) return NextResponse.json({ error: "video teacher not configured" }, { status: 404 });

  const [premium, underLimit] = await Promise.all([
    isPremiumServer(supabase, user.id),
    underDailyAiLimit(supabase, user.id, "teacher_video"),
  ]);
  if (!premium) return NextResponse.json({ error: "premium required" }, { status: 403 });
  if (!underLimit) return NextResponse.json({ error: DAILY_LIMIT_ERROR }, { status: 429 });

  const headers = { "Content-Type": "application/json", "x-simli-api-key": apiKey };
  const [tokenRes, iceRes] = await Promise.all([
    fetch(`${SIMLI_URL}/compose/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        faceId,
        handleSilence: true,
        maxSessionLength: MAX_SESSION_SECONDS,
        maxIdleTime: MAX_IDLE_SECONDS,
        model: "fasttalk",
      }),
    }).catch(() => null),
    fetch(`${SIMLI_URL}/compose/ice`, { headers }).catch(() => null),
  ]);
  if (!tokenRes?.ok) return NextResponse.json({ error: "video teacher unavailable" }, { status: 502 });

  const { session_token: sessionToken } = (await tokenRes.json()) as { session_token?: string };
  if (!sessionToken) return NextResponse.json({ error: "video teacher unavailable" }, { status: 502 });
  const ice = iceRes?.ok ? ((await iceRes.json().catch(() => null)) as RTCIceServer[] | null) : null;
  const iceServers = ice && ice.length > 0 ? ice : [{ urls: ["stun:stun.l.google.com:19302"] }];

  await logAiUsage(supabase, user.id, "teacher_video", 0, 0).catch(() => undefined);
  return NextResponse.json({ sessionToken, iceServers });
}
