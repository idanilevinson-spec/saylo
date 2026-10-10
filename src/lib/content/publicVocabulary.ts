import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import type { CefrLevel, VocabularyItem } from "@/types/database";

// The vocabulary topics as public, indexable pages (/english-vocabulary):
// the same published words the app teaches, with IPA, example and
// definition. Read with the admin client (a visitor has no session) and
// cached for an hour, like the grammar pages.

export interface PublicVocabTopic {
  slug: string;
  name_he: string;
  name_en: string;
  cefr_level: CefrLevel;
  sort_order: number;
  wordCount: number;
}

export const listPublicVocabulary = unstable_cache(
  async (): Promise<PublicVocabTopic[]> => {
    const [{ data: topics }, { data: words }] = await Promise.all([
      supabaseAdmin
        .from("topics")
        .select("id, slug, name_he, name_en, cefr_level, sort_order")
        .eq("status", "published")
        .order("sort_order"),
      fetchAll((from, to) =>
        supabaseAdmin.from("vocabulary_items").select("topic_id").eq("status", "published").order("id").range(from, to),
      ),
    ]);
    const count = new Map<string, number>();
    for (const w of words) count.set(w.topic_id, (count.get(w.topic_id) ?? 0) + 1);
    return (topics ?? [])
      .map((t) => ({
        slug: t.slug,
        name_he: t.name_he,
        name_en: t.name_en,
        cefr_level: t.cefr_level as CefrLevel,
        sort_order: t.sort_order,
        wordCount: count.get(t.id) ?? 0,
      }))
      .filter((t) => t.wordCount > 0);
  },
  ["public-vocabulary-list"],
  { revalidate: 3600 },
);

export const getPublicVocabulary = unstable_cache(
  async (slug: string): Promise<(PublicVocabTopic & { words: VocabularyItem[] }) | null> => {
    const { data: topic } = await supabaseAdmin
      .from("topics")
      .select("id, slug, name_he, name_en, cefr_level, sort_order")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!topic) return null;
    const { data: words } = await supabaseAdmin
      .from("vocabulary_items")
      .select("*")
      .eq("topic_id", topic.id)
      .eq("status", "published")
      .order("sort_order");
    if (!words?.length) return null;
    return {
      slug: topic.slug,
      name_he: topic.name_he,
      name_en: topic.name_en,
      cefr_level: topic.cefr_level as CefrLevel,
      sort_order: topic.sort_order,
      wordCount: words.length,
      words: words as VocabularyItem[],
    };
  },
  ["public-vocabulary-topic"],
  { revalidate: 3600 },
);
