"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessagesSquare, Trophy, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { buildIdiomsQuiz, type IdiomQuizQuestion } from "@/lib/games/idiomsQuiz";
import { recordIdiomAnswer } from "@/lib/games/recordIdiomAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";
import type { IdiomPhrasalVerb } from "@/types/database";

const ROUND_SIZE = 10;

export default function IdiomsPracticePage() {
  const { profile, loading } = useAuth();
  const [questions, setQuestions] = useState<IdiomQuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [heartsRemaining, setHeartsRemaining] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const correctCountRef = useRef(0);
  const xpAwardedRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("idioms_phrasal_verbs")
      .select("*")
      .eq("status", "published")
      .then(({ data }) => setQuestions(buildIdiomsQuiz((data ?? []) as IdiomPhrasalVerb[], ROUND_SIZE)));
  }, [profile]);

  async function submitAnswer(selectedIndex: number) {
    if (!profile || !questions || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    const item = questions[index];
    const isCorrect = selectedIndex === item.correctIndex;
    setWasCorrect(isCorrect);
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
    }
    const res = await recordIdiomAnswer(profile.id, isCorrect);
    xpAwardedRef.current += res.xpAwarded;
    setHeartsRemaining(res.heartsRemaining);

    setTimeout(async () => {
      if (index + 1 >= questions.length) {
        await supabase.from("vocabulary_game_sessions").insert({
          profile_id: profile.id,
          game_type: "idioms",
          total_questions: questions.length,
          correct_count: correctCountRef.current,
          xp_awarded: xpAwardedRef.current,
        });
        playCompleteSound();
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        setLocked(false);
        setWasCorrect(null);
      }
    }, 1400);
  }

  if (loading || questions === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={MessagesSquare} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">התרגיל הזה עוד לא זמין</h1>
        <p className="mt-2 text-muted">מוסיפים בהדרגה ניבים ופעלים דו-מיליים — חזרו לבדוק בקרוב.</p>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אתגר הניבים הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {questions.length} נכונות ({accuracy}%)
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/idioms/practice"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            עוד סיבוב
          </MotionLink>
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/idioms"
            className="px-6 py-3 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            חזרה לרשימת הניבים
          </MotionLink>
        </div>
      </div>
    );
  }

  const item = questions[index];

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="sr-only">אתגר ניבים ופעלים דו-מיליים</h1>
        <p className="text-sm text-muted mb-4">
          שאלה {index + 1} מתוך {questions.length}
        </p>
        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          <p className="text-sm text-muted">איזה ביטוי מתאים למשמעות הבאה?</p>
          <p className="mt-2 font-pen text-2xl text-accent-hover">{item.promptHe}</p>

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
            <div role="status">
              <p className={`mt-4 font-medium ${wasCorrect ? "text-success" : "text-danger"}`}>
                {wasCorrect ? "כל הכבוד!" : `לא בדיוק — הביטוי הנכון הוא "${item.options[item.correctIndex]}"`}
              </p>
              <EnglishText as="p" className="mt-1 text-sm text-muted">
                {item.exampleEn}
              </EnglishText>
              {heartsRemaining !== null && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-danger">
                  <Heart size={14} className="fill-current" /> נשארו לכם {heartsRemaining} לבבות
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
