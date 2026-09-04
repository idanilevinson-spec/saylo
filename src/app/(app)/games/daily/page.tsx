"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordAttempt } from "@/lib/exercises/recordAttempt";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { maskWord, checkSpelling } from "@/lib/games/spelling";
import { awardXp } from "@/lib/gamification/xp";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";
import type { McqContent } from "@/types/exercises";

const ROUND_SIZE = 10;
const COMPLETION_BONUS_XP = 20;

type Mode = "mcq" | "spelling";

// Same word pool as Speed Round / Spelling, but each question's mode is
// chosen with a per-word deterministic pick so the round feels varied
// without reshuffling on every re-render.
function modeFor(vocabularyItemId: string): Mode {
  let hash = 0;
  for (let i = 0; i < vocabularyItemId.length; i++) hash = (hash * 31 + vocabularyItemId.charCodeAt(i)) | 0;
  return Math.abs(hash) % 2 === 0 ? "mcq" : "spelling";
}

export default function DailyChallengePage() {
  const { profile, loading } = useAuth();
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);
  const correctCountRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [reviewItems, { data: todaySession }] = await Promise.all([
        getDailyReview(profile.id, ROUND_SIZE),
        supabase
          .from("vocabulary_game_sessions")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("game_type", "daily_challenge")
          .gte("created_at", new Date().toISOString().slice(0, 10))
          .maybeSingle(),
      ]);
      setItems(reviewItems);
      setAlreadyDoneToday(!!todaySession);
    })();
  }, [profile]);

  const modes = useMemo(() => (items ? items.map((it) => modeFor(it.vocabularyItemId)) : []), [items]);

  // Auto-focus the spelling input for every new round of that type, same
  // as Spelling Challenge — otherwise the learner has to click in every
  // single time this mode comes up.
  useEffect(() => {
    if (!locked && modes[index] === "spelling") inputRef.current?.focus();
  }, [index, locked, modes]);

  async function finishRound(finalCorrect: number) {
    if (!profile || !items) return;
    await supabase.from("vocabulary_game_sessions").insert({
      profile_id: profile.id,
      game_type: "daily_challenge",
      total_questions: items.length,
      correct_count: finalCorrect,
      xp_awarded: alreadyDoneToday ? 0 : COMPLETION_BONUS_XP,
    });
    if (!alreadyDoneToday) {
      await awardXp(profile.id, "vocab_game_daily_bonus", COMPLETION_BONUS_XP);
    }
    playCompleteSound();
    setFinished(true);
  }

  async function advance(isCorrect: boolean) {
    correctCountRef.current += isCorrect ? 1 : 0;
    setCorrectCount(correctCountRef.current);
    setTimeout(() => {
      if (!items) return;
      if (index + 1 >= items.length) {
        void finishRound(correctCountRef.current);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        setInput("");
        setLocked(false);
        setWasCorrect(null);
      }
    }, 1100);
  }

  async function submitMcq(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    const item = items[index];
    const res = await recordAttempt(profile.id, item.exercise, { selectedIndex });
    setWasCorrect(res.isCorrect);
    if (res.isCorrect) playCorrectSound();
    else playIncorrectSound();
    void advance(res.isCorrect);
  }

  async function submitSpelling() {
    if (!profile || !items || locked || !input.trim()) return;
    setLocked(true);
    const item = items[index];
    const isCorrect = checkSpelling(input, item.headword);
    setWasCorrect(isCorrect);
    if (isCorrect) playCorrectSound();
    else playIncorrectSound();
    await recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_daily");
    void advance(isCorrect);
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">בונים את האתגר שלכם...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Sparkles} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים לאתגר</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / items.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">האתגר היומי הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {items.length} נכונות ({accuracy}%)
          {!alreadyDoneToday && <> · +{COMPLETION_BONUS_XP} XP בונוס על השלמת האתגר היומי</>}
        </p>
        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href="/games"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          חזרה למשחקים
        </MotionLink>
      </div>
    );
  }

  const item = items[index];
  const mode = modes[index];
  const mcqContent = mode === "mcq" ? (item.exercise.content as unknown as McqContent) : null;

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between text-sm text-muted mb-4">
          <span>
            שאלה {index + 1} מתוך {items.length}
          </span>
          <span className="flex items-center gap-1 font-bold text-accent-hover">
            <Sparkles size={14} /> {correctCount}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-6">
          <div className="h-full bg-accent transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          {mode === "mcq" && mcqContent ? (
            <div>
              <EnglishText as="p" className="font-medium text-lg">
                {mcqContent.prompt}
              </EnglishText>
              <div className="mt-4 space-y-2">
                {mcqContent.options.map((option, i) => {
                  const isCorrectOption = i === mcqContent.correctIndex;
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
            <div className="text-center">
              <p className="text-sm text-muted">השלימו את המילה באנגלית עבור</p>
              <p className="mt-1 text-2xl font-bold">{item.translationHe}</p>
              <p dir="ltr" className="mt-6 font-content text-3xl tracking-widest text-muted select-none">
                {maskWord(item.headword)}
              </p>
              <input
                ref={inputRef}
                type="text"
                dir="ltr"
                aria-label={`השלימו את המילה עבור ${item.translationHe}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSpelling()}
                disabled={locked}
                placeholder="Type the word..."
                className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
              />
              {!locked && (
                <button
                  onClick={submitSpelling}
                  disabled={!input.trim()}
                  className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  בדיקה
                </button>
              )}
            </div>
          )}

          {wasCorrect !== null && (
            <p className={`mt-4 text-center font-medium ${wasCorrect ? "text-success" : "text-danger"}`}>
              {wasCorrect ? "כל הכבוד!" : mode === "spelling" ? `לא בדיוק — המילה היא "${item.headword}"` : "לא בדיוק"}
            </p>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
