"use client";

import Link from "next/link";
import { ClipboardCheck, Map, Play, Trophy } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import StepTrack from "@/components/course/StepTrack";
import { KIND_META, SkillLevelGrid } from "@/components/dashboard/TodayAtLevel";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { nextInUnit, type CourseProgress } from "@/lib/content/courseProgress";
import { setActiveUnit, stepPath } from "@/lib/content/courseSession";
import type { LevelPlan } from "@/lib/content/levelPlan";
import type { CefrLevel } from "@/types/database";

// The home page's lead: where the learner is in the course and the one
// next thing to do there, on the blue level plate.
export default function CourseLead({
  course,
  level,
  bySkill,
}: {
  course: CourseProgress;
  level: CefrLevel;
  bySkill: LevelPlan["bySkill"];
}) {
  const current = course.current;
  const next = current ? nextInUnit(current) : null;
  const levelUnits = current ? course.units.filter((u) => u.unit.level === current.unit.level) : [];
  const levelDone = levelUnits.filter((u) => u.status === "done").length;

  const nextHref = !current ? "/course" : next === "check" || next === null ? `/course/${current.unit.id}/check` : next.href;
  const remember = () => {
    if (!current) return;
    setActiveUnit({
      id: current.unit.id,
      number: current.number,
      level: current.unit.level,
      titleHe: current.unit.titleHe,
      paths: current.steps.map((s) => stepPath(s.href)),
    });
  };

  return (
    <section aria-labelledby="course-lead-title" className="mt-6 relative overflow-hidden rounded-lg bg-primary text-primary-ink">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to left, black, transparent 75%)",
        }}
      />
      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-5">
          <div className="shrink-0 text-center">
            <span className="chyron block text-7xl sm:text-8xl leading-[0.85]" dir="ltr">
              {current?.unit.level ?? level}
            </span>
            <span className="mt-1 block text-xs font-bold text-primary-ink/90">{CEFR_NAME_HE[current?.unit.level ?? level]}</span>
          </div>

          {current ? (
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary-ink/90 tabular-nums">
                יחידה {current.number} · {levelDone} מתוך {levelUnits.length} יחידות ברמה הושלמו
              </p>
              <h2 id="course-lead-title" className="mt-1 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {current.unit.titleHe}
              </h2>
              <p className="mt-1.5 max-w-md text-primary-ink/90 leading-relaxed">בסוף היחידה תוכלו {current.unit.goalHe}.</p>

              <p className="mt-4 flex items-center gap-2.5 text-sm font-bold text-primary-ink/90 tabular-nums">
                <StepTrack progress={current} onField />
                <span>
                  {current.done} מתוך {current.total} הושלמו
                  {current.inProgress > 0 && <> · {current.inProgress} בתהליך</>}
                </span>
              </p>

              {next && next !== "check" && (
                <p className="mt-3 flex items-center gap-2 text-sm">
                  {(() => {
                    const Icon = KIND_META[next.kind].icon;
                    return <Icon size={15} aria-hidden="true" className="shrink-0" />;
                  })()}
                  <span className="font-bold">{KIND_META[next.kind].label}:</span>
                  <span className="truncate">
                    {next.titleEn ? <EnglishText>{next.titleEn}</EnglishText> : next.titleHe}
                  </span>
                </p>
              )}
              {next === "check" && (
                <p className="mt-3 flex items-center gap-2 text-sm">
                  <ClipboardCheck size={15} aria-hidden="true" />
                  <span className="font-bold">כל השלבים הושלמו. נשארה בדיקת היחידה</span>
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={nextHref}
                  onClick={remember}
                  className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                >
                  <Play size={16} aria-hidden="true" className="fill-current" />
                  {current.status === "todo" ? "להתחיל את היחידה" : next === "check" ? "לבדיקת היחידה" : "להמשיך"}
                </Link>
                <Link
                  href="/course"
                  className="inline-flex items-center gap-1.5 font-bold underline underline-offset-4 decoration-primary-ink/40 hover:decoration-primary-ink rounded focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                >
                  <Map size={16} aria-hidden="true" />
                  כל המסלול
                </Link>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h2 id="course-lead-title" className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                סיימתם את המסלול
              </h2>
              <p className="mt-1.5 max-w-md text-primary-ink/90 leading-relaxed">
                כל היחידות מהרמה שלכם ומעלה הושלמו. אפשר לחזור לכל יחידה מהמפה.
              </p>
              <Link
                href="/course"
                className="game-press mt-5 inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
              >
                <Trophy size={16} aria-hidden="true" />
                למפת המסלול
              </Link>
            </div>
          )}
        </div>

        <SkillLevelGrid bySkill={bySkill} />
      </div>
    </section>
  );
}
