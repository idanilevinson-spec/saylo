import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, GraduationCap } from "lucide-react";
import {
  BAGRUT_MODULE_FORMATS,
  modulesForUnits,
  type BagrutModuleCode,
  type BagrutStudyUnits,
} from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS, BAGRUT_SKILL_KIND_LABEL, type BagrutSkillKind } from "@/lib/content/bagrut/skills";
import { getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";

export const metadata: Metadata = {
  title: "בגרות באנגלית — Saylo",
};

const TRACKS: BagrutStudyUnits[] = [3, 4, 5];

const TRACK_NOTE: Record<BagrutStudyUnits, string> = {
  3: "קריאה, האזנה וכתיבה",
  4: "קריאה, ספרות, אוצר מילים וכתיבה",
  5: "קריאה מתקדמת, אוצר מילים וחיבור",
};

const KIND_ORDER: BagrutSkillKind[] = ["reading", "listening", "literature", "vocabulary", "writing"];

export default async function BagrutHubPage() {
  const { track, progress } = await getBagrutLearnerState();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">בגרות באנגלית</h1>
      <p className="mt-2 text-muted leading-relaxed max-w-prose">
        אזור לימוד לפי מספר יחידות הלימוד: מבנה כל שאלון, המיומנויות שכדאי לחזק לקראתו, וערכות תרגול באותו מבנה,
        גם בזמן אמיתי של בחינה.
      </p>

      <div role="note" className="mt-6 flex gap-3 rounded-lg border border-accent/40 bg-accent/[0.07] p-4 text-sm leading-relaxed">
        <AlertTriangle size={18} aria-hidden="true" className="shrink-0 text-accent-hover mt-0.5" />
        <p>
          מבנה השאלונים אומת מול מקורות ציבוריים. ההסברים, הדוגמאות וערכות התרגול נכתבו על ידי AI ולא נבדקו על ידי מורה
          מוסמך. מתאים כתרגול נוסף, לא כתחליף לחומר לימוד רשמי או להנחיית מורה.
        </p>
      </div>

      <section aria-labelledby="tracks-title" className="mt-10">
        <h2 id="tracks-title" className="text-lg font-bold">
          בחרו מסלול
        </h2>
        <ul className="mt-3 grid sm:grid-cols-3 gap-3">
          {TRACKS.map((units) => {
            const codes = modulesForUnits(units);
            const totalSets = codes.reduce((n, c) => n + getPublishableSampleUnits(c).length, 0);
            const done = progress.filter((p) => codes.includes(p.module_code as BagrutModuleCode)).length;
            const mine = track === units;
            return (
              <li key={units}>
                <Link
                  href={`/bagrut/track/${units}`}
                  className={`game-press group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card p-5 transition-[border-color,transform] duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                    mine ? "border-primary/60" : "border-card-border"
                  }`}
                >
                  {mine && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="flex items-baseline gap-1.5">
                      <span className="chyron text-5xl text-primary tabular-nums">{units}</span>
                      <span className="font-bold">יח״ל</span>
                    </span>
                    {mine && <span className="text-xs font-bold text-accent-hover">המסלול שלכם</span>}
                  </span>
                  <span className="mt-2 text-sm text-muted">{TRACK_NOTE[units]}</span>
                  <span dir="ltr" className="mt-3 flex justify-end gap-1.5">
                    {codes.map((c) => (
                      <span key={c} className="chyron inline-flex w-8 h-8 items-center justify-center rounded-md bg-background-2 text-lg">
                        {c}
                      </span>
                    ))}
                  </span>
                  <span className="mt-4 block h-1.5 rounded-full bg-background-2 overflow-hidden" aria-hidden="true">
                    <span className="block h-full bg-primary" style={{ width: `${totalSets ? (Math.min(done, totalSets) / totalSets) * 100 : 0}%` }} />
                  </span>
                  <span className="mt-1.5 flex items-center justify-between text-xs text-muted tabular-nums">
                    {Math.min(done, totalSets)} מתוך {totalSets} ערכות
                    <ChevronLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {!track && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <GraduationCap size={15} aria-hidden="true" />
            לא בטוחים באיזה מסלול? כדאי לבדוק עם המורה באיזו רמה אתם ניגשים לבחינה.
          </p>
        )}
      </section>

      <section aria-labelledby="skills-title" className="mt-12">
        <h2 id="skills-title" className="text-lg font-bold">
          מיומנויות לבחינה
        </h2>
        <p className="mt-1 text-sm text-muted">הסבר קצר, צעדים, מלכודות נפוצות ודוגמה פתורה לכל מיומנות.</p>
        <div className="mt-4 space-y-5">
          {KIND_ORDER.map((kind) => {
            const skills = BAGRUT_SKILLS.filter((s) => s.kind === kind);
            if (skills.length === 0) return null;
            return (
              <div key={kind}>
                <h3 className="text-sm font-bold text-muted">{BAGRUT_SKILL_KIND_LABEL[kind]}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/bagrut/skills/${s.slug}`}
                        className="game-press inline-flex items-center min-h-10 px-3.5 rounded-lg border border-card-border bg-card text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                      >
                        {s.titleHe}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-12 text-xs text-muted">
        מבנה השאלונים: {(Object.values(BAGRUT_MODULE_FORMATS).every((f) => f.verified) ? "כל שבעת המודולים אומתו" : "חלק מהמודולים אומתו")} מול ארכיון
        משרד החינוך ומדריכי הכנה ציבוריים.
      </p>
    </div>
  );
}
