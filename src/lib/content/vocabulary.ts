import { createClient } from "@/lib/supabase/serverClient";
import type { Topic, VocabularyItem } from "@/types/database";

export async function listVocabularyTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}

export async function getVocabularyTopicBySlug(slug: string): Promise<Topic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function listVocabularyItems(topicId: string): Promise<VocabularyItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary_items")
    .select("*")
    .eq("topic_id", topicId)
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}

export interface VocabularyLookupEntry {
  translation_he: string;
  ipa: string | null;
}

// headword -> translation/IPA, for the reading page's click-a-word lookup.
// Only ~60 words today, so fetching the whole published set is simpler and
// cheaper than a query per click.
export async function getVocabularyLookupMap(): Promise<Record<string, VocabularyLookupEntry>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary_items")
    .select("headword, translation_he, ipa")
    .eq("status", "published");

  const map: Record<string, VocabularyLookupEntry> = {};
  for (const item of data ?? []) {
    map[item.headword.toLowerCase()] = { translation_he: item.translation_he, ipa: item.ipa };
  }
  return map;
}
