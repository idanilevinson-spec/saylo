import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildWritingCoachPrompt } from "@/lib/ai/prompts/writingCoach";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { setSkillLevelFromScore } from "@/lib/assessment/skillLevel";

interface WritingCoachResult {
  overallScore: number;
  feedbackHe: string;
  improvedVersion: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { writingPromptId, submittedText } = (await request.json()) as {
    writingPromptId?: string;
    submittedText?: string;
  };
  if (!writingPromptId || !submittedText?.trim()) {
    return NextResponse.json({ error: "missing writingPromptId or submittedText" }, { status: 400 });
  }

  const { data: prompt } = await supabase
    .from("writing_prompts")
    .select("*")
    .eq("id", writingPromptId)
    .maybeSingle();
  if (!prompt) return NextResponse.json({ error: "prompt not found" }, { status: 404 });

  const { data: submission, error: submissionError } = await supabase
    .from("writing_submissions")
    .insert({ profile_id: user.id, writing_prompt_id: writingPromptId, submitted_text: submittedText })
    .select()
    .single();
  if (submissionError?.message.includes("daily_writing_limit_reached")) {
    return NextResponse.json({ error: "daily limit reached" }, { status: 429 });
  }
  if (submissionError || !submission) {
    return NextResponse.json({ error: "failed to save submission" }, { status: 500 });
  }

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 700,
    messages: [{ role: "user", content: buildWritingCoachPrompt(prompt.prompt_en, submittedText) }],
  });
  const raw = extractText(message);

  let parsed: WritingCoachResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      overallScore: 0,
      feedbackHe: "אירעה שגיאה בניתוח התשובה של ה-AI. נסו לשלוח שוב.",
      improvedVersion: submittedText,
    };
  }

  const { data: feedback } = await supabase
    .from("writing_feedback")
    .insert({
      submission_id: submission.id,
      overall_score: Math.max(0, Math.min(100, parsed.overallScore ?? 0)),
      feedback_he: parsed.feedbackHe ?? "",
      improved_version: parsed.improvedVersion ?? submittedText,
    })
    .select()
    .single();

  await logAiUsage(supabase, user.id, "writing_coach", message.usage.input_tokens, message.usage.output_tokens);
  await setSkillLevelFromScore(supabase, user.id, "writing", parsed.overallScore ?? 0);

  return NextResponse.json({ submission, feedback });
}
