"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PartyPopper, CheckCircle2, XCircle, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordAttempt, type AttemptResult } from "@/lib/exercises/recordAttempt";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import McqQuestion from "@/components/McqQuestion";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import type { McqResponse } from "@/types/exercises";

export default function ReviewPage() {
  const { profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    if (profile) {
      getDailyReview(profile.id).then(setItems);
    }
  }, [profile]);

  if (authLoading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-24 text-center"
      >
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}>
          <IconBadge icon={PartyPopper} tone="accent" />
        </motion.div>
        <h1 className="text-2xl font-bold">אין לכם היום מילים לחזרה</h1>
        <p className="mt-2 text-muted">חזרו מחר, או תרגלו נושא חדש בינתיים.</p>
        <Link href="/vocabulary" className="mt-6 inline-block text-primary font-medium">
          לאוצר המילים ←
        </Link>
      </motion.div>
    );
  }

  if (index >= items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-24 text-center"
      >
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}>
          <IconBadge icon={CheckCircle2} tone="success" />
        </motion.div>
        <h1 className="text-2xl font-bold">סיימתם את החזרה היומית!</h1>
        <Link href="/dashboard" className="mt-6 inline-block text-primary font-medium">
          ללוח הבקרה ←
        </Link>
      </motion.div>
    );
  }

  const current = items[index];

  async function handleSubmit(response: McqResponse) {
    if (!profile) return;
    const res = await recordAttempt(profile.id, current.exercise, response);
    setResult(res);
    if (res.isCorrect) playCorrectSound();
    else playIncorrectSound();
  }

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="sr-only">חזרה חכמה</h1>
        <p className="text-sm text-muted mb-4">
          מילה {index + 1} מתוך {items.length}
        </p>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          <McqQuestion content={current.exercise.content} disabled={!!result} onSubmit={handleSubmit} />

          {result && (
            <>
              <motion.div
                role="status"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`mt-6 p-4 rounded-xl ${result.isCorrect ? "bg-success/10" : "bg-danger/10"}`}
              >
                <p className={`flex items-center gap-1.5 font-bold ${result.isCorrect ? "text-success" : "text-danger"}`}>
                  {result.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {result.isCorrect ? "תשובה נכונה!" : "לא בדיוק"}
                </p>
                {!result.isCorrect && (
                  <p className="mt-1 text-sm text-danger">
                    התשובה הנכונה:{" "}
                    <span className="font-medium">{correctAnswerLabel(current.exercise.type, current.exercise.content)}</span>
                  </p>
                )}
                <p className="mt-1 text-sm text-muted">+{result.xpAwarded} XP</p>
                {result.heartsRemaining !== null && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-danger">
                    <Heart size={14} className="fill-current" /> נשארו לכם {result.heartsRemaining} לבבות
                  </p>
                )}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (index + 1 >= items.length) playCompleteSound();
                  setResult(null);
                  setIndex((i) => i + 1);
                }}
                className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
              >
                {index + 1 < items.length ? "המילה הבאה →" : "סיום"}
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
