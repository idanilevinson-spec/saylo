import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { CefrLevel } from "@/types/database";

// The grammar lessons as public, indexable pages (/english-grammar): the
// same published topics and lessons the app teaches, read with the admin
// client because a visitor has no session, and cached for an hour like the
// level catalog. Practice stays in the app; the page shows two items as a
// taste.

export interface PublicGrammarTopic {
  slug: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
  sort_order: number;
}

export interface PublicGrammarPage extends PublicGrammarTopic {
  lessons: { title_he: string; body_md: string }[];
  practiceCount: number;
  samples: { sentence: string; answer: string; hint: string | null }[];
}

export const listPublicGrammar = unstable_cache(
  async (): Promise<PublicGrammarTopic[]> => {
    const { data } = await supabaseAdmin
      .from("grammar_topics")
      .select("slug, name_he, name_en, cefr_level, sort_order")
      .eq("status", "published")
      .order("sort_order");
    return (data ?? []) as PublicGrammarTopic[];
  },
  ["public-grammar-list"],
  { revalidate: 3600 },
);

export const getPublicGrammar = unstable_cache(
  async (slug: string): Promise<PublicGrammarPage | null> => {
    const { data: topic } = await supabaseAdmin
      .from("grammar_topics")
      .select("id, slug, name_he, name_en, cefr_level, sort_order")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!topic) return null;
    const [{ data: lessons }, { data: exercises }] = await Promise.all([
      supabaseAdmin
        .from("grammar_lessons")
        .select("title_he, body_md")
        .eq("grammar_topic_id", topic.id)
        .eq("status", "published")
        .order("sort_order"),
      supabaseAdmin
        .from("exercises")
        .select("type, content")
        .eq("grammar_topic_id", topic.id)
        .eq("status", "published")
        .order("sort_order"),
    ]);
    const samples = (exercises ?? [])
      .filter((e) => e.type === "fill_blank")
      .slice(0, 2)
      .map((e) => {
        const c = e.content as { sentence: string; correctAnswer: string; hint?: string };
        return { sentence: c.sentence, answer: c.correctAnswer, hint: c.hint ?? null };
      });
    return {
      slug: topic.slug,
      name_he: topic.name_he,
      name_en: topic.name_en,
      cefr_level: topic.cefr_level as CefrLevel,
      sort_order: topic.sort_order,
      lessons: lessons ?? [],
      practiceCount: exercises?.length ?? 0,
      samples,
    };
  },
  ["public-grammar-topic"],
  { revalidate: 3600 },
);
