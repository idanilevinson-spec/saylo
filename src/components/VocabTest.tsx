"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, CheckCircle2, XCircle, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { gradeTestStep, type TestStep } from "@/lib/games/testContent";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";

interface VocabTestProps {
  steps: TestStep[];
}

type Phase = "intro" | "exam" | "finished";

interface StepOutcome {
  step: TestStep;
  responseLabel: string;
  correctLabel: string;
  isCorrect: boolean;
}

const SECONDS_PER_QUESTION = 20;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// The bundled-test counterpart to ReadingExam.tsx's step-array exam
// engine, deliberately simpler: every step's grading is pure and
// synchronous (gradeTestStep), so there's nothing async to wait on
// between steps and no AI-summary call at the end — just a per-question
// review, which is the actual point of a Test mode (showing exactly what
// was missed and why, not just a final percentage).
export default function VocabTest({ steps }: VocabTestProps) {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answeredThisStep, setAnsweredThisStep] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const [timedMode, setTimedMode] = useState(true);

  const totalSeconds = steps.length * SECONDS_PER_QUESTION;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const xpAwardedRef = useRef(0);
  const pendingAnswersRef = useRef<Promise<void>[]>([]);

  async function finishTest(finalOutcomes: StepOutcome[]) {
    if (phase === "finished") return;
    setPhase("finished");
    playCompleteSound();
    if (!profile) return;
    // Make sure every answer's XP/SRS call has actually resolved before
    // reading xpAwardedRef, so the very last question (whose call may
    // still be in flight) isn't left out of the session's real total.
    await Promise.all(pendingAnswersRef.current);
    const correctCount = finalOutcomes.filter((o) => o.isCorrect).length;
    await supabase.from("vocabulary_game_sessions").insert({
      profile_id: profile.id,
      game_type: "test",
      total_questions: steps.length,
      correct_count: correctCount,
      xp_awarded: xpAwardedRef.current,
      answers: finalOutcomes.map((o) => ({
        type: o.step.type,
        response: o.responseLabel,
        correct: o.correctLabel,
        isCorrect: o.isCorrect,
      })),
    });
  }

  useEffect(() => {
    if (phase !== "exam" || !timedMode) return;
    if (timeLeft <= 0) {
      Promise.resolve().then(() => finishTest(outcomes));
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timedMode, timeLeft]);

  function startTest(timed: boolean) {
    setTimedMode(timed);
    setTimeLeft(totalSeconds);
    setStepIndex(0);
    setOutcomes([]);
    setPhase("exam");
  }

  function submit(response: unknown, responseLabel: string) {
    if (!profile || answeredThisStep) return;
    const step = steps[stepIndex];
    const isCorrect = gradeTestStep(step, response);
    const correctLabel =
      step.type === "mcq"
        ? step.options[step.correctIndex]
        : step.type === "recall"
          ? step.correctAnswer
          : step.isActuallyCorrect
            ? "נכון"
            : "לא נכון";

    // The outcome (and the "next question" gate) must be recorded
    // synchronously with grading, not after awaiting recordGameAnswer
    // below — otherwise a user who clicks "next" quickly (the button
    // appears the instant answeredThisStep/lastCorrect are set) could
    // advance before that async call resolves, silently dropping this
    // answer from the review list and the session's saved results.
    setAnsweredThisStep(true);
    setLastCorrect(isCorrect);
    setOutcomes((prev) => [...prev, { step, responseLabel, correctLabel, isCorrect }]);
    if (isCorrect) playCorrectSound();
    else playIncorrectSound();

    // XP/SRS bookkeeping can genuinely happen in the background — finishTest
    // awaits every pending one of these before it reads xpAwardedRef, so the
    // final session total is always accurate even if the very last answer's
    // call hasn't resolved yet when the user finishes.
    const pending = recordGameAnswer(profile.id, step.vocabularyItemId, isCorrect, "vocab_game_test").then((xpRes) => {
      xpAwardedRef.current += xpRes.xpAwarded;
    });
    pendingAnswersRef.current.push(pending);
  }

  function submitMcq(index: number) {
    const step = steps[stepIndex];
    if (step.type !== "mcq") return;
    setSelected(index);
    submit(index, step.options[index]);
  }

  function submitRecall() {
    const step = steps[stepIndex];
    if (step.type !== "recall" || !input.trim()) return;
    submit(input, input.trim());
  }

  function submitTrueFalse(answer: boolean) {
    submit(answer, answer ? "נכון" : "לא נכון");
  }

  function nextStep() {
    setAnsweredThisStep(false);
    setLastCorrect(null);
    setSelected(null);
    setInput("");
    const next = stepIndex + 1;
    if (next >= steps.length) {
      finishTest(outcomes);
    } else {
      setStepIndex(next);
    }
  }

  if (phase === "intro") {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">מוכנים למבחן?</h1>
        <p className="mt-2 text-muted">
          {steps.length} שאלות · שילוב של רב-ברירה, השלמת מילה ונכון/לא נכון
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startTest(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            התחילו את המבחן בזמן
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startTest(false)}
            className="px-6 py-3 rounded-xl bg-background-2 text-foreground font-medium border border-card-border hover:bg-card-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            תרגול ללא לחץ (ללא טיימר)
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    const correctCount = outcomes.filter((o) => o.isCorrect).length;
    const accuracy = outcomes.length > 0 ? Math.round((correctCount / outcomes.length) * 100) : 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">המבחן הושלם!</h1>
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
              className={`rounded-2xl border p-4 ${o.isCorrect ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  {o.step.type === "mcq" && `איזו מילה מתאימה ל"${o.step.promptHe}"`}
                  {o.step.type === "recall" && `השלימו את המילה עבור "${o.step.translationHe}"`}
                  {o.step.type === "truefalse" && (
                    <>
                      <EnglishText as="span">{o.step.headword}</EnglishText> = {o.step.shownTranslationHe}?
                    </>
                  )}
                </p>
                {o.isCorrect ? (
                  <CheckCircle2 size={18} className="text-success shrink-0" />
                ) : (
                  <XCircle size={18} className="text-danger shrink-0" />
                )}
              </div>
              <p className="mt-1.5 text-sm">
                <span className="text-muted">התשובה שלכם: </span>
                <EnglishText as="span" className={o.isCorrect ? "text-success" : "text-danger"}>
                  {o.responseLabel || "—"}
                </EnglishText>
                {!o.isCorrect && (
                  <>
                    <span className="text-muted"> · נכון: </span>
                    <EnglishText as="span" className="text-success">
                      {o.correctLabel}
                    </EnglishText>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/test"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            מבחן נוסף
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

  // phase === "exam"
  const step = steps[stepIndex];
  const lowTime = timedMode && timeLeft <= 20;

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="sr-only">מבחן תרגול</h1>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted">
            שאלה {stepIndex + 1} מתוך {steps.length}
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
              תרגול · ללא הגבלת זמן
            </span>
          )}
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
            className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
          >
            {step.type === "mcq" && (
              <div>
                <p className="text-sm text-muted">איזו מילה מתאימה לתרגום</p>
                <p className="mt-1 text-2xl font-bold">{step.promptHe}</p>
                <div className="mt-5 space-y-2">
                  {step.options.map((option, i) => {
                    const isCorrectOption = i === step.correctIndex;
                    const isSelected = selected === i;
                    let stateClass = "border-card-border hover:border-primary/40";
                    if (answeredThisStep && isCorrectOption) stateClass = "border-success bg-success/10";
                    else if (answeredThisStep && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
                    else if (isSelected) stateClass = "border-primary bg-primary/5";
                    return (
                      <button
                        key={i}
                        disabled={answeredThisStep}
                        onClick={() => submitMcq(i)}
                        className={`w-full text-right px-4 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${stateClass}`}
                      >
                        <EnglishText>{option}</EnglishText>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step.type === "recall" && (
              <div className="text-center">
                <p className="text-sm text-muted">השלימו את המילה באנגלית עבור</p>
                <p className="mt-1 text-2xl font-bold">{step.translationHe}</p>
                <input
                  type="text"
                  dir="ltr"
                  aria-label={`השלימו את המילה עבור ${step.translationHe}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitRecall()}
                  disabled={answeredThisStep}
                  placeholder="Type the word..."
                  className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
                />
                {!answeredThisStep && (
                  <button
                    onClick={submitRecall}
                    disabled={!input.trim()}
                    className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    בדיקה
                  </button>
                )}
              </div>
            )}

            {step.type === "truefalse" && (
              <div className="text-center">
                <p className="text-sm text-muted">האם זה התרגום הנכון?</p>
                <p className="mt-2 text-2xl font-bold">
                  <EnglishText as="span">{step.headword}</EnglishText> = {step.shownTranslationHe}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    disabled={answeredThisStep}
                    onClick={() => submitTrueFalse(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-success/40 bg-success/5 hover:bg-success/10 font-medium text-success transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50"
                  >
                    <Check size={16} /> נכון
                  </button>
                  <button
                    disabled={answeredThisStep}
                    onClick={() => submitTrueFalse(false)}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-danger/40 bg-danger/5 hover:bg-danger/10 font-medium text-danger transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50"
                  >
                    <X size={16} /> לא נכון
                  </button>
                </div>
              </div>
            )}

            {answeredThisStep && lastCorrect !== null && (
              <>
                <div
                  role="status"
                  className={`mt-4 flex items-center justify-center gap-1.5 text-sm font-medium ${
                    lastCorrect ? "text-success" : "text-danger"
                  }`}
                >
                  {lastCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {lastCorrect ? "תשובה נכונה!" : "לא בדיוק"}
                </div>
                {!lastCorrect && outcomes.length > 0 && (
                  <p className="mt-1 text-center text-sm text-danger">
                    התשובה הנכונה:{" "}
                    <span className="font-medium">{outcomes[outcomes.length - 1].correctLabel}</span>
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
