import { createClient } from "@/lib/supabase/serverClient";
import type { LearningPathNode, Topic, GrammarTopic } from "@/types/database";

export interface LearningPathEntry {
  node: LearningPathNode;
  href: string;
  title_he: string;
  title_en: string;
  icon: string;
}

// learning_path_nodes is polymorphic (node_type + ref_id), so this resolves
// each node against the right content table and merges the result — there's
// no FK to join on directly across two possible target tables.
export async function listLearningPath(): Promise<LearningPathEntry[]> {
  const supabase = await createClient();
  const { data: nodes } = await supabase
    .from("learning_path_nodes")
    .select("*")
    .order("sort_order");

  if (!nodes || nodes.length === 0) return [];

  const vocabIds = nodes.filter((n) => n.node_type === "vocabulary_topic").map((n) => n.ref_id);
  const grammarIds = nodes.filter((n) => n.node_type === "grammar_topic").map((n) => n.ref_id);

  const [{ data: vocabTopics }, { data: grammarTopics }] = await Promise.all([
    vocabIds.length
      ? supabase.from("topics").select("*").in("id", vocabIds)
      : Promise.resolve({ data: [] as Topic[] }),
    grammarIds.length
      ? supabase.from("grammar_topics").select("*").in("id", grammarIds)
      : Promise.resolve({ data: [] as GrammarTopic[] }),
  ]);

  const vocabById = new Map((vocabTopics ?? []).map((t) => [t.id, t]));
  const grammarById = new Map((grammarTopics ?? []).map((t) => [t.id, t]));

  return nodes.flatMap((node): LearningPathEntry[] => {
    if (node.node_type === "vocabulary_topic") {
      const topic = vocabById.get(node.ref_id);
      if (!topic) return [];
      return [
        {
          node,
          href: `/vocabulary/${topic.slug}`,
          title_he: topic.name_he,
          title_en: topic.name_en,
          icon: "📚",
        },
      ];
    }
    const topic = grammarById.get(node.ref_id);
    if (!topic) return [];
    return [
      {
        node,
        href: `/grammar/${topic.slug}`,
        title_he: topic.name_he,
        title_en: topic.name_en,
        icon: "✍️",
      },
    ];
  });
}
