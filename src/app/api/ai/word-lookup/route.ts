import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } from "@/lib/ai/claudeClient";
import {
  LOOKUP_WORD,
  buildWordLookupPrompt,
  cleanWordMeaning,
  normalizeTappedWord,
  type WordLookupResult,
  type WordMeaning,
} from "@/lib/ai/prompts/wordLookup";
import { logAiUsage } from "@/lib/ai/usageLog";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { hasParentalClearance } from "@/lib/auth/consentServer";
import { AI_CONSENT_REQUIRED_ERROR, hasAiConsent } from "@/lib/ai/consent";

// Tap a word in the teacher's message, see what it means. A word that is
// in Saylo's own vocabulary comes straight from there (instant, written
// by a person) and can be added to the learner's reviews; any other word
// is explained in the context of its sentence by the model, and still
// offered for review if its base form is in the catalog.

// The same word in the same sentence always means the same thing.
const aiCache = new Map<string, WordMeaning | null>();

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasAiConsent(user)) {
    return NextResponse.json({ error: AI_CONSENT_REQUIRED_ERROR }, { status: 403 });
  }
  const [paid, cleared] = await Promise.all([isPaidServer(supabase, user.id), hasParentalClearance(supabase, user.id)]);
  if (!paid) return NextResponse.json({ error: "premium required" }, { status: 403 });
  if (!cleared) return NextResponse.json({ error: "parental consent required" }, { status: 403 });

  const { word, sentence } = (await request.json()) as { word?: string; sentence?: string };
  if (!word || !LOOKUP_WORD.test(word) || !sentence || sentence.length > 600) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const findInCatalog = async (headword: string) => {
    const { data } = await supabase
      .from("vocabulary_items")
      .select("id, headword, translation_he, part_of_speech")
      .eq("status", "published")
      .ilike("headword", headword.replace(/[%_\\]/g, ""))
      .limit(1)
      .maybeSingle();
    return data;
  };

  const tapped = normalizeTappedWord(word);
  let catalog = await findInCatalog(tapped);
  let meaning: WordMeaning | null = null;

  if (!catalog) {
    const key = `${tapped}|${sentence}`;
    if (aiCache.has(key)) {
      meaning = aiCache.get(key) ?? null;
    } else {
      const claudeMessage = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 120,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: buildWordLookupPrompt(word, sentence) }],
      });
      meaning = cleanWordMeaning(parseJsonResponse(extractText(claudeMessage)));
      aiCache.set(key, meaning);
      if (aiCache.size > 3000) aiCache.delete(aiCache.keys().next().value as string);
      await logAiUsage(supabase, user.id, "word_lookup", claudeMessage.usage.input_tokens, claudeMessage.usage.output_tokens);
    }
    if (!meaning) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (meaning.lemma !== tapped) catalog = await findInCatalog(meaning.lemma);
  }

  let inMyWords = false;
  if (catalog) {
    const { data: srs } = await supabase
      .from("srs_items")
      .select("id")
      .eq("profile_id", user.id)
      .eq("vocabulary_item_id", catalog.id)
      .maybeSingle();
    inMyWords = !!srs;
  }

  const result: WordLookupResult = {
    word,
    // The model's reading wins for the meaning (it saw the sentence); the
    // catalog's for a word it found directly.
    headword: meaning?.lemma ?? catalog!.headword,
    translationHe: meaning?.he ?? catalog!.translation_he,
    partOfSpeech: meaning?.pos ?? catalog?.part_of_speech ?? null,
    vocabularyItemId: catalog?.id ?? null,
    inMyWords,
  };
  return NextResponse.json(result);
}
