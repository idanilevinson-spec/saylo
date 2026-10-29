"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, CornerDownLeft, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { gradeExercise } from "@/lib/exercises/grade";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import McqQuestion from "@/components/McqQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import FillBlankExplanation from "@/components/FillBlankExplanation";
import EnglishText from "@/components/EnglishText";
import { GameHud, GameStage, type RoundResult } from "@/components/games/GameKit";
import type { FillBlankContent, McqContent } from "@/types/exercises";
import type { TrialLesson as TrialLessonData, TrialQuestion } from "@/lib/content/trialLesson";

const KIND_HE: Record<TrialQuestion["kind"], string> = { vocabulary: "אוצר מילים", grammar: "דקדוק" };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// What the learner saw, for the end screen's list of mistakes.
function promptOf(q: TrialQuestion): string {
  if (q.type === "mcq") return (q.content as unknown as McqContent).prompt;
  return (q.content as unknown as FillBlankContent).sentence.replace("___", "_____");
}

// The trial lesson: the app's own practice parts (the HUD track, the answer
// stage, the verdict panel), graded on the device so right/wrong shows the
// instant the visitor answers. No session, so nothing is recorded.
export default function TrialLesson({ lesson }: { lesson: TrialLessonData }) {
  const { session } = useAuth();
  const total = lesson.questions.length;
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>(() => Array(total).fill(null));
  const [answered, setAnswered] = useState<boolean | null>(null);
  const done = index >= total;
  const question = lesson.questions[index];
  // The question components shuffle their options when they mount, which
  // the server can't match, so the stage renders only in the browser (the
  // page itself, the HUD and the level picker still come from the server).
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function submit(response: Record<string, unknown>) {
    if (answered !== null || !question) return;
    const ok = gradeExercise(question.type, question.content, response);
    setAnswered(ok);
    setResults((r) => r.map((v, i) => (i === index ? (ok ? "correct" : "wrong") : v)));
    if (ok) playCorrectSound();
    else playIncorrectSound();
    if (index === total - 1) setTimeout(playCompleteSound, 350);
  }

  const next = useCallback(() => {
    setAnswered(null);
    setIndex((i) => i + 1);
  }, []);

  function restart() {
    setResults(Array(total).fill(null));
    setAnswered(null);
    setIndex(0);
  }

  // Same rhythm as the app: a right answer moves on by itself after a beat,
  // a wrong one waits for "continue" (button or Enter) so it gets read.
  useEffect(() => {
    if (answered !== true) return;
    const t = setTimeout(next, 1100);
    return () => clearTimeout(t);
  }, [answered, next]);

  useEffect(() => {
    if (answered !== false) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const onAnswer = !!target?.closest('[aria-label="תשובות"]');
      if (e.key === "Enter" && ((target?.tagName !== "BUTTON" && target?.tagName !== "A") || onAnswer)) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, next]);

  if (done) {
    const correct = results.filter((r) => r === "correct").length;
    const mistakes = lesson.questions.filter((_, i) => results[i] === "wrong");
    return (
      <section aria-labelledby="trial-done" className="lit-plate relative overflow-hidden rounded-lg border border-card-border p-6 sm:p-8">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <h2 id="trial-done" className="text-2xl sm:text-3xl font-black tracking-tight">
          סיימתם את שיעור הניסיון
        </h2>
        <p className="mt-2 text-lg">
          <span className="chyron text-3xl text-primary tabular-nums">
            {correct}/{total}
          </span>{" "}
          תשובות נכונות
        </p>

        {mistakes.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold">מה כדאי לזכור</h3>
            <ul className="mt-2 space-y-2">
              {mistakes.map((q) => (
                <li key={q.id} className="rounded-lg border border-card-border bg-background-2 px-4 py-3">
                  {/* Vocabulary prompts are Hebrew ("what's the English for…"),
                      grammar sentences English: each in its own direction. */}
                  {/[֐-׿]/.test(promptOf(q)) ? (
                    <p className="text-sm text-muted">{promptOf(q)}</p>
                  ) : (
                    <EnglishText as="p" className="text-sm text-muted">
                      {promptOf(q)}
                    </EnglishText>
                  )}
                  <p className="mt-1 text-sm">
                    <span className="text-muted">התשובה הנכונה: </span>
                    <EnglishText className="font-bold">{correctAnswerLabel(q.type, q.content)}</EnglishText>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 max-w-xl text-muted leading-relaxed">
          זו הייתה טעימה מהיחידה &quot;{lesson.unitTitleHe}&quot;. בחשבון היחידה ממשיכה עם קריאה, האזנה ושיחה עם מורה שמתקן
          אתכם תוך כדי, וכל טעות נשמרת במחברת הטעויות וחוזרת אליכם לחזרה.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-success" />
            מבחן רמה של כ-10 דקות, ותוכנית יומית ברמה שלכם
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-success" />3 ימים חינם, בלי כרטיס אשראי
          </li>
        </ul>

        <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href={session ? "/dashboard" : "/signup"}
            className="game-press flex items-center justify-center gap-2.5 min-h-12 px-7 rounded-lg bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors"
          >
            <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {session ? "להמשיך באפליקציה" : "ליצור חשבון בחינם"}
          </Link>
          <button
            type="button"
            onClick={restart}
            className="game-press flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg border border-card-border bg-card font-bold hover:border-primary/50 transition-colors"
          >
            <RotateCcw size={16} aria-hidden="true" />
            לנסות שוב
          </button>
        </div>
      </section>
    );
  }

  return (
    <div>
      <GameHud
        title={`שיעור ניסיון · ${lesson.unitTitleHe}`}
        subtitle={`${KIND_HE[question.kind]} · שאלה ${index + 1} מתוך ${total}`}
        results={results}
        current={index}
        exitHref="/"
        exitLabel="יציאה משיעור הניסיון"
        titleAs="h2"
      />
      {!hydrated ? (
        <div aria-hidden="true" className="h-72 rounded-lg border border-card-border bg-card animate-pulse" />
      ) : (
        <GameStage stageKey={question.id}>
          {question.type === "mcq" ? (
            <McqQuestion content={question.content} disabled={answered !== null} onSubmit={submit} />
          ) : (
            <FillBlankQuestion content={question.content} disabled={answered !== null} onSubmit={submit} />
          )}

          {answered !== null && (
            <motion.div
              role="status"
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className={`mt-5 rounded-lg border p-4 ${answered ? "border-success/35 bg-success/[0.06]" : "border-danger/35 bg-danger/[0.05]"}`}
            >
              <p className={`flex items-center gap-1.5 font-bold ${answered ? "text-success" : "text-danger"}`}>
                {answered ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}
                {answered ? "תשובה נכונה" : "לא בדיוק"}
              </p>
              {!answered &&
                (question.type === "fill_blank" ? (
                  <FillBlankExplanation content={question.content as unknown as FillBlankContent} />
                ) : (
                  <p className="mt-1.5 text-sm">
                    <span className="text-muted">התשובה הנכונה: </span>
                    <EnglishText className="font-bold">{correctAnswerLabel(question.type, question.content)}</EnglishText>
                  </p>
                ))}
            </motion.div>
          )}

          {answered === false && (
            <button
              type="button"
              onClick={next}
              className="game-press mt-4 inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors"
            >
              {index === total - 1 ? "לסיכום" : "להמשיך"}
              <CornerDownLeft size={16} aria-hidden="true" />
            </button>
          )}
        </GameStage>
      )}
    </div>
  );
}
