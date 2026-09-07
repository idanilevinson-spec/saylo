import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildSpeakingTestResponsePrompt } from "@/lib/ai/prompts/speakingTestResponse";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import type { CefrLevel } from "@/types/database";

interface SpeakingTestGradeResult {
  score: number;
  feedbackHe: string;
}

// Grades one open-ended speaking-test answer: the client already
// transcribed the spoken answer via Azure Speech (useSingleShotRecognition)
// and sends the plain transcript here — this route only does the AI
// grading, mirroring /api/ai/reading-response's shape exactly.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { questionEn, transcript } = (await request.json()) as { questionEn?: string; transcript?: string };
  if (!questionEn || !transcript?.trim()) {
    return NextResponse.json({ error: "missing questionEn or transcript" }, { status: 400 });
  }

  const { data: skillLevel } = await supabase
    .from("skill_levels")
    .select("cefr_level")
    .eq("profile_id", user.id)
    .eq("skill", "speaking")
    .maybeSingle();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: buildSpeakingTestResponsePrompt(
          questionEn,
          transcript,
          (skillLevel?.cefr_level as CefrLevel | undefined) ?? null
        ),
      },
    ],
  });
  const raw = extractText(message);

  const parsed = parseJsonResponse<SpeakingTestGradeResult>(raw) ?? {
    score: 0,
    feedbackHe: "אירעה שגיאה בניתוח התשובה של ה-AI. נסו שוב.",
  };
  const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)));

  await logAiUsage(supabase, user.id, "speaking_test_response", message.usage.input_tokens, message.usage.output_tokens);

  return NextResponse.json({ score, feedbackHe: parsed.feedbackHe ?? "" });
}
