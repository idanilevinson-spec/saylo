"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Timer, Trophy, CheckCircle2, XCircle, Check, X, RotateCcw, CornerDownLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { gradeTestStep, type TestStep } from "@/lib/games/testContent";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import { GameCompletionScore } from "@/components/games/GameMoments";
import { ChoiceGrid, GameHud, GameStage, type RoundResult } from "@/components/games/GameKit";

interface VocabTestProps {
  steps: TestStep[];
  // Back to the topic picker for another test. A link to /games/test would
  // keep this finished screen up (pages are keyed by pathname).
  onRestart: () => void;
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
export default function VocabTest({ steps, onRestart }: VocabTestProps) {
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

  // A correct answer moves on by itself after a beat, so it doesn't feel
  // abrupt. A wrong answer keeps "השאלה הבאה" as a deliberate click, so
  // the learner has to actually look at what they got wrong.
  useEffect(() => {
    if (!answeredThisStep || lastCorrect !== true) return;
    const timer = setTimeout(nextStep, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredThisStep, lastCorrect]);

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
            className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            התחילו את המבחן בזמן
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startTest(false)}
            className="px-6 py-3 rounded-lg bg-background-2 text-foreground font-medium border border-card-border hover:bg-card-border/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
        <GameCompletionScore>{accuracy}%</GameCompletionScore>
        <p className="mt-1 text-muted">
          <EnglishText as="span" className="font-bold">
            {correctCount}/{outcomes.length}
          </EnglishText>{" "}
          נכונות
        </p>

        <div className="mt-6 space-y-3 text-right">
          {outcomes.map((o, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 ${o.isCorrect ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5"}`}
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
          <button
            type="button"
            onClick={onRestart}
            className="game-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <RotateCcw size={16} aria-hidden="true" /> מבחן נוסף
          </button>
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games"
            className="px-6 py-3 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
  const results: RoundResult[] = steps.map((_, i) => (i < outcomes.length ? (outcomes[i].isCorrect ? "correct" : "wrong") : null));
  const last = answeredThisStep ? outcomes[outcomes.length - 1] : null;

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title="מבחן תרגול"
          subtitle={timedMode ? undefined : "תרגול בלי הגבלת זמן"}
          results={results}
          current={stepIndex}
          aside={
            timedMode ? (
              <div className="shrink-0 flex items-center gap-1.5" aria-label={`נותר ${formatTime(timeLeft)}`}>
                <Timer size={16} aria-hidden="true" className={lowTime ? "text-danger" : "text-muted"} />
                <span aria-hidden="true" className={`chyron text-3xl tabular-nums ${lowTime ? "text-danger" : "text-foreground"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : undefined
          }
        />

        <GameStage stageKey={stepIndex}>
          {step.type === "mcq" && (
            <>
              <p className="text-sm text-muted">איזו מילה באנגלית מתאימה?</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">{step.promptHe}</p>
              <div className="mt-5">
                <ChoiceGrid
                  options={step.options}
                  correctIndex={step.correctIndex}
                  selected={selected}
                  locked={answeredThisStep}
                  onChoose={submitMcq}
                />
              </div>
            </>
          )}

          {step.type === "recall" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitRecall();
              }}
              className="text-center"
            >
              <p className="text-sm text-muted">איך כותבים באנגלית</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">{step.translationHe}</p>
              <input
                type="text"
                {...ENGLISH_WORD_INPUT}
                autoFocus
                aria-label={`איך כותבים באנגלית ${step.translationHe}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={answeredThisStep}
                placeholder="Type the word"
                className={`mt-6 w-full min-h-12 px-4 rounded-lg border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-90 placeholder:text-muted ${
                  last ? (last.isCorrect ? "border-success text-success" : "game-shake border-danger text-danger") : "border-card-border"
                }`}
              />
              {!answeredThisStep && (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="game-press mt-3 w-full min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  בדיקה
                </button>
              )}
            </form>
          )}

          {step.type === "truefalse" && (
            <div className="text-center">
              <p className="text-sm text-muted">האם זה התרגום הנכון?</p>
              <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 text-2xl sm:text-3xl font-bold">
                <EnglishText>{step.headword}</EnglishText>
                <span className="text-muted font-normal">=</span>
                <span>{step.shownTranslationHe}</span>
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[true, false].map((answer) => {
                  const chosen = last && last.responseLabel === (answer ? "נכון" : "לא נכון");
                  const isRight = answer === step.isActuallyCorrect;
                  return (
                    <button
                      key={String(answer)}
                      type="button"
                      disabled={answeredThisStep}
                      onClick={() => submitTrueFalse(answer)}
                      className={`game-press flex items-center justify-center gap-2 min-h-14 px-4 rounded-lg border-2 font-bold text-lg transition-[background-color,border-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                        answeredThisStep
                          ? isRight
                            ? "border-success bg-success/10 text-success"
                            : chosen
                              ? "game-shake border-danger bg-danger/10 text-danger"
                              : "border-card-border opacity-50"
                          : answer
                            ? "border-success/40 text-success hover:bg-success/10"
                            : "border-danger/40 text-danger hover:bg-danger/10"
                      }`}
                    >
                      {answer ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
                      {answer ? "נכון" : "לא נכון"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {last && (
            <motion.div
              role="status"
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`mt-5 rounded-lg border p-4 ${last.isCorrect ? "border-success/35 bg-success/[0.06]" : "border-danger/35 bg-danger/[0.05]"}`}
            >
              <p className={`flex items-center gap-1.5 font-bold ${last.isCorrect ? "text-success" : "text-danger"}`}>
                {last.isCorrect ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}
                {last.isCorrect ? "תשובה נכונה" : "לא בדיוק"}
              </p>
              {!last.isCorrect && (
                <p className="mt-1.5 text-sm">
                  <span className="text-muted">התשובה הנכונה: </span>
                  {step.type === "truefalse" ? (
                    <span className="font-bold">{last.correctLabel}</span>
                  ) : (
                    <EnglishText className="font-bold">{last.correctLabel}</EnglishText>
                  )}
                </p>
              )}
              {!last.isCorrect && (
                <button
                  type="button"
                  autoFocus
                  onClick={nextStep}
                  className="game-press mt-4 w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {stepIndex + 1 < steps.length ? "לשאלה הבאה" : "סיום המבחן"}
                  <CornerDownLeft size={15} aria-hidden="true" className="opacity-70 hidden sm:inline" />
                </button>
              )}
            </motion.div>
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}
