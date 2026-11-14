import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildBagrutOralGradePrompt } from "@/lib/ai/prompts/bagrutOralGrade";
import { buildBagrutOralFixPrompt } from "@/lib/ai/prompts/bagrutOralReview";
import { mergeFixedNotes } from "@/lib/bagrut/oralReview";
import { keepPatternsFromTranscript, noteProblems, stripProblemSentences, verifyWords } from "@/lib/bagrut/oralVerify";
import { logAiUsage } from "@/lib/ai/usageLog";
import { reportAiParseFailure } from "@/lib/ai/reportParseFailure";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { isPaidServer, isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { parseOralFeedback, resolveSet } from "@/lib/bagrut/oralSets";
import { MAX_ANSWER_SECONDS, partBLengthDeduction, setGrade } from "@/lib/bagrut/oralRules";
import { ORAL_GRADE_FEATURE, ORAL_LIMIT_ERROR, ORAL_REVIEW_FEATURE, oralGradeAllowed, oralSimulationAvailable } from "@/lib/bagrut/oralAllowance";

const MAX_TRANSCRIPT_CHARS = 4000;
const MAX_TOPIC_CHARS = 120;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function readUsage(supabase: ServerClient, userId: string): Promise<{ usedLast24h: number; usedEver: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ count: usedLast24h }, { count: usedEver }] = await Promise.all([
    supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("feature", ORAL_GRADE_FEATURE)
      .gte("created_at", since),
    supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("feature", ORAL_GRADE_FEATURE),
  ]);
  return { usedLast24h: usedLast24h ?? 0, usedEver: usedEver ?? 0 };
}

// Before the intro's start button: is there room for a whole simulation?
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [premium, paid] = await Promise.all([isPremiumServer(supabase, user.id), isPaidServer(supabase, user.id)]);
  if (!premium) return NextResponse.json({ error: "premium required" }, { status: 403 });
  const usage = await readUsage(supabase, user.id);
  return NextResponse.json({ available: oralSimulationAvailable({ paid, ...usage }), trial: !paid });
}

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

  const usage = await readUsage(supabase, user.id);
  if (!oralGradeAllowed({ paid, ...usage })) {
    return NextResponse.json({ error: ORAL_LIMIT_ERROR, trial: !paid }, { status: 429 });
  }

  let message;
  try {
    message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      // Thinking off: it would eat into max_tokens before the JSON is written.
      // (This model takes no temperature; steadiness comes from the prompt.)
      max_tokens: 2000,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: buildBagrutOralGradePrompt(set, transcript, seconds, projectTopic) }],
    });
  } catch (err) {
    console.error("bagrut-oral-grade: AI call failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "grading failed" }, { status: 502 });
  }
  await logAiUsage(supabase, user.id, ORAL_GRADE_FEATURE, message.usage.input_tokens, message.usage.output_tokens);

  const raw = extractText(message);
  const draft = parseOralFeedback(parseJsonResponse<unknown>(raw), set.questions.length);
  if (!draft) {
    // Development only: production logs never carry a learner's answer.
    if (process.env.NODE_ENV === "development") console.warn("bagrut-oral-grade: unusable AI reply", raw.slice(0, 1500));
    await reportAiParseFailure("bagrut-oral-grade", raw);
    return NextResponse.json({ error: "grading failed" }, { status: 502 });
  }

  // Word claims and patterns are made true by code; notes that break the
  // rules (English only as quotes from the answer, no repetition claims) go
  // to one targeted rewrite, and whatever still breaks them is cut.
  let feedback = keepPatternsFromTranscript(verifyWords(draft, transcript), transcript);
  const problems = noteProblems(feedback, transcript);
  const keys = Object.keys(problems) as (keyof typeof problems)[];
  if (keys.length) {
    try {
      const fix = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1200,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: buildBagrutOralFixPrompt(transcript, feedback.notesHe, problems) }],
      });
      await logAiUsage(supabase, user.id, ORAL_REVIEW_FEATURE, fix.usage.input_tokens, fix.usage.output_tokens);
      feedback = mergeFixedNotes(feedback, parseJsonResponse<unknown>(extractText(fix)), keys);
    } catch (err) {
      console.error("bagrut-oral-grade: note fix failed", err instanceof Error ? err.message : err);
    }
  }
  feedback = stripProblemSentences(feedback, transcript);

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
