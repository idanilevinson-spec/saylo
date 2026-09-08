"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { awardXp } from "@/lib/gamification/xp";
import { normalizeSpokenWord, type SpeakingTestStep } from "@/lib/games/speakingTestContent";
import { useSingleShotRecognition } from "@/lib/speech/useSingleShotRecognition";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";

interface SpeakingTestProps {
  steps: SpeakingTestStep[];
}

type Phase = "intro" | "exam" | "finished";

interface StepOutcome {
  step: SpeakingTestStep;
  transcript: string;
  isCorrect: boolean;
  score: number | null;
  feedbackHe: string | null;
}

const XP_CORRECT = 10;
const XP_ATTEMPT = 2;
const OPEN_PASS_THRESHOLD = 60;

// Every question answered by speaking into the mic instead of clicking or
// typing. Recording itself is driven by useSingleShotRecognition (the
// proven single-shot Azure setup extracted from PronunciationRecorder.tsx)
// — this component only decides what to do with the resulting transcript:
// exact-match grading for "vocab" steps, AI grading (a fresh POST per
// answer) for "open" steps. Grading fires automatically the moment a
// transcript is ready — no separate "submit" click on top of "stop
// speaking", since Azure's own speechEndDetected already marks that moment.
export default function SpeakingTest({ steps }: SpeakingTestProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [graded, setGraded] = useState(false);
  const [grading, setGrading] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const recognition = useSingleShotRecognition();
  const xpAwardedRef = useRef(0);
  const pendingRef = useRef<Promise<void>[]>([]);
  const gradedTranscriptRef = useRef<string | null>(null);

  const step = steps[stepIndex];

  async function gradeCurrentStep(transcript: string) {
    setGraded(true);
    if (step.type === "vocab") {
      const isCorrect = normalizeSpokenWord(transcript) === normalizeSpokenWord(step.expectedAnswer);
      setLastCorrect(isCorrect);
      setOutcomes((prev) => [...prev, { step, transcript, isCorrect, score: null, feedbackHe: null }]);
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();

      if (profile) {
        const pending = recordGameAnswer(profile.id, step.vocabularyItemId, isCorrect, "vocab_game_speaking").then(
          (res) => {
            xpAwardedRef.current += res.xpAwarded;
          }
        );
        pendingRef.current.push(pending);
      }
      return;
    }

    setGrading(true);
    try {
      const res = await fetch("/api/ai/speaking-test-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionEn: step.questionEn, transcript }),
      });
      const data = res.ok ? await res.json() : { score: 0, feedbackHe: "לא הצלחנו לנתח את התשובה הפעם." };
      const isCorrect = data.score >= OPEN_PASS_THRESHOLD;
      setLastCorrect(isCorrect);
      setLastScore(data.score);
      setLastFeedback(data.feedbackHe);
      setOutcomes((prev) => [...prev, { step, transcript, isCorrect, score: data.score, feedbackHe: data.feedbackHe }]);
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();

      if (profile) {
        const pending = awardXp(profile.id, "speaking_test_open", isCorrect ? XP_CORRECT : XP_ATTEMPT).then(() => {
          xpAwardedRef.current += isCorrect ? XP_CORRECT : XP_ATTEMPT;
        });
        pendingRef.current.push(pending);
      }
    } finally {
      setGrading(false);
    }
  }

  // Same "don't know it — skip" escape hatch as McqQuestion: marks the step
  // wrong and reveals the answer instead of leaving the learner stuck with
  // nothing to say into the mic.
  function skipStep() {
    if (graded) return;
    recognition.dismiss();
    gradedTranscriptRef.current = "__skipped__";
    setGraded(true);
    setLastCorrect(false);
    setLastScore(null);
    setLastFeedback(null);
    playIncorrectSound();
    setOutcomes((prev) => [...prev, { step, transcript: "", isCorrect: false, score: null, feedbackHe: null }]);

    if (!profile) return;
    if (step.type === "vocab") {
      const pending = recordGameAnswer(profile.id, step.vocabularyItemId, false, "vocab_game_speaking").then(
        (res) => {
          xpAwardedRef.current += res.xpAwarded;
        }
      );
      pendingRef.current.push(pending);
    } else {
      const pending = awardXp(profile.id, "speaking_test_open", XP_ATTEMPT).then(() => {
        xpAwardedRef.current += XP_ATTEMPT;
      });
      pendingRef.current.push(pending);
    }
  }

  // Fires once per step, the moment a transcript is ready — guarded by
  // gradedTranscriptRef so a re-render (e.g. from the grading fetch itself
  // resolving) can't trigger a second, duplicate grading pass.
  useEffect(() => {
    if (recognition.status !== "done" || !recognition.transcript) return;
    if (gradedTranscriptRef.current === recognition.transcript) return;
    gradedTranscriptRef.current = recognition.transcript;
    void gradeCurrentStep(recognition.transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.status, recognition.transcript]);

  async function finishTest() {
    setPhase("finished");
    playCompleteSound();
    if (!profile) return;
    await Promise.all(pendingRef.current);
    const correctCount = outcomes.filter((o) => o.isCorrect).length;
    await supabase.from("vocabulary_game_sessions").insert({
      profile_id: profile.id,
      game_type: "speaking_test",
      total_questions: steps.length,
      correct_count: correctCount,
      xp_awarded: xpAwardedRef.current,
      answers: outcomes.map((o) => ({
        type: o.step.type,
        prompt: o.step.type === "vocab" ? o.step.promptHe : o.step.questionEn,
        transcript: o.transcript,
        isCorrect: o.isCorrect,
        score: o.score,
        feedbackHe: o.feedbackHe,
      })),
    });
  }

  function nextStep() {
    setGraded(false);
    setLastCorrect(null);
    setLastScore(null);
    setLastFeedback(null);
    gradedTranscriptRef.current = null;
    recognition.dismiss();
    const next = stepIndex + 1;
    if (next >= steps.length) {
      void finishTest();
    } else {
      setStepIndex(next);
    }
  }

  // A correct answer moves on by itself after a beat — same pattern as
  // every other exercise/test flow in the app — a wrong one keeps the
  // click as a deliberate gate so the learner sees what they missed.
  useEffect(() => {
    if (!graded || lastCorrect !== true) return;
    const timer = setTimeout(nextStep, 1400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graded, lastCorrect]);

  if (phase === "intro") {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <IconBadge icon={Mic} tone="danger" className="mx-auto" />
        <h1 className="text-2xl font-bold">מוכנים למבחן הדיבור?</h1>
        <p className="mt-2 text-muted">
          {steps.length} שאלות · עונים בקול על כל שאלה — מילים באנגלית ושאלות פתוחות
        </p>
        <p className="mt-2 text-sm text-muted">יש לאשר גישה למיקרופון כשיתבקש.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setPhase("exam")}
          className="mt-6 px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          התחילו
        </motion.button>
      </div>
    );
  }

  if (phase === "finished") {
    const correctCount = outcomes.filter((o) => o.isCorrect).length;
    const accuracy = outcomes.length > 0 ? Math.round((correctCount / outcomes.length) * 100) : 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">מבחן הדיבור הושלם!</h1>
        <p className="mt-2 text-muted">
          <EnglishText as="span" className="font-bold">
            {correctCount}/{outcomes.length}
          </EnglishText>{" "}
          נכונות ({accuracy}%)
        </p>

        <div className="mt-6 space-y-3 text-right">
          {outcomes.map((o, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 ${o.isCorrect ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  {o.step.type === "vocab" ? (
                    <>מה המילה באנגלית עבור &quot;{o.step.promptHe}&quot;?</>
                  ) : (
                    <EnglishText as="span">{o.step.questionEn}</EnglishText>
                  )}
                </p>
                {o.isCorrect ? (
                  <CheckCircle2 size={18} className="text-success shrink-0" />
                ) : (
                  <XCircle size={18} className="text-danger shrink-0" />
                )}
              </div>
              <p className="mt-1.5 text-sm">
                <span className="text-muted">מה שנקלט: </span>
                <EnglishText as="span">{o.transcript || "—"}</EnglishText>
              </p>
              {o.step.type === "vocab" && !o.isCorrect && (
                <p className="mt-1 text-sm">
                  <span className="text-muted">התשובה הנכונה: </span>
                  <EnglishText as="span" className="text-success">
                    {o.step.expectedAnswer}
                  </EnglishText>
                </p>
              )}
              {o.step.type === "open" && o.feedbackHe && (
                <p className="mt-1.5 text-sm leading-relaxed">
                  {o.score !== null && <span className="font-medium">{o.score}/100 · </span>}
                  {o.feedbackHe}
                </p>
              )}
              {o.step.type === "open" && !o.isCorrect && (
                <p className="mt-1.5 text-sm">
                  <span className="text-muted">דוגמה לתשובה טובה: </span>
                  <EnglishText as="span" className="text-success">
                    {o.step.modelAnswerEn}
                  </EnglishText>
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/speaking-test"
            className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
          >
            מבחן נוסף
          </MotionLink>
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors"
          >
            חזרה ללוח הבקרה
          </MotionLink>
        </div>
      </div>
    );
  }

  // phase === "exam"
  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="sr-only">מבחן דיבור</h1>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted">
            שאלה {stepIndex + 1} מתוך {steps.length}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${(stepIndex / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-card-border rounded-lg p-6 sm:p-8 text-center"
          >
            {step.type === "vocab" ? (
              <>
                <p className="text-sm text-muted">אמרו בקול את המילה באנגלית עבור</p>
                <p className="mt-1 text-2xl font-bold">{step.promptHe}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">ענו בקול (2-4 משפטים)</p>
                <p className="mt-1 text-xl font-bold">
                  <EnglishText as="span">{step.questionEn}</EnglishText>
                </p>
              </>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              {recognition.status === "idle" && (
                <button
                  onClick={recognition.start}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  <Mic size={16} /> התחילו לענות
                </button>
              )}

              {recognition.status === "connecting" && (
                <span className="text-sm text-muted">מתחברים למיקרופון...</span>
              )}

              {recognition.status === "listening" && (
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-danger-ink text-danger font-medium"
                  >
                    <Mic size={16} /> מקשיב... דברו עכשיו
                  </motion.div>
                  <button
                    onClick={recognition.dismiss}
                    aria-label="בטלו את ההקלטה"
                    className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {recognition.status === "processing" && (
                <span className="text-sm text-muted">מעבד את מה שאמרתם...</span>
              )}

              {recognition.status === "error" && (
                <div className="text-sm">
                  <p role="alert" className="text-danger">
                    {recognition.errorMessage}
                  </p>
                  <button onClick={recognition.start} className="mt-1 text-primary hover:underline">
                    נסו שוב
                  </button>
                </div>
              )}

              {recognition.status === "done" && recognition.transcript && (
                <div className="w-full">
                  <p className="text-sm text-muted">מה שנקלט:</p>
                  <EnglishText as="p" className="mt-1 font-medium">
                    {recognition.transcript}
                  </EnglishText>
                </div>
              )}

              {grading && <span className="text-sm text-muted">מנתח את התשובה...</span>}
            </div>

            {!graded && !grading && (
              <button
                onClick={skipStep}
                className="mt-4 px-4 py-2 rounded-lg border border-card-border text-sm text-muted font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                לא יודע/ת · דלגו
              </button>
            )}

            {graded && !grading && lastCorrect !== null && (
              <>
                <div
                  role="status"
                  className={`mt-5 flex items-center justify-center gap-1.5 text-sm font-medium ${
                    lastCorrect ? "text-success" : "text-danger"
                  }`}
                >
                  {lastCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {lastCorrect ? "תשובה נכונה!" : "לא בדיוק"}
                </div>
                {step.type === "vocab" && !lastCorrect && (
                  <p className="mt-1 text-sm text-danger">
                    התשובה הנכונה:{" "}
                    <EnglishText as="span" className="font-medium">
                      {step.expectedAnswer}
                    </EnglishText>
                  </p>
                )}
                {step.type === "open" && lastFeedback && (
                  <p className="mt-2 text-sm leading-relaxed">
                    {lastScore !== null && <span className="font-medium">{lastScore}/100 · </span>}
                    {lastFeedback}
                  </p>
                )}
                {step.type === "open" && !lastCorrect && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted">דוגמה לתשובה טובה: </span>
                    <EnglishText as="span" className="font-medium">
                      {step.modelAnswerEn}
                    </EnglishText>
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="mt-4 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {stepIndex + 1 < steps.length ? "השאלה הבאה →" : "סיום המבחן"}
                </motion.button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </HeartsGate>
  );
}
