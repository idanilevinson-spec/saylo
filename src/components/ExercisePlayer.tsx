"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Heart, PartyPopper, Flame, CornerDownLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { startAttempt, type AttemptResult } from "@/lib/exercises/recordAttempt";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { streakLabel } from "@/lib/format/streak";
import FillBlankExplanation from "@/components/FillBlankExplanation";
import type { FillBlankContent } from "@/types/exercises";
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
import PracticeSummary from "@/components/PracticeSummary";
import {
  beginRun,
  historyOf,
  parseRun,
  promptLabel,
  recordEntry,
  recordRetry,
  retryNext,
  runSnapshot,
  subscribeRun,
} from "@/lib/exercises/practiceSession";

interface ExercisePlayerProps {
  exercise: Exercise;
  nextHref: string | null;
  backHref: string;
  backLabel: string;
  progress?: { current: number; total: number } | null;
  // The vocabulary word this exercise practices, when it's tied to one.
  word?: WordInfo | null;
  // A second pass over this run's mistakes (?retry=1): "next" walks the
  // mistakes instead of the set.
  retry?: boolean;
}

export default function ExercisePlayer({
  exercise,
  nextHref: setNextHref,
  backHref,
  backLabel,
  progress,
  word,
  retry = false,
}: ExercisePlayerProps) {
  const { profile } = useAuth();
  const router = useRouter();
  // The verdict is graded locally, so it shows the instant the learner
  // answers. Streak, hearts and badges need the server and fill in a moment
  // later (`details`) — the learner never waits on them to see right/wrong.
  const [result, setResult] = useState<{ isCorrect: boolean; xpAwarded: number } | null>(null);
  const [details, setDetails] = useState<AttemptResult | null>(null);
  const answeredRef = useRef(false);

  // This run through the set (practiceSession.ts), keyed by the set's page.
  const runRaw = useSyncExternalStore(subscribeRun, runSnapshot, () => null);
  const run = useMemo(() => parseRun(runRaw), [runRaw]);
  const retryQueue = retry && run?.setKey === backHref ? (run.retry?.queue ?? []) : [];
  const retryIndex = retryQueue.indexOf(exercise.id);
  const nextRetryId = retry ? retryNext(run, exercise.id) : null;
  const nextHref = retry ? (nextRetryId ? `/practice/${nextRetryId}?retry=1` : null) : setNextHref;

  // The set's first exercise starts a fresh run.
  const startsSet = !retry && progress?.current === 1;
  const setTotal = progress?.total ?? 1;
  useEffect(() => {
    if (startsSet) beginRun(backHref, setTotal);
  }, [startsSet, backHref, setTotal]);

  function handleSubmit(response: Record<string, unknown>) {
    if (!profile || answeredRef.current) return;
    answeredRef.current = true;
    const attempt = startAttempt(profile.id, exercise, response);
    setResult({ isCorrect: attempt.isCorrect, xpAwarded: attempt.xpAwarded });
    if (retry) recordRetry(backHref, exercise.id, attempt.isCorrect);
    else
      recordEntry(backHref, setTotal, {
        id: exercise.id,
        index: progress ? progress.current - 1 : 0,
        ok: attempt.isCorrect,
        prompt: promptLabel(exercise.type, exercise.content),
        answer: correctAnswerLabel(exercise.type, exercise.content),
        word: !!exercise.vocabulary_item_id,
      });
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
      // Focus usually still sits on the (now disabled) answer just given.
      const onAnswer = !!target?.closest('[aria-label="תשובות"]');
      if (e.key === "Enter" && ((target?.tagName !== "BUTTON" && target?.tagName !== "A") || onAnswer)) {
        e.preventDefault();
        router.push(nextHref as string);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, nextHref, router]);

  // Earlier exercises show how they went in this run (green/red), or just
  // "done" if they were answered before it began; the current one fills in
  // once answered. A retry pass tracks its own short list.
  const verdict: RoundResult = result ? (result.isCorrect ? "correct" : "wrong") : null;
  const history = historyOf(run?.setKey === backHref ? run : null, setTotal);
  const results: RoundResult[] =
    retry && retryIndex >= 0
      ? retryQueue.map((id, i) =>
          i === retryIndex ? verdict : run?.retry?.results[id] === undefined ? null : run.retry.results[id] ? "correct" : "wrong",
        )
      : progress
        ? Array.from({ length: progress.total }, (_, i) =>
            i < progress.current - 1 ? (history[i] ?? "done") : i === progress.current - 1 ? verdict : null,
          )
        : [verdict];

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title={backLabel}
          subtitle={
            retry && retryIndex >= 0
              ? `חזרה על הטעויות · ${retryIndex + 1} מתוך ${retryQueue.length}`
              : progress
                ? `תרגול · ${progress.current} מתוך ${progress.total}`
                : "תרגול"
          }
          results={results}
          current={retry && retryIndex >= 0 ? retryIndex : progress ? progress.current - 1 : 0}
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
                {!result.isCorrect && exercise.type === "fill_blank" ? (
                  <FillBlankExplanation content={exercise.content as unknown as FillBlankContent} />
                ) : (
                  !result.isCorrect && (
                    <p className="mt-1.5 text-sm">
                      <span className="text-muted">התשובה הנכונה: </span>
                      <EnglishText className="font-bold">{correctAnswerLabel(exercise.type, exercise.content)}</EnglishText>
                    </p>
                  )
                )}
              </motion.div>
            ))}

          {result && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-bold text-accent-hover tabular-nums">+{result.xpAwarded} XP</span>
              {details && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Flame size={14} aria-hidden="true" className="text-accent-hover" /> {streakLabel(details.currentStreak)}
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
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
              <PracticeSummary run={run?.setKey === backHref ? run : null} retry={retry} backHref={backHref} backLabel={backLabel} />
            ))}
        </GameStage>

        <div className="mt-3 flex justify-end">
          <ReportContentError targetType="exercise" targetId={exercise.id} />
        </div>
      </div>
    </HeartsGate>
  );
}
