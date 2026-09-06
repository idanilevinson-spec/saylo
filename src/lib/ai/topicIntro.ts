import "server-only";
import type { createClient } from "@/lib/supabase/serverClient";
import type { CefrLevel } from "@/types/database";
import { anthropic, CLAUDE_MODEL, extractText } from "@/lib/ai/claudeClient";
import { buildVocabularyTopicIntroPrompt } from "@/lib/ai/prompts/vocabularyTopicIntro";
import { logAiUsage } from "@/lib/ai/usageLog";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface VocabularyTopicIntroInput {
  id: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
}

// Shared, not per-user: the explanation is the same for every learner
// studying this topic, so it's cached once in topic_intro_cache and served
// to everyone after the first generation. Fails open (returns null, doesn't
// cache) on any error — a missing intro must never break the topic page.
export async function getVocabularyTopicIntro(
  supabase: SupabaseClient,
  topic: VocabularyTopicIntroInput,
  sampleItems: { headword: string; translation_he: string }[]
): Promise<string | null> {
  const { data: cached } = await supabase
    .from("topic_intro_cache")
    .select("intro_he")
    .eq("topic_id", topic.id)
    .maybeSingle();

  if (cached) return cached.intro_he;
  if (sampleItems.length === 0) return null;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: buildVocabularyTopicIntroPrompt({
            nameHe: topic.name_he,
            nameEn: topic.name_en,
            cefrLevel: topic.cefr_level,
            sampleWords: sampleItems.map((i) => ({ headword: i.headword, translationHe: i.translation_he })),
          }),
        },
      ],
    });
    const introHe = extractText(message).trim();
    if (!introHe) return null;

    await supabase.from("topic_intro_cache").upsert({ topic_id: topic.id, intro_he: introHe }, { onConflict: "topic_id" });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await logAiUsage(supabase, user.id, "vocabulary_topic_intro", message.usage.input_tokens, message.usage.output_tokens);
    }

    return introHe;
  } catch {
    return null;
  }
}
