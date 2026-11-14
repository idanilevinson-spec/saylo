"use client";

import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { CRITERIA, PART_POINTS, partName, type OralPart } from "@/lib/bagrut/oralRules";
import type { OralSetFeedback } from "@/lib/bagrut/oralSets";
import { markChanges } from "@/lib/bagrut/oralPick";
import type { RecordedAnswer } from "./OralRecorder";

export type SetResult =
  | { status: "loading" }
  | { status: "error"; message: string; retryable: boolean }
  | { status: "ok"; grade: number; lengthDeduction: number; feedback: OralSetFeedback };

export interface GradedSet {
  setId: string;
  part: OralPart;
  labelHe: string;
  questions: string[];
  answer: RecordedAnswer;
  result: SetResult;
}

export default function OralResults({
  sets,
  examGrade,
  onRetry,
}: {
  sets: GradedSet[];
  examGrade: number | null;
  onRetry: (setId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="oral-total" className="lit-plate relative overflow-hidden rounded-lg border border-card-border bg-card p-6 sm:p-7">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <h2 id="oral-total" className="text-xl font-black tracking-tight">
          הערכה לפי מחוון הבחינה
        </h2>
        {examGrade === null ? (
          <p className="mt-3 text-muted">הציון הכולל יופיע כשכל החלקים ייבדקו.</p>
        ) : (
          <p className="mt-2 flex items-baseline gap-2">
            <span className="chyron text-5xl text-primary tabular-nums">{examGrade}</span>
            <span className="text-muted">מתוך 100</span>
          </p>
        )}
        <ul className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
          {(["A", "B", "C"] as OralPart[]).map((part) => {
            const partSets = sets.filter((s) => s.part === part);
            const done = partSets.every((s) => s.result.status === "ok");
            const avg = done
              ? partSets.reduce((sum, s) => sum + (s.result.status === "ok" ? s.result.grade : 0), 0) / partSets.length
              : null;
            return (
              <li key={part} className="rounded-lg bg-background-2 px-3 py-2">
                <span className="font-bold">{partName(part)}</span>
                <span className="text-muted"> · {PART_POINTS[part]} נקודות</span>
                <span className="block tabular-nums">
                  {avg === null ? "..." : `${Math.round((avg * PART_POINTS[part]) / 100)} מתוך ${PART_POINTS[part]}`}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          זו הערכה של AI לפי המחוון הפומבי של משרד החינוך, לא ציון של בוחן ולא תחזית לציון בבחינה. שטף ובהירות נבדקים כאן
          מהתמלול ומקצב הדיבור בלבד.
        </p>
      </section>

      {sets.map((s) => (
        <SetCard key={s.setId} set={s} onRetry={onRetry} />
      ))}
    </div>
  );
}

function SetCard({ set, onRetry }: { set: GradedSet; onRetry: (setId: string) => void }) {
  const r = set.result;
  return (
    <section aria-labelledby={`set-${set.setId}`} className="lit-plate rounded-lg border border-card-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`set-${set.setId}`} className="text-lg font-black tracking-tight">
          {set.labelHe}
        </h3>
        {r.status === "ok" && (
          <span className="tabular-nums">
            <span className="text-2xl font-black">{r.grade}</span>
            <span className="text-sm text-muted"> / 100</span>
          </span>
        )}
      </div>

      {r.status === "loading" && (
        <div className="mt-4" role="status">
          <div className="working-sweep h-1 rounded-full bg-background-2" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted">בודקים את התשובה לפי המחוון...</p>
        </div>
      )}

      {r.status === "error" && (
        <div className="mt-4 text-sm">
          <p role="alert" className="text-danger-hover">
            {r.message}
          </p>
{r.retryable && (
          <button
            type="button"
            onClick={() => onRetry(set.setId)}
            className="mt-2 inline-flex items-center gap-1.5 font-bold text-primary-hover hover:underline"
          >
            <RotateCcw size={14} aria-hidden="true" /> לבדוק שוב
          </button>
          )}
        </div>
      )}

      {r.status === "ok" && (
        <>
          {r.feedback.missedQuestions.length > 0 && (
            <div className="mt-4 flex gap-2.5 rounded-lg bg-danger/10 px-4 py-3 text-sm">
              <AlertTriangle size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-danger-hover" />
              <div>
                <p className="font-bold text-danger-hover">לא עניתם על כל השאלות בקבוצה. בבחינה זה עולה בנקודות.</p>
                <ul className="mt-1 space-y-0.5">
                  {r.feedback.missedQuestions.map((i) => (
                    <li key={i}>
                      שאלה {i + 1}: <EnglishText>{set.questions[i]}</EnglishText>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {r.lengthDeduction > 0 && (
            <p className="mt-4 rounded-lg bg-background-2 px-4 py-3 text-sm">
              התשובה הייתה קצרה מדקה, ולכן ירדו {Math.round(r.lengthDeduction * 100)}% מהציון על פיתוח הנושא.
            </p>
          )}

          <dl className="mt-5 space-y-4">
            {CRITERIA.map((c) => (
              <div key={c.key}>
                <dt className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold">
                    {c.labelHe} <span className="font-normal text-muted">({c.weight}%)</span>
                  </span>
                  <span className="tabular-nums">{r.feedback.scores[c.key]}</span>
                </dt>
                <dd>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background-2" aria-hidden="true">
                    <div
                      className="h-full w-full origin-right bg-primary"
                      style={{ transform: `scaleX(${r.feedback.scores[c.key] / 100})` }}
                    />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.feedback.notesHe[c.key]}</p>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-bold">מה אמרתם</h4>
              <EnglishText as="p" className="mt-1.5 rounded-lg bg-background-2 px-4 py-3 text-sm leading-relaxed">
                {set.answer.transcript}
              </EnglishText>
            </div>
            <div>
              <h4 className="text-sm font-bold">אותה תשובה, ברמה הבאה</h4>
              <EnglishText as="p" className="mt-1.5 rounded-lg border border-primary/40 px-4 py-3 text-sm leading-relaxed">
                {markChanges(set.answer.transcript, r.feedback.nextLevelAnswer).map((m, i) => (
                  <span key={i}>
                    {m.changed ? <mark className="rounded-sm bg-primary/15 px-0.5 text-foreground">{m.word}</mark> : m.word}{" "}
                  </span>
                ))}
              </EnglishText>
              <p className="mt-1 text-xs text-muted">מה שהשתנה מסומן. הרעיונות שלכם, בניסוח שמקבל יותר נקודות.</p>
            </div>
          </div>

          {r.feedback.patterns.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold">טעויות שדוברי עברית עושים הרבה</h4>
              <ul className="mt-2 divide-y divide-card-border">
                {r.feedback.patterns.map((p, i) => (
                  <li key={i} className="py-2.5 text-sm">
                    <p>
                      <EnglishText className="text-danger-hover line-through decoration-1">{p.said}</EnglishText>
                      <ArrowLeft size={14} aria-hidden="true" className="mx-1.5 inline text-muted" />
                      <span className="sr-only"> במקום זה: </span>
                      <EnglishText className="font-bold text-success-hover">{p.better}</EnglishText>
                    </p>
                    <p className="mt-0.5 text-muted">{p.whyHe}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
