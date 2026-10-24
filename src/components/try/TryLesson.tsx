"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, CornerDownLeft, RotateCcw, XCircle } from "lucide-react";
import { GameStage } from "@/components/games/GameKit";
import McqQuestion from "@/components/McqQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import ReorderQuestion from "@/components/ReorderQuestion";
import FillBlankExplanation from "@/components/FillBlankExplanation";
import EnglishText from "@/components/EnglishText";
import { gradeExercise } from "@/lib/exercises/grade";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { pickCheckQuestions } from "@/lib/content/pickQuestions";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { EASE_OUT } from "@/lib/motion/easing";
import type { TryLevel, TryQuestion } from "@/lib/content/tryLesson";
import type { FillBlankContent } from "@/types/exercises";

// The taster lesson itself: pick a starting point, answer six real
// questions with the same instant checking the app uses, see the result
// and what the full course adds. Nothing is saved.

const QUESTIONS = 6;

type Verdict = "correct" | "wrong" | null;

export default function TryLesson({ levels, unitCount, trialDays }: { levels: TryLevel[]; unitCount: number; trialDays: number }) {
  const [chosen, setChosen] = useState<TryLevel | null>(null);
  const [questions, setQuestions] = useState<TryQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Verdict[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null);

  function begin(level: TryLevel) {
    const picked = pickCheckQuestions(
      level.pool.filter((q) => q.side === "vocabulary"),
      level.pool.filter((q) => q.side === "grammar"),
      QUESTIONS,
    );
    setChosen(level);
    setQuestions(picked);
    setResults(picked.map(() => null));
    setIndex(0);
    setAnswered(null);
  }

  function restart() {
    setChosen(null);
    setQuestions([]);
  }

  const next = () => {
    setAnswered(null);
    if (index + 1 >= questions.length) playCompleteSound();
    setIndex(index + 1);
  };

  // A right answer moves on by itself; a wrong one waits to be read.
  useEffect(() => {
    if (answered !== true) return;
    const timer = setTimeout(next, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  if (!chosen) {
    return (
      <section aria-labelledby="try-pick" className="mt-8">
        <h2 id="try-pick" className="text-xl font-black tracking-tight">
          מאיפה מתחילים?
        </h2>
        <p className="mt-1 text-muted">בחרו את מה שנשמע הכי קרוב. אפשר להחליף אחר כך.</p>
        <ul className="mt-5 space-y-2">
          {levels.map((l) => (
            <li key={l.level}>
              <button
                type="button"
                onClick={() => begin(l)}
                className="game-press group flex w-full items-center gap-4 rounded-lg border border-card-border bg-card p-4 sm:p-5 text-start transition-[border-color,transform] duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <span className="chyron w-16 shrink-0 text-center text-4xl leading-none text-primary" dir="ltr">
                  {l.level}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{CEFR_NAME_HE[l.level]}</span>
                  <span className="mt-0.5 block text-sm text-muted leading-relaxed">
                    מתוך היחידה &quot;{l.unitTitleHe}&quot;: {l.unitGoalHe}
                  </span>
                </span>
                <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const total = questions.length;
  const done = index >= total;
  const correct = results.filter((r) => r === "correct").length;

  if (done) {
    return (
      <section aria-labelledby="try-result" className="mt-8">
        <div className="relative overflow-hidden rounded-lg bg-primary text-primary-ink p-6 sm:p-8">
          <p className="text-sm font-bold text-primary-ink/90">
            {chosen.level} · {chosen.unitTitleHe}
          </p>
          <h2 id="try-result" className="mt-2 flex items-end gap-4">
            <span className="chyron text-7xl sm:text-8xl leading-[0.85] tabular-nums" dir="ltr">
              {correct}/{total}
            </span>
            <span className="pb-1 text-2xl font-black">{correct === total ? "מושלם" : correct >= total / 2 ? "יפה מאוד" : "התחלה טובה"}</span>
          </h2>
          <span className="mt-4 flex gap-1" aria-hidden="true">
            {results.map((r, i) => (
              <span key={i} className={`h-2 w-7 rounded-full ${r === "correct" ? "bg-primary-ink" : "bg-primary-ink/30"}`} />
            ))}
          </span>
          <p className="mt-5 max-w-xl text-primary-ink/90 leading-relaxed">
            זו הייתה טעימה מיחידה אחת. במסלול המלא מתחילים במבחן רמה, ומקבלים {unitCount} יחידות מ-A1 עד C2, עם קריאה,
            האזנה, כתיבה ושיחה עם מורה שמתקן אתכם תוך כדי.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/signup"
              className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
            >
              להירשם ולהתחיל במבחן רמה <ChevronLeft size={17} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 font-bold underline underline-offset-4 decoration-primary-ink/40 hover:decoration-primary-ink rounded focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
            >
              <RotateCcw size={15} aria-hidden="true" />
              לנסות רמה אחרת
            </button>
          </div>
          <p className="mt-4 text-sm text-primary-ink/90">{trialDays} ימים חינם, בלי כרטיס אשראי.</p>
        </div>
      </section>
    );
  }

  const question = questions[index];

  function handleSubmit(response: Record<string, unknown>) {
    if (answered !== null) return;
    const isCorrect = gradeExercise(question.type, question.content, response);
    setAnswered(isCorrect);
    setResults((rs) => rs.map((r, i) => (i === index ? (isCorrect ? "correct" : "wrong") : r)));
    if (isCorrect) playCorrectSound();
    else playIncorrectSound();
  }

  return (
    <section aria-label="שיעור טעימה" className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold tabular-nums">
          <span className="chyron text-base text-primary" dir="ltr">
            {chosen.level}
          </span>{" "}
          · שאלה {index + 1} מתוך {total}
        </p>
        <button type="button" onClick={restart} className="text-sm text-muted hover:text-foreground underline underline-offset-4 rounded focus-visible:outline-2 focus-visible:outline-primary">
          להחליף רמה
        </button>
      </div>
      <span className="mb-4 flex gap-1" aria-hidden="true">
        {results.map((r, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${r === "correct" ? "bg-success" : r === "wrong" ? "bg-danger" : i === index ? "bg-primary" : "bg-card-border"}`}
          />
        ))}
      </span>

      <GameStage stageKey={`${chosen.level}-${question.id}`}>
        {question.type === "mcq" && <McqQuestion content={question.content} disabled={answered !== null} onSubmit={handleSubmit} />}
        {question.type === "fill_blank" && <FillBlankQuestion content={question.content} disabled={answered !== null} onSubmit={handleSubmit} />}
        {question.type === "reorder" && <ReorderQuestion content={question.content} disabled={answered !== null} onSubmit={handleSubmit} />}

        {answered !== null && (
          <motion.div
            role="status"
            initial={{ opacity: 0, transform: "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={`mt-5 rounded-lg border p-4 ${answered ? "border-success/35 bg-success/[0.06]" : "border-danger/35 bg-danger/[0.05]"}`}
          >
            <p className={`flex items-center gap-1.5 font-bold ${answered ? "text-success-hover" : "text-danger-hover"}`}>
              {answered ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
              {answered ? "נכון" : "לא בדיוק"}
            </p>
            {!answered &&
              (question.type === "fill_blank" ? (
                <FillBlankExplanation content={question.content as unknown as FillBlankContent} />
              ) : (
                <p className="mt-1 text-sm">
                  התשובה הנכונה: <EnglishText className="font-bold">{correctAnswerLabel(question.type, question.content)}</EnglishText>
                </p>
              ))}
          </motion.div>
        )}

        {answered === false && (
          <button
            type="button"
            autoFocus
            onClick={next}
            className="game-press mt-5 w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {index + 1 < total ? "לשאלה הבאה" : "לתוצאה"}
            <CornerDownLeft size={16} aria-hidden="true" />
          </button>
        )}
      </GameStage>
    </section>
  );
}
