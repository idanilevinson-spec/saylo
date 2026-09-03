"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, ChevronDown, ChevronUp, Sparkles, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordAttempt } from "@/lib/exercises/recordAttempt";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import McqQuestion from "@/components/McqQuestion";
import ReadingResponseForm from "@/components/ReadingResponseForm";
import ReadingTextViewer from "@/components/ReadingTextViewer";
import HeartsGate from "@/components/HeartsGate";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import type { VocabularyLookupEntry } from "@/lib/content/vocabulary";
import type { Exercise, ReadingText, ReadingOpenQuestion, CefrLevel } from "@/types/database";
import type { McqResponse } from "@/types/exercises";

// Timed portion only (the initial read stays untimed) — sized for a full
// 7-MCQ + 3-open-question exam on a genuinely multi-paragraph passage,
// not the old quick 2-question check.
const EXAM_MINUTES: Record<CefrLevel, number> = { A1: 18, A2: 20, B1: 25, B2: 30, C1: 35, C2: 40 };

interface ReadingExamProps {
  text: ReadingText;
  exercises: Exercise[];
  openQuestions: ReadingOpenQuestion[];
  vocabByWord: Record<string, VocabularyLookupEntry>;
}

type Phase = "intro" | "exam" | "finished";

interface McqOutcome {
  prompt: string;
  correct: boolean;
}

interface OpenOutcome {
  score: number;
  feedback_he: string;
  model_answer_en: string;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// The whole post-passage flow: an untimed read, then — the actual test-
// taking skill being practiced — a timed round of MCQs and open questions
// where the passage stays one tap away instead of disappearing, because
// re-scanning the text while answering (not memorizing it up front) is
// the real skill. Ends with a holistic AI wrap-up across the whole
// attempt, not just each open question's own per-answer feedback.
export default function ReadingExam({ text, exercises, openQuestions, vocabByWord }: ReadingExamProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answeredThisStep, setAnsweredThisStep] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [showPassage, setShowPassage] = useState(false);
  const [mcqOutcomes, setMcqOutcomes] = useState<McqOutcome[]>([]);
  // Keyed by open question id rather than appended, so retrying a failed
  // grading call (the "נסו שוב" button in ReadingResponseForm) replaces
  // that question's own result instead of adding a second, stale entry
  // alongside it.
  const [openOutcomesById, setOpenOutcomesById] = useState<Record<string, OpenOutcome>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const totalSeconds = EXAM_MINUTES[text.cefr_level] * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [timedMode, setTimedMode] = useState(true);

  const mcqCount = exercises.length;
  const openCount = openQuestions.length;
  const totalSteps = mcqCount + openCount;
  const hasExam = totalSteps > 0;

  const currentExercise = stepIndex < mcqCount ? exercises[stepIndex] : null;
  const currentOpenQuestion = stepIndex >= mcqCount && stepIndex < totalSteps ? openQuestions[stepIndex - mcqCount] : null;
  // Ordered the same way the questions were presented, and only the
  // ones actually answered — a question left ungraded (e.g. time ran
  // out before it was submitted) simply isn't in this list.
  const openOutcomes = openQuestions
    .map((q) => openOutcomesById[q.id])
    .filter((o): o is OpenOutcome => o !== undefined);

  async function finishExam() {
    if (phase === "finished") return;
    setPhase("finished");
    playCompleteSound();
    if (!profile) return;
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/reading-exam-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcqResults: mcqOutcomes,
          openResults: openOutcomes.map((o) => ({ score: o.score, feedbackHe: o.feedback_he })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summaryHe);
      }
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    if (phase !== "exam" || !timedMode) return;
    if (timeLeft <= 0) {
      Promise.resolve().then(finishExam);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timedMode, timeLeft]);

  function startExam(timed: boolean) {
    setTimedMode(timed);
    setTimeLeft(totalSeconds);
    setStepIndex(0);
    setPhase("exam");
  }

  async function handleMcqSubmit(exercise: Exercise, response: McqResponse) {
    if (!profile || answeredThisStep) return;
    setAnsweredThisStep(true);
    const result = await recordAttempt(profile.id, exercise, response as unknown as Record<string, unknown>);
    setLastCorrect(result.isCorrect);
    if (result.isCorrect) playCorrectSound();
    else playIncorrectSound();
    const prompt = (exercise.content as { prompt?: string }).prompt ?? "";
    setMcqOutcomes((prev) => [...prev, { prompt, correct: result.isCorrect }]);
  }

  function nextStep() {
    setAnsweredThisStep(false);
    setLastCorrect(null);
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      finishExam();
    } else {
      setStepIndex(next);
    }
  }

  if (!hasExam) {
    return (
      <>
        <span className="mt-8 block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover">
          הטקסט
        </span>
        <div className="mt-2 bg-card border border-card-border rounded-2xl p-6 sm:p-8">
          <ReadingTextViewer bodyEn={text.body_en} vocabByWord={vocabByWord} />
        </div>
      </>
    );
  }

  if (phase === "intro") {
    return (
      <>
        <span className="mt-8 block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover">
          01 · הטקסט
        </span>
        <div className="mt-2 bg-card border border-card-border rounded-2xl p-6 sm:p-8">
          <ReadingTextViewer bodyEn={text.body_en} vocabByWord={vocabByWord} />
        </div>

        <span className="mt-8 block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover">
          02 · מבחן הבנה
        </span>
        <div className="mt-2 bg-card border border-card-border rounded-2xl p-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Timer size={15} />
            <span>
              {EXAM_MINUTES[text.cefr_level]} דקות · {mcqCount} שאלות רב-ברירה
              {openCount > 0 ? ` + ${openCount} שאלות פתוחות` : ""}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            הטקסט יישאר נגיש לחזרה בלחיצת כפתור לאורך כל המבחן — אין צורך לשנן אותו מראש.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startExam(true)}
              className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              התחילו את המבחן בזמן
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startExam(false)}
              className="px-6 py-3 rounded-xl bg-background-2 text-foreground font-medium border border-card-border hover:bg-card-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              תרגול ללא לחץ (ללא טיימר)
            </motion.button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "finished") {
    const correctCount = mcqOutcomes.filter((o) => o.correct).length;
    const avgOpenScore =
      openOutcomes.length > 0
        ? Math.round(openOutcomes.reduce((sum, o) => sum + o.score, 0) / openOutcomes.length)
        : null;
    return (
      <div className="mt-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 text-accent-hover flex items-center justify-center">
          <Trophy size={28} />
        </div>
        <h2 className="mt-3 text-2xl font-bold">המבחן הושלם!</h2>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {mcqCount > 0 && (
            <span className="px-4 py-2 rounded-xl bg-card border border-card-border text-sm">
              <EnglishText as="span" className="font-bold">
                {correctCount}/{mcqCount}
              </EnglishText>{" "}
              ברב-ברירה
            </span>
          )}
          {avgOpenScore !== null && (
            <span className="px-4 py-2 rounded-xl bg-card border border-card-border text-sm">
              ממוצע{" "}
              <EnglishText as="span" className="font-bold">
                {avgOpenScore}/100
              </EnglishText>{" "}
              בשאלות הפתוחות
            </span>
          )}
        </div>

        {openOutcomes.length > 0 && (
          <div className="mt-6 space-y-3 text-right">
            {openOutcomes.map((o, i) => (
              <div key={i} className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">שאלה פתוחה {i + 1}</p>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-ink text-xs font-bold">
                    {o.score}/100
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{o.feedback_he}</p>
              </div>
            ))}
          </div>
        )}
        {openCount > openOutcomes.length && (
          <p className="mt-4 text-sm text-muted">הזמן נגמר לפני שהספקתם לענות על כל השאלות הפתוחות — זה בסדר גמור, נסו שוב בפעם הבאה.</p>
        )}

        <div className="mt-6 bg-accent/5 border border-accent/25 rounded-2xl p-6 text-right">
          <p className="font-bold flex items-center gap-1.5 text-accent-hover">
            <Sparkles size={16} /> סיכום כללי מה-AI
          </p>
          {summaryLoading ? (
            <p className="mt-2 text-sm text-muted">מכינים סיכום...</p>
          ) : (
            <p className="mt-2 leading-relaxed">{summary ?? "כל הכבוד על סיום המבחן!"}</p>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/reading"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            עוד טקסט
          </MotionLink>
        </div>
      </div>
    );
  }

  // phase === "exam"
  const stepNumber = Math.min(stepIndex + 1, totalSteps);
  const lowTime = timedMode && timeLeft <= 30;

  return (
    <HeartsGate>
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">
            שלב {stepNumber} מתוך {totalSteps}
          </span>
          {timedMode ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                lowTime ? "bg-danger-ink text-danger" : "bg-background-2 text-muted"
              }`}
            >
              <Timer size={14} />
              <EnglishText as="span" className="tabular-nums">
                {formatTime(timeLeft)}
              </EnglishText>
            </div>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-background-2 text-muted">
              מצב תרגול · ללא הגבלת זמן
            </span>
          )}
        </div>

        <button
          onClick={() => setShowPassage((v) => !v)}
          className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
        >
          {showPassage ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {showPassage ? "הסתירו את הטקסט" : "הצג את הטקסט"}
        </button>

        <AnimatePresence initial={false}>
          {showPassage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-background-2 border border-card-border rounded-2xl p-5 sm:p-6 max-h-72 overflow-y-auto">
                <ReadingTextViewer bodyEn={text.body_en} vocabByWord={vocabByWord} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          {currentExercise && (
            <>
              <McqQuestion
                content={currentExercise.content}
                disabled={answeredThisStep}
                onSubmit={(response) => handleMcqSubmit(currentExercise, response)}
              />
              {answeredThisStep && lastCorrect !== null && (
                <>
                  <div
                    className={`mt-4 flex items-center gap-1.5 text-sm font-medium ${
                      lastCorrect ? "text-success" : "text-danger"
                    }`}
                  >
                    {lastCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {lastCorrect ? "תשובה נכונה!" : "לא בדיוק"}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={nextStep}
                    className="mt-4 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    {stepIndex + 1 < totalSteps ? "השאלה הבאה →" : "סיום המבחן"}
                  </motion.button>
                </>
              )}
            </>
          )}

          {currentOpenQuestion && (
            <>
              <ReadingResponseForm
                key={currentOpenQuestion.id}
                readingTextId={text.id}
                questionId={currentOpenQuestion.id}
                questionEn={currentOpenQuestion.question_en}
                onGraded={(r) => {
                  setOpenOutcomesById((prev) => ({ ...prev, [currentOpenQuestion.id]: r }));
                  setAnsweredThisStep(true);
                }}
              />
              {answeredThisStep && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {stepIndex + 1 < totalSteps ? "השאלה הבאה →" : "סיום המבחן"}
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}
