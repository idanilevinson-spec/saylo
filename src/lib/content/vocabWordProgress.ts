import { supabase } from "@/lib/supabase/browserClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import { masteryTier } from "@/lib/games/learn";

// A vocabulary topic can be practised two ways: its exercises (counted from
// exercise_attempts) and, from the topic page, "learn the words" and the
// topic test, which record to srs_items instead. Without this, a learner
// who learned a topic's words in those games saw it as untouched in the
// course and in "all topics" (owner report, 2026-10-24).

export interface TopicWordProgress {
  words: number;
  // Words with any review at all.
  practised: number;
  // Words at the learn game's "mastered" tier (the same count it shows as
  // "X of Y words mastered").
  mastered: number;
}

export function summarizeWordProgress(
  words: { id: string; topic_id: string }[],
  reviews: { vocabulary_item_id: string; repetitions: number }[],
): Map<string, TopicWordProgress> {
  const repsByWord = new Map(reviews.map((r) => [r.vocabulary_item_id, r.repetitions]));
  const byTopic = new Map<string, TopicWordProgress>();
  for (const w of words) {
    const p = byTopic.get(w.topic_id) ?? { words: 0, practised: 0, mastered: 0 };
    p.words += 1;
    const reps = repsByWord.get(w.id);
    if (reps !== undefined) {
      p.practised += 1;
      if (masteryTier(reps) === "mastered") p.mastered += 1;
    }
    byTopic.set(w.topic_id, p);
  }
  return byTopic;
}

// Combines a topic's exercise status with its word progress: any practised
// word starts it, and every word mastered finishes it, whichever way the
// learner got there. Exercise mastery alone still finishes it too.
export function withWordProgress(
  status: "todo" | "started" | "done",
  words: TopicWordProgress | undefined,
): "todo" | "started" | "done" {
  if (status === "done" || !words || words.practised === 0) return status;
  return words.words > 0 && words.mastered >= words.words ? "done" : "started";
}

export async function loadTopicWordProgress(profileId: string): Promise<Map<string, TopicWordProgress>> {
  const [words, reviews] = await Promise.all([
    fetchAll((from, to) =>
      supabase.from("vocabulary_items").select("id, topic_id").eq("status", "published").order("id").range(from, to),
    ),
    fetchAll((from, to) =>
      supabase
        .from("srs_items")
        .select("vocabulary_item_id, repetitions")
        .eq("profile_id", profileId)
        .order("vocabulary_item_id")
        .range(from, to),
    ),
  ]);
  return summarizeWordProgress(words.data, reviews.data);
}
