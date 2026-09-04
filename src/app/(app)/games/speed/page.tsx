"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordAttempt } from "@/lib/exercises/recordAttempt";
import { awardXp } from "@/lib/gamification/xp";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";
import type { McqContent } from "@/types/exercises";

const QUESTION_SECONDS = 8;
const FAST_ANSWER_THRESHOLD_MS = 3000;
const SPEED_BONUS_XP = 5;
const ROUND_SIZE = 10;

// Owns its own countdown so switching questions (via the `key={index}`
// the parent gives this) remounts a fresh timer through useState's own
// initial value instead of imperatively resetting existing state from
// an effect body, which React's compiler flags as an anti-pattern.
function QuestionTimer({ onTimeout, locked }: { onTimeout: () => void; locked: boolean }) {
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  useEffect(() => {
    if (locked) return;
    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [locked]);

  useEffect(() => {
    if (timeLeft === 0 && !locked) onTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const timePct = (timeLeft / QUESTION_SECONDS) * 100;
  return (
    <div className="h-2 rounded-full bg-background-2 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${timeLeft <= 3 ? "bg-danger" : "bg-accent"}`}
        animate={{ width: `${timePct}%` }}
        transition={{ duration: 0.9, ease: "linear" }}
      />
    </div>
  );
}

export default function SpeedRoundPage() {
  const { profile, loading } = useAuth();
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
  const [finished, setFinished] = useState(false);
  const questionStartRef = useRef<number>(0);
  const correctCountRef = useRef(0);
  const bonusXpRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, ROUND_SIZE).then((fetched) => {
      questionStartRef.current = Date.now();
      setItems(fetched);
    });
  }, [profile]);

  async function submitAnswer(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    setTimedOut(selectedIndex === -1);

    const elapsed = Date.now() - questionStartRef.current;
    const item = items[index];
    const res = await recordAttempt(profile.id, item.exercise, { selectedIndex });
    setWasCorrect(res.isCorrect);

    if (res.isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      if (elapsed < FAST_ANSWER_THRESHOLD_MS) {
        await awardXp(profile.id, "vocab_game_speed_bonus", SPEED_BONUS_XP);
        bonusXpRef.current += SPEED_BONUS_XP;
        setBonusXp(bonusXpRef.current);
      }
    } else {
      playIncorrectSound();
    }

    // A wrong (or timed-out) answer needs a beat to actually read which
    // option was correct; a right answer doesn't need to linger at all —
    // in a game built around pace, pausing exactly as long either way
    // dragged down the fast path for no reason.
    setTimeout(async () => {
      if (index + 1 >= items.length) {
        await supabase.from("vocabulary_game_sessions").insert({
          profile_id: profile.id,
          game_type: "speed_round",
          total_questions: items.length,
          correct_count: correctCountRef.current,
          xp_awarded: bonusXpRef.current,
        });
        playCompleteSound();
        setFinished(true);
      } else {
        questionStartRef.current = Date.now();
        setIndex((i) => i + 1);
        setSelected(null);
        setLocked(false);
        setWasCorrect(null);
        setTimedOut(false);
      }
    }, res.isCorrect ? 350 : 700);
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Zap} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / items.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">סיבוב מהירות הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {items.length} נכונות ({accuracy}%)
          {bonusXp > 0 && <> · +{bonusXp} XP בונוס מהירות</>}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/speed"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            עוד סיבוב
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

  const item = items[index];
  const content = item.exercise.content as unknown as McqContent;

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="sr-only">סיבוב מהירות</h1>
        <div className="flex items-center justify-between text-sm text-muted mb-2">
          <span>
            שאלה {index + 1} מתוך {items.length}
          </span>
          <span className="flex items-center gap-1 font-bold text-accent-hover">
            <Zap size={14} /> {correctCount}
          </span>
        </div>
        <QuestionTimer key={`timer-${index}`} locked={locked} onTimeout={() => submitAnswer(-1)} />

        <motion.div
          key={`card-${index}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          <EnglishText as="p" className="font-medium text-lg">
            {content.prompt}
          </EnglishText>

          <div className="mt-4 space-y-2">
            {content.options.map((option, i) => {
              const isCorrectOption = i === content.correctIndex;
              const isSelected = selected === i;
              let stateClass = "border-card-border hover:border-primary/40";
              if (locked && isCorrectOption) stateClass = "border-success bg-success/10";
              else if (locked && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
              else if (isSelected) stateClass = "border-primary bg-primary/5";
              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => submitAnswer(i)}
                  className={`w-full text-right px-4 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${stateClass}`}
                >
                  <EnglishText>{option}</EnglishText>
                </button>
              );
            })}
          </div>

          {wasCorrect !== null && (
            <p className={`mt-4 font-medium ${wasCorrect ? "text-success" : "text-danger"}`}>
              {wasCorrect ? "כל הכבוד!" : timedOut ? "נגמר הזמן!" : "לא בדיוק"}
            </p>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
