"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Heart, PartyPopper, Flame, CornerDownLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { startAttempt, type AttemptResult } from "@/lib/exercises/recordAttempt";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import type { Exercise } from "@/types/database";
import McqQuestion from "@/components/McqQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import MatchQuestion from "@/components/MatchQuestion";
import ReorderQuestion from "@/components/ReorderQuestion";
import DictationQuestion from "@/components/DictationQuestion";
import HeartsGate from "@/components/HeartsGate";
import MotionLink from "@/components/MotionLink";
import ReportContentError from "@/components/ReportContentError";
import EnglishText from "@/components/EnglishText";
import { GameHud, GameStage, WordReveal, type RoundResult, type WordInfo } from "@/components/games/GameKit";

interface ExercisePlayerProps {
  exercise: Exercise;
  nextHref: string | null;
  backHref: string;
  backLabel: string;
  progress?: { current: number; total: number } | null;
  // The vocabulary word this exercise practices, when it's tied to one.
  word?: WordInfo | null;
}

export default function ExercisePlayer({ exercise, nextHref, backHref, backLabel, progress, word }: ExercisePlayerProps) {
  const { profile } = useAuth();
  const router = useRouter();
  // The verdict is graded locally, so it shows the instant the learner
  // answers. Streak, hearts and badges need the server and fill in a moment
  // later (`details`) — the learner never waits on them to see right/wrong.
  const [result, setResult] = useState<{ isCorrect: boolean; xpAwarded: number } | null>(null);
  const [details, setDetails] = useState<AttemptResult | null>(null);
  const answeredRef = useRef(false);

  function handleSubmit(response: Record<string, unknown>) {
    if (!profile || answeredRef.current) return;
    answeredRef.current = true;
    const attempt = startAttempt(profile.id, exercise, response);
    setResult({ isCorrect: attempt.isCorrect, xpAwarded: attempt.xpAwarded });
    if (attempt.isCorrect) playCorrectSound();
    else playIncorrectSound();
    if (!nextHref) setTimeout(playCompleteSound, 350);
    attempt.done.then(setDetails).catch(() => undefined);
  }

  // A correct answer moves on by itself after a beat. A wrong answer keeps
  // "next" as a deliberate step (button or Enter), so the learner actually
  // looks at what they got wrong before moving past it.
  useEffect(() => {
    if (!result?.isCorrect || !nextHref) return;
    const timer = setTimeout(() => router.push(nextHref), 1100);
    return () => clearTimeout(timer);
  }, [result, nextHref, router]);

  useEffect(() => {
    if (!result || result.isCorrect || !nextHref) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.key === "Enter" && target?.tagName !== "BUTTON" && target?.tagName !== "A") {
        e.preventDefault();
        router.push(nextHref as string);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, nextHref, router]);

  // Each exercise is its own page, so earlier ones only show as done; the
  // current one fills in green/red once answered.
  const results: RoundResult[] = progress
    ? Array.from({ length: progress.total }, (_, i) =>
        i < progress.current - 1 ? "done" : i === progress.current - 1 && result ? (result.isCorrect ? "correct" : "wrong") : null
      )
    : [result ? (result.isCorrect ? "correct" : "wrong") : null];

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title={backLabel}
          subtitle={progress ? `תרגול · ${progress.current} מתוך ${progress.total}` : "תרגול"}
          results={results}
          current={progress ? progress.current - 1 : 0}
          exitHref={backHref}
          exitLabel={`חזרה ל${backLabel}`}
        />

        <GameStage stageKey={exercise.id}>
          {exercise.type === "mcq" && <McqQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />}
          {exercise.type === "fill_blank" && (
            <FillBlankQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "match" && <MatchQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />}
          {exercise.type === "reorder" && (
            <ReorderQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "dictation" && (
            <DictationQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}

          {result &&
            (word ? (
              <WordReveal word={word} verdict={result.isCorrect ? "correct" : "wrong"} compact={result.isCorrect} />
            ) : (
              <motion.div
                role="status"
                initial={{ opacity: 0, transform: "translateY(6px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={`mt-5 rounded-lg border p-4 ${result.isCorrect ? "border-success/35 bg-success/[0.06]" : "border-danger/35 bg-danger/[0.05]"}`}
              >
                <p className={`flex items-center gap-1.5 font-bold ${result.isCorrect ? "text-success" : "text-danger"}`}>
                  {result.isCorrect ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}
                  {result.isCorrect ? "תשובה נכונה" : "לא בדיוק"}
                </p>
                {!result.isCorrect && (
                  <p className="mt-1.5 text-sm">
                    <span className="text-muted">התשובה הנכונה: </span>
                    <EnglishText className="font-bold">{correctAnswerLabel(exercise.type, exercise.content)}</EnglishText>
                  </p>
                )}
              </motion.div>
            ))}

          {result && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-bold text-accent-hover tabular-nums">+{result.xpAwarded} XP</span>
              {details && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Flame size={14} aria-hidden="true" className="text-accent-hover" /> רצף של {details.currentStreak} ימים
                </span>
              )}
              {details && details.heartsRemaining !== null && (
                <span className="inline-flex items-center gap-1 text-danger tabular-nums">
                  <Heart size={14} aria-hidden="true" className="fill-current" /> נשארו {details.heartsRemaining} לבבות
                </span>
              )}
            </p>
          )}
          {details && details.newBadges.length > 0 && (
            <motion.p
              initial={{ opacity: 0, transform: "scale(0.9)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              className="mt-3 flex items-center gap-1.5 text-sm font-bold text-accent-hover"
            >
              <PartyPopper size={16} className="shrink-0" aria-hidden="true" />
              תג חדש: {details.newBadges.map((b) => b.name_he).join(", ")}
            </motion.p>
          )}

          {result &&
            (nextHref ? (
              <MotionLink
                whileTap={{ scale: 0.97 }}
                href={nextHref}
                className="mt-5 flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {result.isCorrect ? "התרגיל הבא" : "הבנתי, לתרגיל הבא"}
                <CornerDownLeft size={15} aria-hidden="true" className="opacity-70 hidden sm:inline" />
              </MotionLink>
            ) : (
              <div className="mt-6 border-t border-card-border pt-5 text-center">
                <CheckCircle2 size={36} aria-hidden="true" className="mx-auto text-success" />
                <p className="mt-2 text-lg font-bold">סיימתם את כל התרגילים ב{backLabel}</p>
                <MotionLink
                  whileTap={{ scale: 0.97 }}
                  href={backHref}
                  className="mt-4 flex items-center justify-center min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  חזרה לנושא
                </MotionLink>
              </div>
            ))}
        </GameStage>

        <div className="mt-3 flex justify-end">
          <ReportContentError targetType="exercise" targetId={exercise.id} />
        </div>
      </div>
    </HeartsGate>
  );
}
