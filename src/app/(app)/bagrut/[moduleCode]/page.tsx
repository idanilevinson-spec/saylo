import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpenText, Headphones, PenLine, BookOpen, type LucideIcon } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";

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
  return { title: isModuleCode(moduleCode) ? `מודול ${moduleCode} — בגרות — Saylo` : "תרגול בגרות — Saylo" };
}

export default async function BagrutModulePage({ params }: PageProps) {
  const { moduleCode: raw } = await params;
  const moduleCode = raw.toUpperCase();
  if (!isModuleCode(moduleCode)) notFound();

  const units = getPublishableSampleUnits(moduleCode);
  if (units.length === 0) notFound();

  const format = BAGRUT_MODULE_FORMATS[moduleCode];
  const Icon = MODULE_ICON[moduleCode];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/bagrut" className="text-sm text-primary">
        ← כל המודולים
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">מודול {moduleCode}</h1>
          <p className="text-sm text-muted">
            {format.percentOfFinalGrade ? `${format.percentOfFinalGrade}% מהציון · ` : ""}
            {format.timeMinutes ? `${format.timeMinutes} דקות` : ""}
          </p>
        </div>
      </div>

      <p className="mt-4 text-muted leading-relaxed">
        {units.length > 1
          ? `${units.length} ערכות תרגול לבחירה, כולן באותו מבנה בדיוק. אפשר לתרגל כמה שרוצים.`
          : "ערכת תרגול אחת זמינה כרגע למודול הזה."}
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {units.map((unit, i) => (
          <ContentCard key={unit.unitSlug} href={`/bagrut/${moduleCode}/${unit.unitSlug}`} index={i}>
            <p className="font-bold">{unit.titleHe}</p>
            <p className="mt-1 text-xs text-muted">ערכה {unit.unitSlug}</p>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
