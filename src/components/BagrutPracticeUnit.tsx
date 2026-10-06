"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, Eye, Headphones, BookOpenText, PenLine, Timer, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import EnglishText from "@/components/EnglishText";
import ListeningPlayer from "@/components/ListeningPlayer";
import type { BagrutSampleUnit, BagrutReadingQuestion, BagrutVocabularyQuestion } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_AI_CONTENT_DISCLAIMER } from "@/lib/content/bagrut/sampleUnits";
import type { BagrutModuleFormat } from "@/lib/content/bagrut/moduleFormats";

interface BagrutPracticeUnitProps {
  unit: BagrutSampleUnit;
  format: BagrutModuleFormat;
}

// Self-check, not auto-graded: multiple-choice reveals correct/incorrect on
// selection; open and sentence-completion questions reveal a model answer
// on demand (there's no automated grading for free text here — that would
// need an AI call this v1 deliberately doesn't add, see
// docs/specs/bagrut-track.md §6). The writing task is just a counted
// textarea, not submitted or graded anywhere.
// Multiple-choice questions are the only ones with a right answer to count,
// so they're what a practice set's score is made of. Keyed by section so the
// same index in two sections doesn't collide.
function mcKeys(unit: BagrutSampleUnit): string[] {
  const keys: string[] = [];
  unit.listeningTask?.questions.forEach((q, i) => q.options && keys.push(`L${i}`));
  unit.readingQuestions.forEach((q, i) => q.options && keys.push(`R${i}`));
  unit.vocabularyQuestions?.forEach((q, i) => q.options && keys.push(`V${i}`));
  return keys;
}

export default function BagrutPracticeUnit({ unit, format }: BagrutPracticeUnitProps) {
  const isLiterature = unit.moduleCode === "D";
  const { profile } = useAuth();
  const [results, setResults] = useState<Record<string, boolean>>({});
  const savedRef = useRef(false);
  const keys = mcKeys(unit);
  const answered = keys.filter((k) => k in results).length;
  const correct = keys.filter((k) => results[k]).length;
  const finished = keys.length > 0 && answered === keys.length;

  function record(key: string, isCorrect: boolean) {
    setResults((r) => (key in r ? r : { ...r, [key]: isCorrect }));
  }

  // Saved once, when the last multiple-choice question is answered. Doing a
  // set again keeps the best score and counts the attempt.
  useEffect(() => {
    if (!finished || !profile || savedRef.current) return;
    savedRef.current = true;
    const percent = Math.round((correct / keys.length) * 100);
    void (async () => {
      const { data: prev } = await supabase
        .from("bagrut_unit_progress")
        .select("best_percent, attempts")
        .eq("profile_id", profile.id)
        .eq("module_code", unit.moduleCode)
        .eq("unit_slug", unit.unitSlug)
        .maybeSingle();
      await supabase.from("bagrut_unit_progress").upsert({
        profile_id: profile.id,
        module_code: unit.moduleCode,
        unit_slug: unit.unitSlug,
        mc_correct: correct,
        mc_total: keys.length,
        best_percent: Math.max(percent, prev?.best_percent ?? 0),
        attempts: (prev?.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      });
    })();
  }, [finished, profile, correct, keys.length, unit.moduleCode, unit.unitSlug]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/bagrut/${unit.moduleCode}`} className="text-sm text-primary">
        ← ערכות התרגול של מודול {unit.moduleCode}
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{unit.titleHe}</h1>
      <p className="mt-1 text-sm text-muted">
        מודול {unit.moduleCode} · {format.percentOfFinalGrade ? `${format.percentOfFinalGrade}% מהציון · ` : ""}
        {format.timeMinutes ? `${format.timeMinutes} דקות` : ""}
      </p>

      {format.timeMinutes && <ExamTimer minutes={format.timeMinutes} />}

      {!unit.teacherReviewed && unit.aiContentDisclosed && (
        <div
          role="alert"
          className="mt-4 flex gap-3 rounded-lg border border-accent/40 bg-accent/[0.07] p-4 text-sm leading-relaxed"
        >
          <AlertTriangle size={18} className="shrink-0 text-accent-hover mt-0.5" />
          <p>{BAGRUT_AI_CONTENT_DISCLAIMER}</p>
        </div>
      )}

      {/* Module D's real exam tests a specific story/poem chosen by the
          Ministry and studied in advance — this practice text is original,
          not an assigned work, so the gap is called out plainly rather than
          left for the learner to assume otherwise. */}
      {isLiterature && (
        <div className="mt-4 flex gap-3 rounded-lg border border-card-border bg-background-2 p-4 text-sm leading-relaxed text-muted">
          <BookOpenText size={18} className="shrink-0 mt-0.5" />
          <p>
            בבחינה האמיתית של מודול D לומדים מראש יצירה ספציפית (סיפור ושיר) שנקבעת על ידי משרד החינוך. הטקסט כאן{" "}
            <strong className="text-foreground">מקורי</strong> ונועד לתרגל את סוג הניתוח הספרותי הנדרש — הוא אינו
            תחליף ללימוד היצירות הרשמיות שנבחרו לבית הספר שלכם.
          </p>
        </div>
      )}

      {unit.listeningTask && (
        <section className="relative overflow-hidden mt-6 bg-card border border-card-border rounded-lg p-6">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted">
            <Headphones size={16} /> הבנת הנשמע
          </h2>
          <div className="mt-3">
            <ListeningPlayer transcriptEn={unit.listeningTask.transcriptEn} />
          </div>
        </section>
      )}

      {unit.listeningTask && (
        <div className="mt-6 space-y-4">
          {unit.listeningTask.questions.map((q, i) => (
            <QuestionCard key={i} index={i + 1} question={q} onAnswer={(c) => record(`L${i}`, c)} />
          ))}
        </div>
      )}

      {unit.readingPassages.map((passage, passageIndex) => (
        <section key={passageIndex} className="relative overflow-hidden mt-6 bg-card border border-card-border rounded-lg p-6">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted">
            <BookOpenText size={16} />
            הבנת הנקרא{unit.readingPassages.length > 1 ? ` — קטע ${passageIndex + 1}` : ""}
          </h2>
          <EnglishText as="div" className="mt-3 leading-relaxed whitespace-pre-line">
            {passage}
          </EnglishText>
        </section>
      ))}

      <div className="mt-6 space-y-4">
        {unit.readingQuestions.map((q, i) => (
          <QuestionCard key={i} index={i + 1} question={q} onAnswer={(c) => record(`R${i}`, c)} />
        ))}
      </div>

      {unit.vocabularyQuestions && unit.vocabularyQuestions.length > 0 && (
        <>
          <h2 className="mt-8 flex items-center gap-2 font-bold text-sm text-muted">
            <BookOpenText size={16} /> אוצר מילים
          </h2>
          <div className="mt-3 space-y-4">
            {unit.vocabularyQuestions.map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q} onAnswer={(c) => record(`V${i}`, c)} />
            ))}
          </div>
        </>
      )}

      {unit.writingTask && (
        <WritingTaskCard promptEn={unit.writingTask.promptEn} wordCountRange={unit.writingTask.wordCountRange} />
      )}

      {keys.length > 0 && (
        <section
          aria-live="polite"
          className={`mt-8 rounded-lg border p-5 ${finished ? "border-primary/40 bg-primary/[0.05]" : "border-card-border bg-card"}`}
        >
          {finished ? (
            <>
              <p className="flex items-center gap-2 font-bold">
                <Trophy size={18} aria-hidden="true" className="text-primary" />
                {correct} מתוך {keys.length} בשאלות הסגורות
              </p>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                {profile ? "נשמר בהתקדמות שלכם בעמוד הבגרות. " : ""}
                את השאלות הפתוחות ואת הכתיבה בודקים לבד מול התשובה לדוגמה.
              </p>
              <Link href={`/bagrut/${unit.moduleCode}`} className="mt-3 inline-block text-sm text-primary hover:underline">
                לערכות האחרות של מודול {unit.moduleCode} ←
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted tabular-nums">
              נענו {answered} מתוך {keys.length} שאלות סגורות
            </p>
          )}
        </section>
      )}
    </div>
  );
}

// Optional exam conditions: the module's real duration, counting down.
// Nothing locks when it runs out; it only shows where the learner would
// have stood in the real exam.
function ExamTimer({ minutes }: { minutes: number }) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (endsAt === null) {
    return (
      <button
        type="button"
        onClick={() => {
          setNow(Date.now());
          setEndsAt(Date.now() + minutes * 60_000);
        }}
        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-card-border text-sm font-medium hover:border-primary/40 transition-colors"
      >
        <Timer size={15} aria-hidden="true" /> תרגול בזמן של הבחינה ({minutes} דקות)
      </button>
    );
  }

  const left = Math.max(0, endsAt - now);
  const mm = Math.floor(left / 60_000);
  const ss = Math.floor((left % 60_000) / 1000);
  const over = left === 0;
  return (
    <div
      role="timer"
      aria-live="off"
      className={`sticky top-2 z-10 mt-4 flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2 text-sm shadow-sm ${
        over ? "border-danger text-danger" : left < 10 * 60_000 ? "border-accent" : "border-card-border"
      }`}
    >
      <span className="flex items-center gap-1.5 font-medium">
        <Timer size={15} aria-hidden="true" />
        {over ? "הזמן של הבחינה נגמר" : "זמן שנותר"}
      </span>
      <span dir="ltr" className="font-bold tabular-nums text-base">
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </span>
      <button type="button" onClick={() => setEndsAt(null)} className="text-xs text-muted hover:text-foreground">
        עצירה
      </button>
    </div>
  );
}

function QuestionCard({
  index,
  question,
  onAnswer,
}: {
  index: number;
  question: BagrutReadingQuestion | BagrutVocabularyQuestion;
  onAnswer?: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <p className="text-xs text-muted">
        {index}. {question.formatHe}
      </p>
      <EnglishText as="p" className="mt-1.5 font-medium leading-relaxed">
        {question.promptEn}
      </EnglishText>

      {question.options ? (
        <div className="mt-3 flex flex-col gap-2">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrectOption = i === question.correctOptionIndex;
            const showState = selected !== null && (isSelected || isCorrectOption);
            return (
              <button
                key={option}
                onClick={() => {
                  setSelected(i);
                  onAnswer?.(i === question.correctOptionIndex);
                }}
                disabled={selected !== null}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-start transition-colors ${
                  showState && isCorrectOption
                    ? "border-success bg-success-ink"
                    : showState && isSelected
                      ? "border-danger bg-danger-ink"
                      : "border-card-border hover:bg-background-2"
                } ${selected !== null ? "cursor-default" : ""}`}
              >
                <EnglishText as="span">{option}</EnglishText>
              </button>
            );
          })}
          {selected !== null && (
            <p className="mt-1 text-sm text-muted flex items-start gap-1.5">
              {selected === question.correctOptionIndex ? (
                <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle size={15} className="text-danger shrink-0 mt-0.5" />
              )}
              {question.modelAnswerHe}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {showAnswer ? (
            <p className="text-sm text-muted bg-background-2 rounded-lg p-3">{question.modelAnswerHe}</p>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Eye size={14} /> הצגת תשובה לדוגמה
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WritingTaskCard({ promptEn, wordCountRange }: { promptEn: string; wordCountRange: [number, number] }) {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const [min, max] = wordCountRange;
  const inRange = wordCount >= min && wordCount <= max;

  return (
    <section className="relative overflow-hidden mt-8 bg-card border border-card-border rounded-lg p-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
      <h2 className="flex items-center gap-2 font-bold text-sm text-muted">
        <PenLine size={16} /> מטלת כתיבה
      </h2>
      <EnglishText as="p" className="mt-2 leading-relaxed">
        {promptEn}
      </EnglishText>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        dir="ltr"
        lang="en"
        rows={6}
        className="mt-3 w-full px-3 py-2.5 rounded-lg border border-card-border bg-background text-sm font-content focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder="Write your answer here..."
      />
      <p className={`mt-1.5 text-xs ${inRange ? "text-success" : "text-muted"}`}>
        {wordCount} מילים (טווח מבוקש: {min}–{max})
      </p>
      <p className="mt-2 text-xs text-muted">
        הכתיבה כאן לתרגול עצמי בלבד ואינה נשלחת לבדיקה — משוב אוטומטי על כתיבה עשוי להתווסף בהמשך.
      </p>
    </section>
  );
}
