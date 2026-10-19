"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import { Check, Mic, Plus } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import SpeakButton from "@/components/SpeakButton";
import PronunciationRecorder from "@/components/PronunciationRecorder";
import type { UsefulPhrase } from "@/lib/ai/prompts/usefulPhrases";

// On the conversation summary: the words and expressions worth taking
// from this conversation, with their meaning and the sentence they came
// from, and one button that puts them all into the learner's reviews.
export default function ConversationPhrases({ conversationId, phrases }: { conversationId: string; phrases: UsefulPhrase[] }) {
  const [state, setState] = useState<"idle" | "adding" | "added" | "failed">("idle");
  const { profile } = useAuth();

  // Coming back to a summary: if every phrase is already in their reviews,
  // say so instead of offering to add them again.
  useEffect(() => {
    if (!profile || !phrases.length) return;
    supabase
      .from("srs_items")
      .select("vocabulary_items!inner(headword)")
      .eq("profile_id", profile.id)
      .in(
        "vocabulary_items.headword",
        phrases.map((p) => p.lemma),
      )
      .then(({ data }) => {
        const have = new Set(
          ((data ?? []) as unknown as { vocabulary_items: { headword: string } }[]).map((r) =>
            r.vocabulary_items.headword.toLowerCase(),
          ),
        );
        if (phrases.every((p) => have.has(p.lemma))) setState((s) => (s === "idle" ? "added" : s));
      });
  }, [profile, phrases]);
  // The one phrase whose sentence is being practised out loud.
  const [aloud, setAloud] = useState<string | null>(null);

  if (!phrases.length) return null;

  async function addAll() {
    setState("adding");
    try {
      const res = await fetch("/api/ai/conversation-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      setState(res.ok ? "added" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <section aria-labelledby="phrases-title" className="mt-6">
      <h2 id="phrases-title" className="font-bold">
        ביטויים ששווה לקחת מהשיחה
      </h2>
      <ul className="mt-3 divide-y divide-card-border rounded-lg border border-card-border bg-card">
        {phrases.map((p) => (
          <li key={p.lemma} className="px-4 py-3">
            <div dir="ltr" className="flex items-center justify-end gap-2">
              <EnglishText className="font-bold">{p.lemma}</EnglishText>
              <SpeakButton text={p.lemma} className="p-1" />
            </div>
            <p className="mt-0.5 font-medium">{p.he}</p>
            <div dir="ltr" className="mt-1 flex items-start justify-end gap-2">
              <EnglishText as="p" className="text-sm text-muted">
                {p.example}
              </EnglishText>
              <SpeakButton text={p.example} className="mt-0.5 p-1 -m-1" />
            </div>
            {aloud === p.lemma ? (
              <div className="mt-2">
                <PronunciationRecorder targetPhrase={p.example} hidePhrase />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAloud(p.lemma)}
                className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Mic size={14} aria-hidden="true" /> לומר את המשפט בקול
              </button>
            )}
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="mt-3">
        {state === "added" ? (
          <p className="flex items-center gap-1.5 text-sm font-bold text-success">
            <Check size={15} aria-hidden="true" /> נוספו לחזרות שלכם. הן יחכו לכם בחזרה הבאה.
          </p>
        ) : (
          <button
            type="button"
            onClick={addAll}
            disabled={state === "adding"}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            <Plus size={15} aria-hidden="true" />
            {state === "adding" ? "מוסיפים..." : "הוספת כולם לחזרות שלי"}
          </button>
        )}
        {state === "failed" && <p className="mt-2 text-sm text-danger">לא הצלחנו להוסיף כרגע. נסו שוב.</p>}
      </div>
    </section>
  );
}
