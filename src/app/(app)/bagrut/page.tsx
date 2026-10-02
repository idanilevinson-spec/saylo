import type { Metadata } from "next";
import { AlertTriangle, BookOpen, BookOpenText, Headphones, Lock, PenLine, type LucideIcon } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import {
  BAGRUT_MODULE_FORMATS,
  modulesForUnits,
  type BagrutModuleCode,
  type BagrutStudyUnits,
} from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";

export const metadata: Metadata = {
  title: "תרגול בגרות באנגלית — Saylo",
};

const MODULE_ORDER: BagrutModuleCode[] = ["A", "B", "C", "D", "E", "F", "G"];

const TRACK_LABELS: Record<BagrutStudyUnits, string> = {
  3: "3 יחידות לימוד",
  4: "4 יחידות לימוד",
  5: "5 יחידות לימוד",
};

// One icon per module's dominant skill, not a decorative pick — A is the
// only module with a listening section, E is vocabulary-only (no writing),
// the rest center on a writing task.
const MODULE_ICON: Record<BagrutModuleCode, LucideIcon> = {
  A: Headphones,
  B: PenLine,
  C: BookOpenText,
  D: BookOpenText,
  E: BookOpen,
  F: PenLine,
  G: PenLine,
};

function moduleMeta(code: BagrutModuleCode): string {
  const format = BAGRUT_MODULE_FORMATS[code];
  return [
    format.percentOfFinalGrade ? `${format.percentOfFinalGrade}% מהציון` : null,
    format.timeMinutes ? `${format.timeMinutes} דקות` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function ModuleCard({ code, index }: { code: BagrutModuleCode; index: number }) {
  const units = getPublishableSampleUnits(code);
  const Icon = MODULE_ICON[code];
  const meta = moduleMeta(code);

  if (units.length === 0) {
    return (
      <div className="h-full rounded-lg border border-dashed border-card-border p-5 opacity-70">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-background-2 shrink-0">
            <Lock size={16} className="text-muted" />
          </span>
          <div>
            <p className="font-bold">מודול {code}</p>
            {meta && <p className="text-xs text-muted mt-0.5">{meta}</p>}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted leading-relaxed">
          המבנה של המודול הזה עדיין לא אומת מול מקור מספיק — עוד לא זמין לתרגול.
        </p>
      </div>
    );
  }

  return (
    <ContentCard href={`/bagrut/${code}`} index={index}>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon size={18} />
        </span>
        <div>
          <p className="font-bold">מודול {code}</p>
          <p className="text-xs text-muted mt-0.5">
            {meta ? `${meta} · ` : ""}
            {units.length} {units.length === 1 ? "ערכת תרגול" : "ערכות תרגול"}
          </p>
        </div>
      </div>
    </ContentCard>
  );
}

function TrackSection({ units }: { units: BagrutStudyUnits }) {
  const codes = MODULE_ORDER.filter((code) => modulesForUnits(units).includes(code));

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-bold">{TRACK_LABELS[units]}</h2>
        <span className="text-sm text-muted">מודולים {codes.join(" + ")}</span>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {codes.map((code, i) => (
          <ModuleCard key={code} code={code} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function BagrutIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold">תרגול בגרות באנגלית</h1>
          <p className="mt-2 text-muted leading-relaxed">
            תרגול לפי מבנה הבחינה האמיתי, מודול אחר מודול — הבנת הנשמע, הבנת הנקרא, אוצר מילים וכתיבה, בחלוקה
            שתואמת את יחידות הלימוד שלכם.
          </p>
        </div>
      </div>

      <div
        role="note"
        className="mt-6 flex gap-3 rounded-lg border border-accent/40 bg-accent/[0.07] p-4 text-sm leading-relaxed"
      >
        <AlertTriangle size={18} className="shrink-0 text-accent-hover mt-0.5" />
        <p>
          כל התוכן כאן נכתב על ידי AI לפי מבנה בחינה מאומת, ולא נבדק על ידי מורה מוסמך. מתאים כתרגול נוסף — לא
          כתחליף לחומר לימוד רשמי.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <TrackSection units={3} />
        <TrackSection units={4} />
        <TrackSection units={5} />
      </div>
    </div>
  );
}
