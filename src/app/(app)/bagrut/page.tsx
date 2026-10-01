import Link from "next/link";
import type { Metadata } from "next";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnit } from "@/lib/content/bagrut/sampleUnits";

export const metadata: Metadata = {
  title: "תרגול בגרות באנגלית — Saylo",
};

const MODULE_ORDER: BagrutModuleCode[] = ["A", "B", "C", "D", "E", "F", "G"];

export default function BagrutIndexPage() {
  const available = MODULE_ORDER.filter((code) => getPublishableSampleUnit(code));
  const comingSoon = MODULE_ORDER.filter((code) => !getPublishableSampleUnit(code));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">תרגול בגרות באנגלית</h1>
      <p className="mt-2 text-muted leading-relaxed">
        תרגול לפי מבנה הבחינה האמיתי — הבנת הנקרא, אוצר מילים וכתיבה, לפי מודול. חלק מהתוכן נוצר על ידי AI ומסומן
        ככזה בכל מסך; לא כל מודול זמין עדיין.
      </p>

      {available.length === 0 ? (
        <p className="mt-8 text-muted">עדיין אין מודול זמין לתרגול.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {available.map((code) => {
            const format = BAGRUT_MODULE_FORMATS[code];
            const unit = getPublishableSampleUnit(code)!;
            return (
              <Link
                key={code}
                href={`/bagrut/${code}`}
                className="block rounded-lg border border-card-border p-5 hover:bg-background-2 transition-colors"
              >
                <p className="font-bold">{unit.titleHe}</p>
                <p className="mt-1 text-sm text-muted">
                  מודול {code} · {format.studyUnitTracks.join("/")} יח&quot;ל
                  {format.percentOfFinalGrade ? ` · ${format.percentOfFinalGrade}% מהציון` : ""}
                  {format.timeMinutes ? ` · ${format.timeMinutes} דקות` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {comingSoon.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          מודולים {comingSoon.join(", ")} עוד לא זמינים לתרגול.
        </p>
      )}
    </div>
  );
}
