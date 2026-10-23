"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Play, Trophy } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { KIND_META } from "@/components/dashboard/TodayAtLevel";
import StepTrack from "@/components/course/StepTrack";
import { useCourseProgress } from "@/components/course/useCourseProgress";
import { UNIT_CHECK_PASS, UNIT_CHECK_QUESTIONS, unitsForLevel } from "@/lib/content/course";
import { nextInUnit, type ResolvedStep, type UnitProgress } from "@/lib/content/courseProgress";
import { setActiveUnit, stepPath } from "@/lib/content/courseSession";

export default function CourseUnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const course = useCourseProgress();

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16" aria-busy="true">
        <div className="h-5 w-32 rounded bg-background-2 animate-pulse" />
        <div className="mt-6 h-28 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const index = course.units.findIndex((u) => u.unit.id === unitId);
  const progress = course.units[index];
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

  const { unit, number } = progress;
  const next = nextInUnit(progress);
  const prevUnit = course.units[index - 1] ?? null;
  const nextUnit = course.units[index + 1] ?? null;
  const levelSize = unitsForLevel(unit.level).length;

  const remember = () =>
    setActiveUnit({
      id: unit.id,
      number,
      level: unit.level,
      titleHe: unit.titleHe,
      paths: progress.steps.map((s) => stepPath(s.href)),
    });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <Link
        href="/course"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <ChevronRight size={16} aria-hidden="true" />
        המסלול שלי
      </Link>

      {/* The unit */}
      <header className="lit-plate relative mt-4 overflow-hidden rounded-lg border border-card-border bg-card p-6 sm:p-7">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <div className="flex items-start gap-4">
          <span className="chyron shrink-0 text-5xl leading-[0.85] text-primary" dir="ltr">
            {unit.level}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{unit.titleHe}</h1>
            <p className="mt-1 text-sm text-muted tabular-nums">
              יחידה {number} מתוך {levelSize}
            </p>
          </div>
        </div>
        <p className="mt-4 leading-relaxed">
          <span className="font-bold">בסוף היחידה תוכלו </span>
          {unit.goalHe}.
        </p>
        <p className="mt-4 flex items-center gap-2.5 text-sm text-muted tabular-nums">
          <StepTrack progress={progress} />
          <span>
            {progress.done} מתוך {progress.total} שלבים הושלמו
            {progress.inProgress > 0 && <span className="text-primary-hover"> · {progress.inProgress} בתהליך</span>}
          </span>
        </p>
      </header>

      {progress.checkPassed && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-success/35 bg-success/[0.06] p-4" role="status">
          <Trophy size={20} aria-hidden="true" className="shrink-0 text-success-hover" />
          <p className="flex-1 font-bold text-success-hover">עברתם את בדיקת היחידה. היחידה הושלמה.</p>
          {nextUnit && (
            <Link
              href={`/course/${nextUnit.unit.id}`}
              className="game-press inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-ink hover:bg-primary-hover transition-[background-color,transform] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              ליחידה הבאה
              <ChevronLeft size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      {/* Steps, then the check */}
      <ol className="mt-6 space-y-2">
        {progress.steps.map((step, i) => (
          <li key={`${step.kind}:${step.ref}`}>
            <StepRow step={step} index={i + 1} isNext={next === step} onOpen={remember} />
          </li>
        ))}
        <li>
          <CheckRow progress={progress} isNext={next === "check"} />
        </li>
      </ol>

      {/* Neighbouring units */}
      <nav aria-label="יחידות סמוכות" className="mt-10 grid grid-cols-2 gap-3 text-sm">
        {prevUnit ? (
          <Link
            href={`/course/${prevUnit.unit.id}`}
            className="lit-plate lit-hover flex items-center gap-2 rounded-lg border border-card-border p-3 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-muted" />
            <span className="min-w-0">
              <span className="block text-xs text-muted">היחידה הקודמת</span>
              <span className="block font-bold truncate">{prevUnit.unit.titleHe}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextUnit && (
          <Link
            href={`/course/${nextUnit.unit.id}`}
            className="lit-plate lit-hover flex items-center justify-end gap-2 rounded-lg border border-card-border p-3 text-left hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="min-w-0 text-right">
              <span className="block text-xs text-muted">
                {nextUnit.unit.level !== unit.level ? `הרמה הבאה · ${nextUnit.unit.level}` : "היחידה הבאה"}
              </span>
              <span className="block font-bold truncate">{nextUnit.unit.titleHe}</span>
            </span>
            <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-muted" />
          </Link>
        )}
      </nav>
    </div>
  );
}

function StatusIcon({ status }: { status: ResolvedStep["status"] }) {
  if (status === "done") return <CheckCircle2 size={20} aria-hidden="true" className="text-success-hover" />;
  return null;
}

function StepRow({ step, index, isNext, onOpen }: { step: ResolvedStep; index: number; isNext: boolean; onOpen: () => void }) {
  const meta = KIND_META[step.kind];
  const statusLabel = step.status === "done" ? "הושלם" : step.status === "started" ? "בתהליך" : null;
  return (
    <Link
      href={step.href}
      onClick={onOpen}
      className={`game-press lit-plate lit-hover group flex items-center gap-4 rounded-lg border p-4 duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
        isNext ? "border-primary/60 bg-card" : "border-card-border bg-card hover:bg-background-2"
      }`}
    >
      <span
        className={`inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg ${
          step.status === "done" ? "bg-success/12 text-success-hover" : "bg-primary/10 text-primary-hover"
        }`}
      >
        <meta.icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 text-xs font-bold text-muted">
          <span className="sr-only">שלב {index}:</span>
          {meta.label}
          <span className="inline-flex items-center gap-1 font-medium tabular-nums">
            <Clock size={12} aria-hidden="true" />
            {step.minutes} דק׳
          </span>
          {statusLabel && (
            <span className={step.status === "done" ? "text-success-hover" : "text-primary-hover"}>· {statusLabel}</span>
          )}
        </span>
        <span className="mt-0.5 block font-bold leading-snug">{step.titleHe}</span>
        {/* Grammar topics are often named in English already. */}
        {step.titleEn && step.titleEn.toLowerCase() !== step.titleHe.toLowerCase() && (
          <EnglishText as="span" className="block text-right text-sm text-muted truncate">
            {step.titleEn}
          </EnglishText>
        )}
      </span>
      {isNext ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-ink">
          <Play size={13} aria-hidden="true" className="fill-current" />
          <span className="hidden sm:inline">{step.status === "started" ? "להמשיך" : "להתחיל"}</span>
        </span>
      ) : step.status === "done" ? (
        <StatusIcon status={step.status} />
      ) : (
        <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
      )}
    </Link>
  );
}

function CheckRow({ progress, isNext }: { progress: UnitProgress; isNext: boolean }) {
  return (
    <Link
      href={`/course/${progress.unit.id}/check`}
      className={`game-press lit-row group flex items-center gap-4 rounded-lg border border-dashed p-4 duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
        isNext ? "border-primary bg-primary/[0.06]" : "border-card-border hover:bg-card"
      }`}
    >
      <span
        className={`inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg ${
          progress.checkPassed ? "bg-success/12 text-success-hover" : "bg-primary/10 text-primary-hover"
        }`}
      >
        <ClipboardCheck size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">בדיקת יחידה</span>
        <span className="block text-sm text-muted">
          {progress.checkPassed
            ? "עברתם. אפשר לחזור עליה מתי שתרצו"
            : `${UNIT_CHECK_QUESTIONS} שאלות על המילים והדקדוק של היחידה. עוברים מ-${Math.round(UNIT_CHECK_PASS * 100)}%`}
        </span>
      </span>
      {isNext ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-ink">
          <Play size={13} aria-hidden="true" className="fill-current" />
          <span className="hidden sm:inline">לבדיקה</span>
        </span>
      ) : progress.checkPassed ? (
        <CheckCircle2 size={20} aria-hidden="true" className="shrink-0 text-success-hover" />
      ) : (
        <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
      )}
    </Link>
  );
}
