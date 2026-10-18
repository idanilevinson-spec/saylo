import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { isPaidServer } from "@/lib/subscriptions/requirePremium";
import { findLearnerWord, saveLearnerWord } from "@/lib/vocabulary/learnerWords";
import type { ConversationFeedback } from "@/types/database";

// "Add all to my reviews" on a conversation summary. The phrases come from
// the summary this server saved for the learner's own conversation, never
// from the request, so nothing the browser sends ends up in the shared
// vocabulary. Each phrase is matched to the curated catalog or to words
// learners already added, stored if it's new, then put in the learner's
// reviews (keeping progress on any they already had).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPaidServer(supabase, user.id))) {
    return NextResponse.json({ error: "premium required" }, { status: 403 });
  }

  const { conversationId } = (await request.json()) as { conversationId?: string };
  if (!conversationId) return NextResponse.json({ error: "missing conversationId" }, { status: 400 });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: score } = await supabase
    .from("conversation_scores")
    .select("feedback")
    .eq("conversation_id", conversationId)
    .maybeSingle();
  const phrases = (score?.feedback as ConversationFeedback | undefined)?.usefulPhrases ?? [];
  if (!phrases.length) return NextResponse.json({ added: [] });

  const ids = await Promise.all(
    phrases.map(async (p) => {
      const { data: curated } = await supabase
        .from("vocabulary_items")
        .select("id")
        .eq("status", "published")
        .ilike("headword", p.lemma.replace(/[%_\\]/g, ""))
        .limit(1)
        .maybeSingle();
      if (curated) return curated.id as string;
      return (await findLearnerWord(p.lemma)) ?? (await saveLearnerWord(p, p.example, crypto.randomUUID()));
    }),
  );

  const added = phrases.flatMap((p, i) => (ids[i] ? [{ headword: p.lemma, vocabularyItemId: ids[i] as string }] : []));
  if (!added.length) return NextResponse.json({ error: "could not add" }, { status: 500 });

  const { error } = await supabase.from("srs_items").upsert(
    added.map((a) => ({ profile_id: user.id, vocabulary_item_id: a.vocabularyItemId })),
    { onConflict: "profile_id,vocabulary_item_id", ignoreDuplicates: true },
  );
  if (error) return NextResponse.json({ error: "could not add" }, { status: 500 });

  return NextResponse.json({ added });
}
