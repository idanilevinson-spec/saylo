"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NotebookPen, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { updateSrsForVocabularyItem } from "@/lib/srs/queue";
import { touchMistakeReviewItem } from "@/lib/mistakes/mistakeReview";
import { carryoverTargets, clearTrialMistakes, readTrialMistakes, type TrialExerciseRow } from "@/lib/trial/carryover";

// The first dashboard visit after a trial lesson (/try) on this device:
// the trial's mistakes go into the mistake notebook, once, and a short note
// says so. Renders nothing at all when there is nothing to carry over.
export default function TrialCarryover() {
  const { profile } = useAuth();
  const started = useRef(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const profileId = profile?.id;
    if (!profileId || started.current) return;
    const ids = readTrialMistakes();
    if (!ids) return;
    started.current = true;

    (async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, type, vocabulary_item_id, grammar_topic_id")
        .in("id", ids);
      // A failed read keeps the ids for the next visit.
      if (error || !data) return;
      const { vocabularyItemIds, grammarTopicIds } = carryoverTargets(data as TrialExerciseRow[]);
      const results = await Promise.allSettled([
        ...vocabularyItemIds.map((v) => updateSrsForVocabularyItem(profileId, v, false)),
        ...grammarTopicIds.map((g) => touchMistakeReviewItem(profileId, "grammar_topic", g, false)),
      ]);
      clearTrialMistakes();
      const saved = results.filter((r) => r.status === "fulfilled").length;
      if (saved > 0) setCount(saved);
    })().catch(() => undefined);
  }, [profile?.id]);

  if (count === 0) return null;

  return (
    <p role="status" className="mt-4 flex items-start gap-3 rounded-lg border border-card-border bg-card px-4 py-3 text-sm">
      <NotebookPen size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-hover" />
      <span className="flex-1 leading-relaxed">
        {/* A wrong answer comes back the next day (sm2), so the items are
            not due yet today: say "tomorrow", never "already waiting". */}
        מה שטעיתם בו בשיעור הניסיון נשמר ב
        <Link href="/mistakes" className="font-bold text-primary-hover underline underline-offset-2">
          מחברת הטעויות
        </Link>
        , ויחזור אליכם לחזרה מחר.
      </span>
      <button
        type="button"
        onClick={() => setCount(0)}
        aria-label="סגירת ההודעה"
        className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </p>
  );
}
