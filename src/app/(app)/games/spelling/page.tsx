"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PenTool, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { maskWord, checkSpelling } from "@/lib/games/spelling";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";

const ROUND_SIZE = 10;

export default function SpellingChallengePage() {
  const { profile, loading } = useAuth();
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const correctCountRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, ROUND_SIZE).then(setItems);
  }, [profile]);

  async function handleSubmit() {
    if (!profile || !items || locked || !input.trim()) return;
    setLocked(true);
    const item = items[index];
    const isCorrect = checkSpelling(input, item.headword);
    setWasCorrect(isCorrect);
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
    }
    await recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_spelling");

    setTimeout(async () => {
      if (index + 1 >= items.length) {
        await supabase.from("vocabulary_game_sessions").insert({
          profile_id: profile.id,
          game_type: "spelling",
          total_questions: items.length,
          correct_count: correctCountRef.current,
          xp_awarded: 0,
        });
        playCompleteSound();
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setInput("");
        setLocked(false);
        setWasCorrect(null);
      }
    }, 1400);
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={PenTool} tone="accent" className="mx-auto" />
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
        <h1 className="text-2xl font-bold">אתגר האיות הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {items.length} נכונות ({accuracy}%)
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/spelling"
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
  const hint = maskWord(item.headword);

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-4">
          מילה {index + 1} מתוך {items.length}
        </p>
        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 text-center"
        >
          <p className="text-sm text-muted">השלימו את המילה באנגלית עבור</p>
          <p className="mt-1 text-2xl font-bold">{item.translationHe}</p>

          <p dir="ltr" className="mt-6 font-content text-3xl tracking-widest text-muted select-none">
            {hint}
          </p>

          <input
            type="text"
            dir="ltr"
            aria-label={`השלימו את המילה עבור ${item.translationHe}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={locked}
            placeholder="Type the word..."
            className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
          />

          {wasCorrect !== null && (
            <p className={`mt-4 font-medium ${wasCorrect ? "text-success" : "text-danger"}`}>
              {wasCorrect ? "כל הכבוד!" : `לא בדיוק — המילה היא "${item.headword}"`}
            </p>
          )}

          {!locked && (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              בדיקה
            </button>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
