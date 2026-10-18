import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { shuffle } from "@/lib/utils/shuffle";
import type { WordMeaning } from "@/lib/ai/prompts/wordLookup";

// Words learners looked up that the curated catalog doesn't have. They are
// stored once, shared by everyone, with a review question, so "add to my
// words" works for any word. Kept out of every public list: status
// 'draft' + learner_added, under the hidden "learner-words" topic (seed
// 051). Written with the service role because learners can't write
// content; nothing here trusts the browser, the meaning comes from the
// server's own lookup.

const TOPIC_SLUG = "learner-words";
let topicId: string | null = null;

async function learnerTopicId(): Promise<string | null> {
  if (topicId) return topicId;
  const { data } = await supabaseAdmin.from("topics").select("id").eq("slug", TOPIC_SLUG).maybeSingle();
  topicId = data?.id ?? null;
  return topicId;
}

const exact = (headword: string) => headword.replace(/[%_\\]/g, "");

export async function findLearnerWord(headword: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("vocabulary_items")
    .select("id")
    .eq("learner_added", true)
    .ilike("headword", exact(headword))
    .limit(1)
    .maybeSingle();
  // Before seed 051 the column doesn't exist: just no learner words yet.
  if (error) return null;
  return data?.id ?? null;
}

// Stores the word and its review question under the given id (made up
// front, so the lookup can answer before this write finishes); returns the
// id, or null if it can't be stored (seed 051 not run, or a failed write).
export async function saveLearnerWord(meaning: WordMeaning, sentence: string, id: string): Promise<string | null> {
  const topic = await learnerTopicId();
  if (!topic) return null;

  const { data: item, error } = await supabaseAdmin
    .from("vocabulary_items")
    .insert({
      id,
      topic_id: topic,
      headword: meaning.lemma,
      part_of_speech: meaning.pos,
      translation_he: meaning.he,
      example_en: sentence.slice(0, 300),
      cefr_level: meaning.level,
      status: "draft",
      learner_added: true,
    })
    .select("id")
    .single();
  // Another learner saved the same word a moment ago: use theirs.
  if (error) return error.code === "23505" ? findLearnerWord(meaning.lemma) : null;

  const options = shuffle([meaning.lemma, ...meaning.distractors]);
  const { error: exerciseError } = await supabaseAdmin.from("exercises").insert({
    type: "mcq",
    skill_area: "vocabulary",
    topic_id: topic,
    vocabulary_item_id: item.id,
    cefr_level: meaning.level,
    content: {
      prompt: `מה המילה באנגלית עבור "${meaning.he}"?`,
      options,
      correctIndex: options.indexOf(meaning.lemma),
    },
    status: "draft",
    learner_added: true,
  });
  if (exerciseError) {
    // A word without its question can't be reviewed; don't leave it behind.
    await supabaseAdmin.from("vocabulary_items").delete().eq("id", item.id);
    return null;
  }
  return item.id;
}
