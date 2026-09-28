import { supabase } from "@/lib/supabase/browserClient";
import type { Exercise } from "@/types/database";

export interface DueMistakeItem {
  itemType: "grammar_topic";
  itemRef: string;
  topicNameHe: string;
  exercise: Exercise;
  dueAt: string;
}

// Only 'grammar_topic' for now — 'pattern' joins once a Pattern Coach
// drill is actually reviewed/disclosed (docs/specs/mistake-notebook.md
// §4, §7.3). No "new" backfill the way vocabulary SRS does: a topic is
// only ever in here because it was gotten wrong at least once, so there's
// nothing sensible to pad the queue with.
export async function getDueMistakeItems(profileId: string, limit = 20): Promise<DueMistakeItem[]> {
  const nowIso = new Date().toISOString();

  const { data: due } = await supabase
    .from("mistake_review_items")
    .select("item_ref, due_at")
    .eq("profile_id", profileId)
    .eq("item_type", "grammar_topic")
    .lte("due_at", nowIso)
    .order("due_at")
    .limit(limit);

  if (!due || due.length === 0) return [];

  const topicIds = [...new Set(due.map((d) => d.item_ref))];
  const [{ data: topics }, { data: exercises }] = await Promise.all([
    supabase.from("grammar_topics").select("id, name_he").in("id", topicIds),
    supabase.from("exercises").select("*").eq("status", "published").in("grammar_topic_id", topicIds),
  ]);

  const topicNameById = new Map((topics ?? []).map((t) => [t.id, t.name_he]));
  // One exercise per topic — the first published one found is enough for a
  // quick review item, not a full lesson.
  const exerciseByTopic = new Map<string, Exercise>();
  for (const exercise of exercises ?? []) {
    if (exercise.grammar_topic_id && !exerciseByTopic.has(exercise.grammar_topic_id)) {
      exerciseByTopic.set(exercise.grammar_topic_id, exercise);
    }
  }

  return due
    .map((d): DueMistakeItem | null => {
      const exercise = exerciseByTopic.get(d.item_ref);
      const topicNameHe = topicNameById.get(d.item_ref);
      if (!exercise || !topicNameHe) return null;
      return { itemType: "grammar_topic", itemRef: d.item_ref, topicNameHe, exercise, dueAt: d.due_at };
    })
    .filter((x): x is DueMistakeItem => x !== null);
}
