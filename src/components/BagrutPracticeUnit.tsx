"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, Eye } from "lucide-react";
import EnglishText from "@/components/EnglishText";
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
export default function BagrutPracticeUnit({ unit, format }: BagrutPracticeUnitProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/bagrut" className="text-sm text-primary">
        ← כל המודולים
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{unit.titleHe}</h1>
      <p className="mt-1 text-sm text-muted">
        מודול {unit.moduleCode} · {format.percentOfFinalGrade ? `${format.percentOfFinalGrade}% מהציון · ` : ""}
        {format.timeMinutes ? `${format.timeMinutes} דקות` : ""}
      </p>

      {!unit.teacherReviewed && unit.aiContentDisclosed && (
        <div
          role="alert"
          className="mt-4 flex gap-3 rounded-lg border border-accent/40 bg-accent/[0.07] p-4 text-sm leading-relaxed"
        >
          <AlertTriangle size={18} className="shrink-0 text-accent-hover mt-0.5" />
          <p>{BAGRUT_AI_CONTENT_DISCLAIMER}</p>
        </div>
      )}

      <section className="mt-6 bg-card border border-card-border rounded-lg p-6">
        <h2 className="font-bold text-sm text-muted">הבנת הנקרא</h2>
        <EnglishText as="div" className="mt-3 leading-relaxed whitespace-pre-line">
          {unit.readingBodyEn}
        </EnglishText>
      </section>

      <div className="mt-6 space-y-4">
        {unit.readingQuestions.map((q, i) => (
          <QuestionCard key={i} index={i + 1} question={q} />
        ))}
      </div>

      {unit.vocabularyQuestions && unit.vocabularyQuestions.length > 0 && (
        <>
          <h2 className="mt-8 font-bold text-sm text-muted">אוצר מילים</h2>
          <div className="mt-3 space-y-4">
            {unit.vocabularyQuestions.map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q} />
            ))}
          </div>
        </>
      )}

      {unit.writingTask && <WritingTaskCard promptEn={unit.writingTask.promptEn} wordCountRange={unit.writingTask.wordCountRange} />}
    </div>
  );
}

function QuestionCard({ index, question }: { index: number; question: BagrutReadingQuestion | BagrutVocabularyQuestion }) {
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
                onClick={() => setSelected(i)}
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
    <section className="mt-8 bg-card border border-card-border rounded-lg p-6">
      <h2 className="font-bold text-sm text-muted">מטלת כתיבה</h2>
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
