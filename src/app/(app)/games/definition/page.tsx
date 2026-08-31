"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { getDefinitionGameWords, type DefinitionGameItem } from "@/lib/games/definitionWords";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

const ROUND_SIZE = 10;

export default function DefinitionGamePage() {
  const { profile, loading } = useAuth();
  const [items, setItems] = useState<DefinitionGameItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const correctCountRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDefinitionGameWords(profile.id, ROUND_SIZE).then(setItems);
  }, [profile]);

  async function submitAnswer(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    const item = items[index];
    const isCorrect = selectedIndex === item.correctIndex;
    setWasCorrect(isCorrect);
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
    }
    await recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_definition");

    setTimeout(async () => {
      if (index + 1 >= items.length) {
        await supabase.from("vocabulary_game_sessions").insert({
          profile_id: profile.id,
          game_type: "definition",
          total_questions: items.length,
          correct_count: correctCountRef.current,
          xp_awarded: 0,
        });
        playCompleteSound();
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        setLocked(false);
        setWasCorrect(null);
      }
    }, 1100);
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={BookOpenCheck} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">המשחק הזה עוד לא זמין</h1>
        <p className="mt-2 text-muted">מוסיפים בהדרגה הגדרות באנגלית למילים — חזרו לבדוק בקרוב.</p>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / items.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">זיהוי לפי הגדרה הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {items.length} נכונות ({accuracy}%)
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/definition"
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

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-4">
          שאלה {index + 1} מתוך {items.length}
        </p>
        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <div className="h-full bg-primary transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          <p className="text-sm text-muted">איזו מילה מתאימה להגדרה הבאה?</p>
          <EnglishText as="p" className="mt-2 font-medium text-lg leading-relaxed">
            {item.definitionEn}
          </EnglishText>

          <div className="mt-5 space-y-2">
            {item.options.map((option, i) => {
              const isCorrectOption = i === item.correctIndex;
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
              {wasCorrect ? "כל הכבוד!" : `לא בדיוק — המילה היא "${item.headword}" (${item.translationHe})`}
            </p>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
