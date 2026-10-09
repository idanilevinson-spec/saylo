"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PartyPopper, CheckCircle2, XCircle, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { getDueMistakeItems, type DueMistakeItem } from "@/lib/mistakes/mistakeQueue";
import { startAttempt, type AttemptResult } from "@/lib/exercises/recordAttempt";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import McqQuestion from "@/components/McqQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import MatchQuestion from "@/components/MatchQuestion";
import ReorderQuestion from "@/components/ReorderQuestion";
import DictationQuestion from "@/components/DictationQuestion";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import type { Exercise } from "@/types/database";

// "Mistake notebook" (docs/specs/mistake-notebook.md): one queue mixing
// vocabulary SRS (unchanged, still lives only in srs_items — see the
// spec's §2 for why) with grammar topics a learner has actually gotten
// wrong before (mistake_review_items). Pattern Coach observations join
// later, once a drill is actually reviewed/disclosed (spec §7.3) — until
// then this is vocabulary + grammar only.
//
// Simplification, worth knowing: true due_at-only interleaving (the spec's
// own suggestion) would need surfacing due_at out of getDailyReview's
// DueReviewItem, which doesn't carry it today — touching that shared,
// heavily-used type felt riskier than it was worth for this first version.
// Instead this alternates one vocabulary item with one grammar item, since
// each list already comes back due-soonest-first on its own.
type MixedItem =
  | { kind: "vocabulary"; vocab: DueReviewItem }
  | { kind: "grammar_topic"; mistake: DueMistakeItem };

function interleave(vocab: DueReviewItem[], grammar: DueMistakeItem[]): MixedItem[] {
  const result: MixedItem[] = [];
  const max = Math.max(vocab.length, grammar.length);
  for (let i = 0; i < max; i++) {
    if (vocab[i]) result.push({ kind: "vocabulary", vocab: vocab[i] });
    if (grammar[i]) result.push({ kind: "grammar_topic", mistake: grammar[i] });
  }
  return result;
}

function exerciseOf(item: MixedItem): Exercise {
  return item.kind === "vocabulary" ? item.vocab.exercise : item.mistake.exercise;
}

function labelOf(item: MixedItem): { title: string; subtitle: string } {
  return item.kind === "vocabulary"
    ? { title: item.vocab.headword, subtitle: item.vocab.translationHe }
    : { title: "נושא דקדוק לחזרה", subtitle: item.mistake.topicNameHe };
}

export default function MistakesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<MixedItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ isCorrect: boolean; xpAwarded: number } | null>(null);
  const [details, setDetails] = useState<{ exerciseId: string; data: AttemptResult } | null>(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([getDailyReview(profile.id), getDueMistakeItems(profile.id)]).then(([vocab, grammar]) => {
      setItems(interleave(vocab, grammar));
    });
  }, [profile]);

  function handleSubmit(response: Record<string, unknown>) {
    if (!profile || !items) return;
    const exercise = exerciseOf(items[index]);
    const attempt = startAttempt(profile.id, exercise, response);
    setResult({ isCorrect: attempt.isCorrect, xpAwarded: attempt.xpAwarded });
    if (attempt.isCorrect) playCorrectSound();
    else playIncorrectSound();
    if (index + 1 >= items.length) setTimeout(playCompleteSound, 350);
    attempt.done.then((data) => setDetails({ exerciseId: exercise.id, data })).catch(() => undefined);
  }

  function goNext() {
    if (!items) return;
    if (index + 1 >= items.length) playCompleteSound();
    setResult(null);
    setDetails(null);
    setIndex((i) => i + 1);
  }

  useEffect(() => {
    if (!result?.isCorrect || !items || index + 1 >= items.length) return;
    const timer = setTimeout(goNext, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (authLoading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-24 text-center"
      >
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}>
          <IconBadge icon={PartyPopper} tone="accent" />
        </motion.div>
        <h1 className="text-2xl font-bold">אין לכם היום מה לחזור</h1>
        <p className="mt-2 text-muted">
          כאן יופיעו מילים שממתינות לחזרה ונושאי דקדוק שטעיתם בהם. כרגע אין מה לחזור עליו, אז אפשר להמשיך לתרגל.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block text-primary font-medium">
          ללוח הבקרה ←
        </Link>
      </motion.div>
    );
  }

  if (index >= items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-24 text-center"
      >
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}>
          <IconBadge icon={PartyPopper} tone="accent" />
        </motion.div>
        <h1 className="text-2xl font-bold">סיימתם את החזרה של היום!</h1>
        <Link href="/dashboard" className="mt-6 inline-block text-primary font-medium">
          ללוח הבקרה ←
        </Link>
      </motion.div>
    );
  }

  const current = items[index];
  const exercise = exerciseOf(current);
  const label = labelOf(current);

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="sr-only">חזרה: פריט {index + 1} מתוך {items.length}</h1>
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm text-primary">
            ← ללוח הבקרה
          </Link>
          <p className="text-sm text-muted">
            {index + 1} מתוך {items.length}
          </p>
        </div>

        <motion.div key={exercise.id} className="mt-6 bg-card border border-card-border rounded-lg p-6 sm:p-8">
          <p className="text-xs font-medium text-accent-hover">{label.title}</p>
          <EnglishText as="p" className="mt-0.5 text-sm text-muted">
            {label.subtitle}
          </EnglishText>

          <div className="mt-4">
            {exercise.type === "mcq" && (
              <McqQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
            )}
            {exercise.type === "fill_blank" && (
              <FillBlankQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
            )}
            {exercise.type === "match" && (
              <MatchQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
            )}
            {exercise.type === "reorder" && (
              <ReorderQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
            )}
            {exercise.type === "dictation" && (
              <DictationQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
            )}
          </div>

          {result && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className={`mt-6 p-4 rounded-lg ${result.isCorrect ? "bg-success/10" : "bg-danger/10"}`}
            >
              <p className={`flex items-center gap-1.5 font-bold ${result.isCorrect ? "text-success" : "text-danger"}`}>
                {result.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {result.isCorrect ? "תשובה נכונה!" : "לא בדיוק"}
              </p>
              {!result.isCorrect && (
                <p className="mt-1 text-sm text-danger">
                  התשובה הנכונה: <span className="font-medium">{correctAnswerLabel(exercise.type, exercise.content)}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                +{result.xpAwarded} XP{details ? ` · רצף ${details.data.currentStreak} ימים` : ""}
              </p>
              {details && details.data.heartsRemaining !== null && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-danger">
                  <Heart size={14} className="fill-current" /> נשארו לכם {details.data.heartsRemaining} לבבות
                </p>
              )}
            </motion.div>
          )}

          {result && !result.isCorrect && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
              <button
                onClick={goNext}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
              >
                {index + 1 >= items.length ? "סיום" : "הפריט הבא →"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
