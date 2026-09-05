"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  getLearnPool,
  buildLearnQuestion,
  masteryTier,
  type LearnItem,
  type LearnQuestion,
  type MasteryTier,
} from "@/lib/games/learn";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { checkSpelling } from "@/lib/games/spelling";
import { supabase } from "@/lib/supabase/browserClient";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

const POOL_SIZE = 12;
// Mastering a word needs repetitions to reach 4 (new -> learning -> familiar
// x2 -> mastered), so a perfect run through the whole pool needs at least
// POOL_SIZE * 4 correct answers before this cap could ever matter — any
// lower and the cap would fire before a flawless session could even finish,
// let alone a realistic one with a few mistakes along the way.
const SAFETY_CAP = POOL_SIZE * 6;

type Phase = "loading" | "empty" | "playing" | "wordMastered" | "finished";

const TIER_LABEL: Record<MasteryTier, string> = {
  new: "חדש",
  learning: "בלמידה",
  familiar: "מוכר",
  mastered: "בשליטה",
};

const TIER_CLASS: Record<MasteryTier, string> = {
  new: "bg-background-2 text-muted",
  learning: "bg-primary/10 text-primary",
  familiar: "bg-accent/15 text-accent-hover",
  mastered: "bg-success/15 text-success",
};

// useSearchParams() (for the ?topic= deep link from the vocabulary topic
// page) needs a Suspense boundary on this route since it has no dynamic
// segment of its own, so Next tries to statically prerender it.
export default function LearnModePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>}>
      <LearnModePageInner />
    </Suspense>
  );
}

// The one mode across all of Saylo's vocabulary games where the learner
// can actually see their own SRS mastery state (every other game just
// uses it silently) — a genuine improvement, not just parity with the
// arcade games it otherwise follows the shape of.
function LearnModePageInner() {
  const { profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const topicSlug = searchParams.get("topic") ?? undefined;

  const [phase, setPhase] = useState<Phase>("loading");
  const [fullPool, setFullPool] = useState<LearnItem[]>([]);
  const [queue, setQueue] = useState<LearnItem[]>([]);
  const [masteredWords, setMasteredWords] = useState<LearnItem[]>([]);
  const [question, setQuestion] = useState<LearnQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const correctCountRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const xpAwardedRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      let topicId: string | undefined;
      if (topicSlug) {
        const { data: topic } = await supabase.from("topics").select("id").eq("slug", topicSlug).maybeSingle();
        topicId = topic?.id;
      }
      const pool = await getLearnPool(profile.id, topicId, POOL_SIZE);
      if (pool.length < 4) {
        setPhase("empty");
        return;
      }
      setFullPool(pool);
      setQueue(pool);
      setQuestion(buildLearnQuestion(pool[0], pool));
      setPhase("playing");
    })();
  }, [profile, topicSlug]);

  useEffect(() => {
    if (phase === "playing" && question?.type === "recall" && !locked) inputRef.current?.focus();
  }, [phase, question, locked]);

  function advanceTo(nextQueue: LearnItem[]) {
    if (nextQueue.length === 0 || totalAnsweredRef.current >= SAFETY_CAP) {
      finishSession();
      return;
    }
    setQueue(nextQueue);
    setQuestion(buildLearnQuestion(nextQueue[0], fullPool));
    setSelected(null);
    setInput("");
    setLocked(false);
    setWasCorrect(null);
  }

  async function finishSession() {
    playCompleteSound();
    setPhase("finished");
    if (profile) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "learn",
        total_questions: totalAnsweredRef.current,
        correct_count: correctCountRef.current,
        xp_awarded: xpAwardedRef.current,
      });
    }
  }

  async function submitAnswer(isCorrect: boolean) {
    if (!profile || !question || locked) return;
    setLocked(true);
    setWasCorrect(isCorrect);
    totalAnsweredRef.current += 1;
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
    }

    const item = question.item;
    const res = await recordGameAnswer(
      profile.id,
      item.vocabularyItemId,
      isCorrect,
      question.type === "mcq" ? "vocab_learn_mcq" : "vocab_learn_recall"
    );
    xpAwardedRef.current += res.xpAwarded;
    const newTier = masteryTier(res.repetitions);

    setTimeout(() => {
      const restOfQueue = queue.slice(1);
      if (newTier === "mastered") {
        setMasteredWords((prev) => [...prev, { ...item, repetitions: res.repetitions }]);
        setPhase("wordMastered");
        setTimeout(() => {
          setPhase("playing");
          advanceTo(restOfQueue);
        }, 1100);
      } else {
        const updatedItem = { ...item, repetitions: res.repetitions };
        advanceTo([...restOfQueue, updatedItem]);
      }
    }, 900);
  }

  function submitMcq(index: number) {
    if (question?.type !== "mcq") return;
    setSelected(index);
    submitAnswer(index === question.correctIndex);
  }

  function submitRecall() {
    if (question?.type !== "recall" || !input.trim()) return;
    submitAnswer(checkSpelling(input, question.item.headword));
  }

  if (authLoading || phase === "loading") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">בונים לכם סבב למידה...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={GraduationCap} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למידה</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (phase === "finished") {
    const total = fullPool.length;
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">סבב הלמידה הושלם!</h1>
        <p className="mt-2 text-muted">
          {masteredWords.length} מתוך {total} מילים הגיעו לשליטה מלאה
        </p>
        {masteredWords.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {masteredWords.map((w) => (
              <span
                key={w.vocabularyItemId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/25 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <EnglishText>{w.headword}</EnglishText>
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/learn"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            עוד סיבוב למידה
          </MotionLink>
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games"
            className="px-6 py-3 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            חזרה למשחקים
          </MotionLink>
        </div>
      </div>
    );
  }

  const total = fullPool.length;
  const remaining = total - masteredWords.length;

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="sr-only">סבב הלמידה</h1>
        <div className="flex items-center justify-between text-sm text-muted mb-6">
          <span>
            {masteredWords.length} מתוך {total} מילים בשליטה
          </span>
          <span className="flex items-center gap-1 font-bold text-accent-hover">
            <Sparkles size={14} /> {correctCount}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <motion.div
            className="h-full bg-success"
            animate={{ width: `${(masteredWords.length / Math.max(total, 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="relative">
          <AnimatePresence>
            {phase === "wordMastered" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/90 rounded-2xl"
              >
                <p className="text-xl font-bold text-success">מילה בשליטה מלאה! 🎉</p>
                {question && <EnglishText className="text-lg text-muted">{question.item.headword}</EnglishText>}
              </motion.div>
            )}
          </AnimatePresence>

          {question && (
            <motion.div
              key={question.item.vocabularyItemId + question.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{remaining} מילים נשארו בסבב הזה</p>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_CLASS[masteryTier(question.item.repetitions)]}`}
                >
                  {TIER_LABEL[masteryTier(question.item.repetitions)]}
                </span>
              </div>

              {question.type === "mcq" ? (
                <div className="mt-4">
                  <p className="text-sm text-muted">איזו מילה מתאימה לתרגום</p>
                  <p className="mt-1 text-2xl font-bold">{question.item.translationHe}</p>
                  <div className="mt-5 space-y-2">
                    {question.options.map((option, i) => {
                      const isCorrectOption = i === question.correctIndex;
                      const isSelected = selected === i;
                      let stateClass = "border-card-border hover:border-primary/40";
                      if (locked && isCorrectOption) stateClass = "border-success bg-success/10";
                      else if (locked && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
                      else if (isSelected) stateClass = "border-primary bg-primary/5";
                      return (
                        <button
                          key={i}
                          disabled={locked}
                          onClick={() => submitMcq(i)}
                          className={`w-full text-right px-4 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${stateClass}`}
                        >
                          <EnglishText>{option}</EnglishText>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted">השלימו את המילה באנגלית עבור</p>
                  <p className="mt-1 text-2xl font-bold">{question.item.translationHe}</p>
                  <input
                    ref={inputRef}
                    type="text"
                    dir="ltr"
                    aria-label={`השלימו את המילה עבור ${question.item.translationHe}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitRecall()}
                    disabled={locked}
                    placeholder="Type the word..."
                    className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
                  />
                  {!locked && (
                    <button
                      onClick={submitRecall}
                      disabled={!input.trim()}
                      className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                    >
                      בדיקה
                    </button>
                  )}
                </div>
              )}

              {wasCorrect !== null && (
                <p role="status" className={`mt-4 text-center font-medium ${wasCorrect ? "text-success" : "text-danger"}`}>
                  {wasCorrect
                    ? "כל הכבוד!"
                    : question.type === "recall"
                      ? `לא בדיוק — המילה היא "${question.item.headword}"`
                      : "לא בדיוק"}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </HeartsGate>
  );
}
