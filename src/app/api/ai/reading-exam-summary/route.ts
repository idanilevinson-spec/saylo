import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import {
  buildReadingExamSummaryPrompt,
  type McqResultSummary,
  type OpenResultSummary,
} from "@/lib/ai/prompts/readingExamSummary";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPremiumServer } from "@/lib/subscriptions/requirePremium";
import type { CefrLevel } from "@/types/database";

interface ExamSummaryResult {
  summaryHe: string;
}

// Same premium gate as /api/ai/reading-response — this is a second AI call
// per exam completion (on top of the open-question grading), so it rides
// the same boundary rather than opening a free-tier AI cost the other
// route deliberately doesn't have.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPremiumServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { mcqResults, openResults } = (await request.json()) as {
    mcqResults?: McqResultSummary[];
    openResults?: OpenResultSummary[];
  };
  if (!Array.isArray(mcqResults) || !Array.isArray(openResults)) {
    return NextResponse.json({ error: "missing mcqResults or openResults" }, { status: 400 });
  }

  const { data: skillLevel } = await supabase
    .from("skill_levels")
    .select("cefr_level")
    .eq("profile_id", user.id)
    .eq("skill", "reading")
    .maybeSingle();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: buildReadingExamSummaryPrompt(
          mcqResults,
          openResults,
          (skillLevel?.cefr_level as CefrLevel | undefined) ?? null
        ),
      },
    ],
  });
  const raw = extractText(message);

  const parsed = parseJsonResponse<ExamSummaryResult>(raw) ?? {
    summaryHe: "כל הכבוד על סיום המבחן! המשיכו לתרגל קריאה בקצב קבוע.",
  };

  await logAiUsage(supabase, user.id, "reading_exam_summary", message.usage.input_tokens, message.usage.output_tokens);

  return NextResponse.json({ summaryHe: parsed.summaryHe ?? "" });
}
