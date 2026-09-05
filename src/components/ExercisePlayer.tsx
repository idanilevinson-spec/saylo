"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordAttempt, type AttemptResult } from "@/lib/exercises/recordAttempt";
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

interface ExercisePlayerProps {
  exercise: Exercise;
  nextHref: string | null;
  backHref: string;
  backLabel: string;
}

export default function ExercisePlayer({ exercise, nextHref, backHref, backLabel }: ExercisePlayerProps) {
  const { profile } = useAuth();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(response: Record<string, unknown>) {
    if (!profile || submitting) return;
    setSubmitting(true);
    const res = await recordAttempt(profile.id, exercise, response);
    setResult(res);
    setSubmitting(false);
    if (res.isCorrect) playCorrectSound();
    else playIncorrectSound();
    if (!nextHref) setTimeout(playCompleteSound, 350);
  }

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Link href={backHref} className="text-sm text-primary">
          ← {backLabel}
        </Link>

        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          {exercise.type === "mcq" && (
            <McqQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "fill_blank" && (
            <FillBlankQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "match" && (
            <MatchQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "reorder" && (
            <ReorderQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}
          {exercise.type === "dictation" && (
            <DictationQuestion content={exercise.content} disabled={!!result} onSubmit={handleSubmit} />
          )}

          {result && (
            <motion.div
              role="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className={`mt-6 p-4 rounded-xl ${result.isCorrect ? "bg-success/10" : "bg-danger/10"}`}
            >
              <p className={`flex items-center gap-1.5 font-bold ${result.isCorrect ? "text-success" : "text-danger"}`}>
                {result.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {result.isCorrect ? "תשובה נכונה!" : "לא בדיוק"}
              </p>
              {!result.isCorrect && (
                <p className="mt-1 text-sm text-danger">
                  התשובה הנכונה: <span className="font-medium">{correctAnswerLabel(exercise.type, exercise.content)}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                +{result.xpAwarded} XP · רצף {result.currentStreak} ימים
              </p>
              {result.heartsRemaining !== null && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-danger">
                  <Heart size={14} className="fill-current" /> נשארו לכם {result.heartsRemaining} לבבות
                </p>
              )}
              {result.newBadges.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
                  className="mt-2 text-sm font-medium text-accent-hover"
                >
                  🎉 קיבלתם תג חדש: {result.newBadges.map((b) => b.name_he).join(", ")}
                </motion.p>
              )}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              {nextHref ? (
                <MotionLink
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  href={nextHref}
                  className="block text-center px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
                >
                  התרגיל הבא →
                </MotionLink>
              ) : (
                <div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
                    dir="ltr"
                    className="mx-auto mb-4 w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-sm font-medium"
                  >
                    <span className="text-accent-hover">Well done</span>
                    <span aria-hidden="true" className="text-accent text-xs">
                      ⇄
                    </span>
                    <bdi className="text-foreground">כל הכבוד</bdi>
                  </motion.div>
                  <MotionLink
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={backHref}
                    className="block text-center px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
                  >
                    סיימתם את הנושא!
                  </MotionLink>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
