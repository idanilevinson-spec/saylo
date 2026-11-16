import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnit, getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import BagrutPracticeUnit from "@/components/BagrutPracticeUnit";

interface PageProps {
  params: Promise<{ moduleCode: string; unitSlug: string }>;
}

function isModuleCode(value: string): value is BagrutModuleCode {
  return value in BAGRUT_MODULE_FORMATS;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleCode } = await params;
  return { title: isModuleCode(moduleCode) ? `תרגול שאלון ${moduleCode} | בגרות | Saylo` : "תרגול בגרות | Saylo" };
}

export default async function BagrutUnitPage({ params }: PageProps) {
  const { moduleCode: raw, unitSlug } = await params;
  const moduleCode = raw.toUpperCase();
  if (!isModuleCode(moduleCode)) notFound();

  // The only function a page should ever call — see the module-level
  // comment in sampleUnits.ts for what the two gates mean.
  const unit = getPublishableSampleUnit(moduleCode, unitSlug);
  if (!unit) notFound();

  // The set after this one in the same questionnaire, offered when the
  // learner finishes, so the next step is never a search.
  const sets = getPublishableSampleUnits(moduleCode);
  const after = sets[sets.findIndex((u) => u.unitSlug === unit.unitSlug) + 1];

  return (
    <BagrutPracticeUnit
      unit={unit}
      format={BAGRUT_MODULE_FORMATS[moduleCode]}
      nextUnit={after ? { slug: after.unitSlug, titleHe: after.titleHe } : null}
    />
  );
}
