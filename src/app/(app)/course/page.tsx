"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Play } from "lucide-react";
import { useCourseProgress } from "@/components/course/useCourseProgress";
import StepTrack from "@/components/course/StepTrack";
import { COURSE_LEVELS } from "@/lib/content/course";
import type { UnitProgress } from "@/lib/content/courseProgress";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import type { CefrLevel } from "@/types/database";

// The course map: one level at a time, its units in order down a rail.
// Opens on the level of the unit to continue (else the learner's level).
export default function CoursePage() {
  const course = useCourseProgress();
  const [picked, setLevel] = useState<CefrLevel | null>(null);
  const level = picked ?? (course ? (course.current?.unit.level ?? course.level ?? "A1") : null);

  if (!course || !level) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16" aria-busy="true">
        <div className="h-9 w-48 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 h-12 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const units = course.units.filter((u) => u.unit.level === level);
  const finished = units.filter((u) => u.status === "done").length;
  const learnerIndex = course.level ? COURSE_LEVELS.indexOf(course.level) : -1;
  const above = learnerIndex >= 0 && COURSE_LEVELS.indexOf(level) > learnerIndex;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
      <h1 className="text-3xl font-black tracking-tight">המסלול שלי</h1>
      <p className="mt-2 max-w-xl text-muted leading-relaxed">
        כל רמה בנויה מיחידות. ביחידה יש מילים, דקדוק, קריאה או האזנה, שיחה עם המורה ובדיקה קצרה בסוף.
      </p>

      {/* Levels */}
      <div role="tablist" aria-label="רמות" className="mt-6 grid grid-cols-6 gap-1 rounded-xl border border-card-border bg-card p-1" dir="ltr">
        {COURSE_LEVELS.map((l) => {
          const levelUnits = course.units.filter((u) => u.unit.level === l);
          const allDone = levelUnits.length > 0 && levelUnits.every((u) => u.status === "done");
          const selected = l === level;
          return (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setLevel(l)}
              className={`relative flex flex-col items-center justify-center rounded-lg py-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 ${
                selected ? "bg-primary text-primary-ink" : "text-foreground hover:bg-background-2"
              }`}
            >
              <span className="chyron text-xl leading-none">{l}</span>
              <span
                className={`mt-1 h-1 w-1 rounded-full ${
                  l === course.level ? (selected ? "bg-primary-ink" : "bg-primary") : allDone ? (selected ? "bg-primary-ink" : "bg-success") : "bg-transparent"
                }`}
                aria-hidden="true"
              />
              {l === course.level && <span className="sr-only">הרמה שלכם</span>}
              {allDone && <span className="sr-only">הושלמה</span>}
            </button>
          );
        })}
      </div>

      {/* The level */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex items-end gap-4">
          <span className="chyron text-6xl leading-[0.85] text-primary" dir="ltr">
            {level}
          </span>
          <div>
            <h2 className="text-xl font-black tracking-tight">{CEFR_NAME_HE[level]}</h2>
            <p className="text-sm text-muted">
              {level === course.level ? "הרמה שלכם לפי מבחן הרמה" : above ? "מעל הרמה שלכם. אפשר להציץ ולנסות" : `${units.length} יחידות`}
            </p>
          </div>
        </div>
        <div className="min-w-[11rem] flex-1 sm:flex-none sm:w-56">
          <p className="text-sm font-bold tabular-nums">
            {finished} מתוך {units.length} יחידות הושלמו
          </p>
          <div className="mt-2 h-2 rounded-full bg-background-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-success origin-right transition-transform duration-500"
              style={{ transform: `scaleX(${units.length ? finished / units.length : 0})` }}
            />
          </div>
        </div>
      </div>

      {/* Units, in order, down a rail */}
      <ol className="relative mt-8">
        <span aria-hidden="true" className="absolute top-6 bottom-6 start-5 w-px bg-card-border" />
        {units.map((u) => (
          <li key={u.unit.id} className="relative py-1.5">
            <UnitRow progress={u} current={course.current?.unit.id === u.unit.id} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function UnitRow({ progress, current }: { progress: UnitProgress; current: boolean }) {
  const { unit, number, status } = progress;
  const marker =
    status === "done"
      ? "bg-[color-mix(in_srgb,var(--success)_15%,var(--card))] text-success-hover ring-1 ring-success/40"
      : current
        ? "bg-primary text-primary-ink"
        : status === "started"
          ? "bg-card text-primary-hover ring-2 ring-primary"
          : "bg-background-2 text-muted ring-1 ring-card-border";

  return (
    <Link
      href={`/course/${unit.id}`}
      className={`game-press group relative flex items-start gap-4 rounded-lg p-3 sm:p-4 transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
        current ? "border border-primary/60 bg-card" : "border border-transparent hover:bg-card hover:border-card-border"
      }`}
    >
      <span
        className={`relative z-[1] -ms-1 sm:-ms-2 inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg font-black tabular-nums ${marker}`}
        aria-hidden="true"
      >
        {status === "done" ? <Check size={20} strokeWidth={3} /> : number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="sr-only">יחידה {number}:</span>
          <span className="font-bold text-lg leading-snug">{unit.titleHe}</span>
          {status === "done" && <span className="text-xs font-bold text-success-hover">הושלמה</span>}
        </span>
        <span className="mt-0.5 block text-sm text-muted leading-relaxed">{unit.goalHe}</span>
        <span className="mt-2.5 flex items-center gap-2.5 text-xs text-muted tabular-nums">
          <StepTrack progress={progress} />
          {progress.done} מתוך {progress.total}
        </span>
      </span>
      {current ? (
        <span className="hidden sm:inline-flex shrink-0 self-center items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-primary-ink">
          <Play size={14} aria-hidden="true" className="fill-current" />
          {status === "todo" ? "להתחיל" : "להמשיך"}
        </span>
      ) : (
        <ChevronLeft size={18} aria-hidden="true" className="shrink-0 self-center text-muted transition-transform group-hover:-translate-x-0.5" />
      )}
    </Link>
  );
}
