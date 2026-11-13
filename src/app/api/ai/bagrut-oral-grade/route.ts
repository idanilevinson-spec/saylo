import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildBagrutOralGradePrompt } from "@/lib/ai/prompts/bagrutOralGrade";
import { logAiUsage } from "@/lib/ai/usageLog";
import { reportAiParseFailure } from "@/lib/ai/reportParseFailure";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { isPaidServer, isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { parseOralFeedback, resolveSet } from "@/lib/bagrut/oralSets";
import { MAX_ANSWER_SECONDS, partBLengthDeduction, setGrade } from "@/lib/bagrut/oralRules";
import { ORAL_GRADE_FEATURE, ORAL_LIMIT_ERROR, oralGradeAllowed } from "@/lib/bagrut/oralAllowance";

const MAX_TRANSCRIPT_CHARS = 4000;
const MAX_TOPIC_CHARS = 120;

// Grades one question set of the oral Bagrut simulation
// (docs/specs/bagrut-oral.md). The browser sends only the set id, the
// transcript, its length in seconds and (Part B) the project's topic; the
// questions come from the bank, the rubric arithmetic from oralRules.ts.
// Nothing is stored except the usage row every AI call writes.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });

  let body: { setId?: unknown; transcript?: unknown; seconds?: unknown; projectTopic?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const set = typeof body.setId === "string" ? resolveSet(body.setId) : null;
  const transcript = typeof body.transcript === "string" ? body.transcript.trim().slice(0, MAX_TRANSCRIPT_CHARS) : "";
  const seconds =
    typeof body.seconds === "number" && Number.isFinite(body.seconds)
      ? Math.round(Math.min(MAX_ANSWER_SECONDS, Math.max(0, body.seconds)))
      : null;
  if (!set || !transcript || seconds === null) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const projectTopic =
    set.part === "B" && typeof body.projectTopic === "string" && body.projectTopic.trim()
      ? body.projectTopic.trim().slice(0, MAX_TOPIC_CHARS)
      : null;

  const [premium, paid] = await Promise.all([isPremiumServer(supabase, user.id), isPaidServer(supabase, user.id)]);
  if (!premium) return NextResponse.json({ error: "premium required" }, { status: 403 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ count: usedLast24h }, { count: usedEver }] = await Promise.all([
    supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("feature", ORAL_GRADE_FEATURE)
      .gte("created_at", since),
    supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("feature", ORAL_GRADE_FEATURE),
  ]);
  if (!oralGradeAllowed({ paid, usedLast24h: usedLast24h ?? 0, usedEver: usedEver ?? 0 })) {
    return NextResponse.json({ error: ORAL_LIMIT_ERROR, trial: !paid }, { status: 429 });
  }

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    // Thinking off: it would eat into max_tokens before the JSON is written.
    max_tokens: 2000,
    thinking: { type: "disabled" },
    messages: [{ role: "user", content: buildBagrutOralGradePrompt(set, transcript, seconds, projectTopic) }],
  });
  await logAiUsage(supabase, user.id, ORAL_GRADE_FEATURE, message.usage.input_tokens, message.usage.output_tokens);

  const raw = extractText(message);
  const feedback = parseOralFeedback(parseJsonResponse<unknown>(raw), set.questions.length);
  if (!feedback) {
    // Development only: production logs never carry a learner's answer.
    if (process.env.NODE_ENV === "development") console.warn("bagrut-oral-grade: unusable AI reply", raw.slice(0, 1500));
    await reportAiParseFailure("bagrut-oral-grade", raw);
    return NextResponse.json({ error: "grading failed" }, { status: 502 });
  }

  const grade = setGrade(
    Object.entries(feedback.scores).map(([key, score]) => ({ key: key as keyof typeof feedback.scores, score })),
    { part: set.part, seconds, recordings: 1 },
  );
  return NextResponse.json({
    part: set.part,
    grade,
    lengthDeduction: set.part === "B" ? partBLengthDeduction(seconds) : 0,
    feedback,
  });
}
