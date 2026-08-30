import { createClient } from "@/lib/supabase/serverClient";
import type { GrammarTopic, GrammarLesson } from "@/types/database";

export async function listGrammarTopics(): Promise<GrammarTopic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("grammar_topics")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}

export async function getGrammarTopicBySlug(slug: string): Promise<GrammarTopic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("grammar_topics")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function listGrammarLessons(topicId: string): Promise<GrammarLesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("grammar_lessons")
    .select("*")
    .eq("grammar_topic_id", topicId)
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}
