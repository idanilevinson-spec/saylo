import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, CheckCircle2, ChevronLeft, Clock, Headphones, PenLine, Timer, Layers, BookOpen } from "lucide-react";
import {
  BAGRUT_MODULE_FORMATS,
  modulesForUnits,
  type BagrutModuleCode,
  type BagrutStudyUnits,
} from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import { skillsForModule } from "@/lib/content/bagrut/skills";
import { bestScore, getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";
import SetBagrutTrackButton from "@/components/SetBagrutTrackButton";
import BagrutCredit from "@/components/BagrutCredit";

interface PageProps {
  params: Promise<{ units: string }>;
}

function parseUnits(raw: string): BagrutStudyUnits | null {
  return raw === "3" || raw === "4" || raw === "5" ? (Number(raw) as BagrutStudyUnits) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const units = parseUnits((await params).units);
  return { title: units ? `בגרות ${units} יח״ל — Saylo` : "בגרות — Saylo" };
}

function sectionIcon(nameHe: string) {
  if (nameHe.includes("נשמע")) return Headphones;
  if (nameHe.includes("אוצר")) return BookOpen;
  if (nameHe.includes("כתיבה") || nameHe.includes("חיבור")) return PenLine;
  return BookOpenText;
}

export default async function BagrutTrackPage({ params }: PageProps) {
  const units = parseUnits((await params).units);
  if (!units) notFound();

  const { track, progress } = await getBagrutLearnerState();
  const codes = modulesForUnits(units);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/bagrut" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronLeft size={15} aria-hidden="true" className="rotate-180" /> כל המסלולים
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="flex items-baseline gap-2 text-3xl font-bold">
          בגרות
          <span className="chyron text-6xl text-primary tabular-nums">{units}</span>
          יח״ל
        </h1>
        <SetBagrutTrackButton units={units} current={track} />
      </div>
      <p className="mt-2 text-muted leading-relaxed max-w-prose">
        הבחינה מורכבת משלושה שאלונים: <span dir="ltr">{codes.join(" + ")}</span>. לכל שאלון כאן: איך הוא בנוי, מה כדאי
        לחזק לקראתו, וערכות תרגול באותו מבנה. בכל ערכה אפשר להפעיל שעון באורך הבחינה האמיתית.
      </p>


      {/* In-page index: jump straight to a questionnaire. */}
      <nav aria-label="שאלונים במסלול" className="mt-6 flex gap-2">
        {codes.map((code) => (
          <a
            key={code}
            href={`#module-${code}`}
            className="game-press inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-card-border bg-card text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150"
          >
            שאלון <span className="chyron text-lg">{code}</span>
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-12">
        {codes.map((code) => (
          <ModuleBlock key={code} code={code} progress={progress} />
        ))}
      </div>
      <BagrutCredit className="mt-12" />
    </div>
  );
}

function ModuleBlock({ code, progress }: { code: BagrutModuleCode; progress: Awaited<ReturnType<typeof getBagrutLearnerState>>["progress"] }) {
  const format = BAGRUT_MODULE_FORMATS[code];
  const sets = getPublishableSampleUnits(code);
  const skills = skillsForModule(code);
  const done = sets.filter((s) => bestScore(progress, code, s.unitSlug) !== null).length;

  return (
    <section id={`module-${code}`} aria-labelledby={`module-${code}-title`} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 id={`module-${code}-title`} className="flex items-baseline gap-2 text-xl font-bold">
          שאלון
          <span className="chyron text-4xl text-primary">{code}</span>
        </h2>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted tabular-nums">
          {format.timeMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} aria-hidden="true" /> {format.timeMinutes} דקות
            </span>
          )}
          {format.percentOfFinalGrade && <span>{format.percentOfFinalGrade}% מהציון</span>}
          <span>
            {done}/{sets.length} ערכות
          </span>
        </p>
      </div>

      {/* 1. How the questionnaire is built */}
      <div className="mt-4 bg-card border border-card-border rounded-lg overflow-hidden">
        <h3 className="px-4 pt-3 text-sm font-bold text-muted">מבנה השאלון</h3>
        <ul className="divide-y divide-card-border">
          {format.sections.map((section) => {
            const Icon = sectionIcon(section.nameHe);
            return (
              <li key={section.nameHe} className="flex gap-3 px-4 py-3">
                <Icon size={18} aria-hidden="true" className="shrink-0 mt-0.5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-bold">{section.nameHe}</span>
                    <span className="text-sm text-muted tabular-nums">{section.points} נקודות</span>
                  </p>
                  {(section.wordCountRange || section.questionCount || section.notesHe) && (
                    <p className="mt-0.5 text-sm text-muted leading-relaxed">
                      {[
                        section.wordCountRange && section.wordCountRange[0] > 1
                          ? `${section.wordCountRange[0]}–${section.wordCountRange[1]} מילים`
                          : section.wordCountRange
                            ? `עד ${section.wordCountRange[1]} מילים`
                            : null,
                        section.questionCount ? `כ-${section.questionCount} שאלות` : null,
                        section.questionFormatsHe ? section.questionFormatsHe.join(", ") : null,
                        section.notesHe ?? null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Skills worth strengthening */}
      {skills.length > 0 && (
        <div className="mt-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted">
            <Layers size={14} aria-hidden="true" /> מיומנויות שכדאי לחזק לקראת השאלון
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/bagrut/skills/${s.slug}?from=${code}`}
                  className="game-press inline-flex items-center min-h-10 px-3.5 rounded-lg border border-card-border bg-card text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {s.titleHe}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Practice sets in the questionnaire's own format */}
      <div className="mt-4">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted">
          <Timer size={14} aria-hidden="true" /> ערכות תרגול במבנה השאלון
        </h3>
        {sets.length === 0 ? (
          <p className="mt-2 text-sm text-muted">עוד אין ערכות תרגול לשאלון הזה.</p>
        ) : (
          <ul className="mt-2 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
            {sets.map((set) => {
              const best = bestScore(progress, code, set.unitSlug);
              return (
                <li key={set.unitSlug}>
                  <Link
                    href={`/bagrut/${code}/${set.unitSlug}`}
                    className="game-press group flex items-center gap-3 p-4 hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                  >
                    <span className="chyron inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-md bg-background-2 text-xl tabular-nums">
                      {set.unitSlug}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold leading-snug">{set.titleHe}</span>
                      <span className={`mt-0.5 flex items-center gap-1 text-xs tabular-nums ${best !== null ? "text-success font-medium" : "text-muted"}`}>
                        {best !== null ? (
                          <>
                            <CheckCircle2 size={12} aria-hidden="true" /> הציון הכי טוב: {best}%
                          </>
                        ) : (
                          "עוד לא תרגלתם"
                        )}
                      </span>
                    </span>
                    <ChevronLeft size={18} aria-hidden="true" className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
