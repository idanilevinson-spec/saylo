import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpenText, Headphones, PenLine, BookOpen, CheckCircle2, Circle, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import { bestScore, getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";
import { nextSet } from "@/lib/content/bagrut/studyHelpers";

interface PageProps {
  params: Promise<{ moduleCode: string }>;
}

function isModuleCode(value: string): value is BagrutModuleCode {
  return value in BAGRUT_MODULE_FORMATS;
}

// Same mapping as the index page — kept local rather than shared, same as
// every other small per-page icon map in this codebase.
const MODULE_ICON: Record<BagrutModuleCode, LucideIcon> = {
  A: Headphones,
  B: PenLine,
  C: BookOpenText,
  D: BookOpenText,
  E: BookOpen,
  F: PenLine,
  G: PenLine,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleCode } = await params;
  const code = moduleCode.toUpperCase();
  return { title: isModuleCode(code) ? `שאלון ${code} | בגרות | Saylo` : "תרגול בגרות | Saylo" };
}

export default async function BagrutModulePage({ params }: PageProps) {
  const { moduleCode: raw } = await params;
  const moduleCode = raw.toUpperCase();
  if (!isModuleCode(moduleCode)) notFound();

  const units = getPublishableSampleUnits(moduleCode);
  if (units.length === 0) notFound();

  const format = BAGRUT_MODULE_FORMATS[moduleCode];
  const Icon = MODULE_ICON[moduleCode];
  const { progress } = await getBagrutLearnerState();
  // One set marked as the next one, so a learner never has to decide
  // where to start: the first not done, then the weakest.
  const next = nextSet([moduleCode], progress);
  const doneCount = units.filter((u) => bestScore(progress, moduleCode, u.unitSlug) !== null).length;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <Link
        href="/bagrut"
        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
      >
        <ChevronRight size={16} aria-hidden="true" />
        לעמוד הבגרות
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary-hover shrink-0">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">שאלון {moduleCode}</h1>
          <p className="text-sm text-muted">
            {format.percentOfFinalGrade ? `${format.percentOfFinalGrade}% מהציון · ` : ""}
            {format.timeMinutes ? `${format.timeMinutes} דקות בבחינה` : ""}
          </p>
        </div>
      </div>

      <p className="mt-4 leading-relaxed text-muted">
        {units.length} ערכות תרגול, כולן באותו מבנה של הבחינה. עשיתם {doneCount} מתוך {units.length}.
      </p>

      <ol className="mt-6 divide-y divide-card-border rounded-lg border border-card-border bg-card">
        {units.map((unit) => {
          const best = bestScore(progress, moduleCode, unit.unitSlug);
          const isNext = next?.slug === unit.unitSlug;
          return (
            <li key={unit.unitSlug}>
              <Link
                href={`/bagrut/${moduleCode}/${unit.unitSlug}`}
                aria-current={isNext ? "step" : undefined}
                className={`flex min-h-16 items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-background-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 ${
                  isNext ? "bg-primary/[0.06]" : ""
                }`}
              >
                {best !== null ? (
                  <CheckCircle2 size={22} aria-hidden="true" className="shrink-0 text-accent-hover" />
                ) : (
                  <Circle size={22} aria-hidden="true" className={`shrink-0 ${isNext ? "text-primary" : "text-muted"}`} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{unit.titleHe}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    ערכה {unit.unitSlug}
                    {best !== null ? ` · הציון הכי טוב: ${best}%` : " · עוד לא נעשתה"}
                  </span>
                </span>
                {isNext && (
                  <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-ink">
                    {best === null ? "הבאה בתור" : "כדאי לחזור"}
                  </span>
                )}
                <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
