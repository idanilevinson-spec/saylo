"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, CornerDownLeft, RotateCcw, Trophy, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/components/course/useCourseProgress";
import { GameHud, GameStage, type RoundResult } from "@/components/games/GameKit";
import HeartsGate from "@/components/HeartsGate";
import McqQuestion from "@/components/McqQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import ReorderQuestion from "@/components/ReorderQuestion";
import FillBlankExplanation from "@/components/FillBlankExplanation";
import EnglishText from "@/components/EnglishText";
import IconBadge from "@/components/IconBadge";
import { startAttempt } from "@/lib/exercises/recordAttempt";
import { correctAnswerLabel } from "@/lib/exercises/correctAnswerLabel";
import { awardXp } from "@/lib/gamification/xp";
import { playCompleteSound, playCorrectSound, playIncorrectSound } from "@/lib/sound/effects";
import { UNIT_CHECK_PASS, UNIT_CHECK_XP, UNIT_CHECK_XP_PREFIX } from "@/lib/content/course";
import { getUnitCheckExercises } from "@/lib/content/courseProgress";
import { EASE_OUT } from "@/lib/motion/easing";
import type { Exercise } from "@/types/database";
import type { FillBlankContent } from "@/types/exercises";

// The end of a unit: a short mixed check on its words and grammar. Each
// answer is a real attempt (it counts toward the topics, the mistakes
// notebook and XP as anywhere else); passing records the unit as done.
export default function UnitCheckPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const { profile } = useAuth();
  const course = useCourseProgress();
  const progress = course?.units.find((u) => u.unit.id === unitId) ?? null;
  const unitIndex = course?.units.findIndex((u) => u.unit.id === unitId) ?? -1;
  const nextUnit = course && unitIndex >= 0 ? (course.units[unitIndex + 1] ?? null) : null;

  const [questions, setQuestions] = useState<Exercise[] | null>(null);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (!progress) return;
    let live = true;
    getUnitCheckExercises(progress).then((qs) => {
      if (!live) return;
      setQuestions(qs);
      setResults(qs.map(() => null));
      setIndex(0);
      setAnswered(null);
      recorded.current = false;
    });
    return () => {
      live = false;
    };
    // A new round draws a fresh set; progress itself only loads once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.unit.id, round]);

  const total = questions?.length ?? 0;
  const finished = questions !== null && total > 0 && index >= total;
  const correct = results.filter((r) => r === "correct").length;
  const passed = finished && correct / total >= UNIT_CHECK_PASS;

  // Record a pass once; a unit already passed isn't awarded again.
  useEffect(() => {
    if (!finished || !profile || !progress || recorded.current) return;
    recorded.current = true;
    playCompleteSound();
    if (passed && !progress.checkPassed) {
      void awardXp(profile.id, `${UNIT_CHECK_XP_PREFIX}${progress.unit.id}`, UNIT_CHECK_XP).catch(() => undefined);
    }
  }, [finished, passed, profile, progress]);

  const goNext = () => {
    setAnswered(null);
    setIndex((i) => i + 1);
  };

  // A right answer moves on by itself; a wrong one waits for the learner.
  useEffect(() => {
    if (answered !== true) return;
    const timer = setTimeout(goNext, 1000);
    return () => clearTimeout(timer);
  }, [answered]);

  if (!course || questions === null) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">מכינים את הבדיקה...</div>;
  }

  if (!progress) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">היחידה לא נמצאה</h1>
        <Link href="/course" className="mt-6 inline-block font-medium text-primary hover:underline">
          למפת המסלול ←
        </Link>
      </div>
    );
  }

  const unitHref = `/course/${progress.unit.id}`;

  if (total === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">עוד אין שאלות לבדיקה של היחידה הזו</h1>
        <Link href={unitHref} className="mt-6 inline-block font-medium text-primary hover:underline">
          חזרה ליחידה ←
        </Link>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((correct / total) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, transform: "scale(0.85)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <IconBadge icon={passed ? Trophy : RotateCcw} tone={passed ? "success" : "accent"} />
        </motion.div>
        <h1 className="text-3xl font-black tracking-tight">{passed ? "היחידה הושלמה" : "כמעט שם"}</h1>
        <p className="mt-2 text-lg font-bold">{progress.unit.titleHe}</p>
        <p className="mt-4 text-muted tabular-nums">
          {correct} מתוך {total} נכונות ({percent}%).{" "}
          {passed
            ? progress.checkPassed
              ? "עברתם שוב."
              : `קיבלתם ${UNIT_CHECK_XP} XP על היחידה.`
            : `כדי לעבור צריך ${Math.round(UNIT_CHECK_PASS * 100)}%. כדאי לחזור על השלבים שהיו קשים ולנסות שוב.`}
        </p>
        <span className="mt-6 flex justify-center gap-1" aria-hidden="true">
          {results.map((r, i) => (
            <span key={i} className={`h-2 w-6 rounded-full ${r === "correct" ? "bg-success" : "bg-danger"}`} />
          ))}
        </span>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {passed && nextUnit ? (
            <Link
              href={`/course/${nextUnit.unit.id}`}
              className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              ליחידה הבאה: {nextUnit.unit.titleHe}
              <ChevronLeft size={17} aria-hidden="true" />
            </Link>
          ) : (
            !passed && (
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <RotateCcw size={16} aria-hidden="true" />
                לנסות שוב
              </button>
            )
          )}
          <Link
            href={unitHref}
            className="inline-flex items-center justify-center min-h-12 px-6 rounded-lg border border-card-border bg-card font-bold hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            חזרה ליחידה
          </Link>
        </div>
      </div>
    );
  }

  const exercise = questions[index];

  function handleSubmit(response: Record<string, unknown>) {
    if (!profile || answered !== null) return;
    const attempt = startAttempt(profile.id, exercise, response);
    setAnswered(attempt.isCorrect);
    setResults((rs) => rs.map((r, i) => (i === index ? (attempt.isCorrect ? "correct" : "wrong") : r)));
    if (attempt.isCorrect) playCorrectSound();
    else playIncorrectSound();
    attempt.done.catch(() => undefined);
  }

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title={`בדיקת יחידה · ${progress.unit.titleHe}`}
          subtitle={`שאלה ${index + 1} מתוך ${total}`}
          results={results}
          current={index}
          exitHref={unitHref}
          exitLabel="חזרה ליחידה"
        />
        <GameStage stageKey={`${round}-${exercise.id}`}>
          {exercise.type === "mcq" && <McqQuestion content={exercise.content} disabled={answered !== null} onSubmit={handleSubmit} />}
          {exercise.type === "fill_blank" && (
            <FillBlankQuestion content={exercise.content} disabled={answered !== null} onSubmit={handleSubmit} />
          )}
          {exercise.type === "reorder" && (
            <ReorderQuestion content={exercise.content} disabled={answered !== null} onSubmit={handleSubmit} />
          )}

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
                (exercise.type === "fill_blank" ? (
                  <FillBlankExplanation content={exercise.content as unknown as FillBlankContent} />
                ) : (
                  <p className="mt-1 text-sm">
                    התשובה הנכונה: <EnglishText className="font-bold">{correctAnswerLabel(exercise.type, exercise.content)}</EnglishText>
                  </p>
                ))}
            </motion.div>
          )}

          {answered === false && (
            <button
              type="button"
              autoFocus
              onClick={goNext}
              className="game-press mt-5 w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              {index + 1 < total ? "לשאלה הבאה" : "לתוצאה"}
              <CornerDownLeft size={16} aria-hidden="true" />
            </button>
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}
