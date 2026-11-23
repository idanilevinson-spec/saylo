import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import { buildBagrutWritingCheckPrompt } from "@/lib/ai/prompts/bagrutWritingCheck";
import { logAiUsage } from "@/lib/ai/usageLog";
import { reportAiParseFailure } from "@/lib/ai/reportParseFailure";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";
import { isPaidServer, isPremiumServer } from "@/lib/subscriptions/requirePremium";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnit } from "@/lib/content/bagrut/sampleUnits";
import { countWords, gradeWriting, minWordsToCheck, writingRulesFor } from "@/lib/bagrut/writingRules";
import { escapeBreaksInStrings, parseWritingFeedback, verifyWritingFeedback } from "@/lib/bagrut/writingFeedback";
import { WRITING_CHECK_FEATURE, WRITING_LIMIT_ERROR, WRITING_RETRY_FEATURE, writingCheckAllowed } from "@/lib/bagrut/writingAllowance";

// Far above any task's range (the longest asks for 140 words); a pasted
// book chapter is cut here rather than paid for.
const MAX_TEXT_CHARS = 3000;

// Checks one Bagrut writing task against the Ministry's public writing
// rubric (docs/specs/bagrut-writing-check.md). The browser sends only which
// set it is and the learner's text; the task itself is read from our own
// content, so a request can't swap in its own "task" (or instructions) for
// the AI. Nothing is stored except the usage row every AI call writes.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });

  let body: { moduleCode?: unknown; unitSlug?: unknown; text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const moduleCode =
    typeof body.moduleCode === "string" && body.moduleCode in BAGRUT_MODULE_FORMATS ? (body.moduleCode as BagrutModuleCode) : null;
  const unit = moduleCode && typeof body.unitSlug === "string" ? getPublishableSampleUnit(moduleCode, body.unitSlug) : null;
  const rules = moduleCode ? writingRulesFor(moduleCode) : null;
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT_CHARS) : "";
  if (!moduleCode || !unit?.writingTask || !rules || !text) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const words = countWords(text);
  // Below this the rubric's answer is zero for the whole task; the page
  // says so itself and never sends the text.
  if (words < minWordsToCheck(moduleCode)) return NextResponse.json({ error: "too short" }, { status: 400 });

  const [premium, paid] = await Promise.all([isPremiumServer(supabase, user.id), isPaidServer(supabase, user.id)]);
  if (!premium) return NextResponse.json({ error: "premium required" }, { status: 403 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const usage = () => supabase.from("ai_usage_log").select("id", { count: "exact", head: true }).eq("profile_id", user.id).eq("feature", WRITING_CHECK_FEATURE);
  const [{ count: usedLast24h }, { count: usedEver }] = await Promise.all([usage().gte("created_at", since), usage()]);
  if (!writingCheckAllowed({ paid, usedLast24h: usedLast24h ?? 0, usedEver: usedEver ?? 0 })) {
    return NextResponse.json({ error: WRITING_LIMIT_ERROR, trial: !paid }, { status: 429 });
  }

  const prompt = buildBagrutWritingCheckPrompt({
    rubric: rules.rubric,
    taskEn: unit.writingTask.promptEn,
    wordRange: unit.writingTask.wordCountRange,
    text,
    words,
  });
  const ask = () =>
    anthropic.messages.create({
      model: CLAUDE_MODEL,
      // Thinking off: it would eat into max_tokens before the JSON is written.
      max_tokens: 2000,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
    });
  const read = (raw: string) =>
    parseWritingFeedback(parseJsonResponse<unknown>(raw) ?? parseJsonResponse<unknown>(escapeBreaksInStrings(raw)));

  let message;
  try {
    message = await ask();
  } catch (err) {
    console.error("bagrut-writing-check: AI call failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "check failed" }, { status: 502 });
  }
  await logAiUsage(supabase, user.id, WRITING_CHECK_FEATURE, message.usage.input_tokens, message.usage.output_tokens);

  let raw = extractText(message);
  let draft = read(raw);
  if (!draft) {
    // One more try, so a reply the code can't read doesn't cost the learner
    // a check. Logged for cost under its own name, never counted.
    try {
      const again = await ask();
      await logAiUsage(supabase, user.id, WRITING_RETRY_FEATURE, again.usage.input_tokens, again.usage.output_tokens);
      await reportAiParseFailure("bagrut-writing-check (retried)", raw);
      raw = extractText(again);
      draft = read(raw);
    } catch (err) {
      console.error("bagrut-writing-check: retry failed", err instanceof Error ? err.message : err);
    }
  }
  if (!draft) {
    // Development only: production logs never carry a learner's text.
    if (process.env.NODE_ENV === "development") console.warn("bagrut-writing-check: unusable AI reply", raw.slice(0, 1500));
    await reportAiParseFailure("bagrut-writing-check", raw);
    return NextResponse.json({ error: "check failed" }, { status: 502 });
  }

  // Corrections and quotes are made true by code, against the text itself.
  const feedback = verifyWritingFeedback(draft, text);
  const grade = gradeWriting(moduleCode, feedback.scores, words, { zero: feedback.zero });
  return NextResponse.json({
    grade,
    words,
    zero: feedback.zero,
    notesHe: feedback.notesHe,
    fixes: feedback.fixes,
    improved: feedback.improved,
  });
}
