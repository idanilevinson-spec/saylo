import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  History,
  BookOpenText,
  Headphones,
  Feather,
  BookOpen,
  PenLine,
  Timer,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import {
  BAGRUT_MODULE_FORMATS,
  modulesForUnits,
  type BagrutModuleCode,
  type BagrutStudyUnits,
} from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits, getSampleUnit } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS, BAGRUT_SKILL_KIND_LABEL, type BagrutSkillKind } from "@/lib/content/bagrut/skills";
import { getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";
import type { BagrutUnitProgress } from "@/types/database";

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

const KIND_ICON: Record<BagrutSkillKind, LucideIcon> = {
  reading: BookOpenText,
  listening: Headphones,
  literature: Feather,
  vocabulary: BookOpen,
  writing: PenLine,
};

function trackProgress(units: BagrutStudyUnits, progress: BagrutUnitProgress[]) {
  const codes = modulesForUnits(units);
  const total = codes.reduce((n, c) => n + getPublishableSampleUnits(c).length, 0);
  const done = Math.min(total, progress.filter((p) => codes.includes(p.module_code as BagrutModuleCode)).length);
  return { codes, total, done };
}

export default async function BagrutHubPage() {
  const { track, progress } = await getBagrutLearnerState();
  // The practice set worked on most recently, to pick up from.
  const last = [...progress].sort((a, b) => b.completed_at.localeCompare(a.completed_at))[0];
  const lastUnit = last ? getSampleUnit(last.module_code as BagrutModuleCode, last.unit_slug) : undefined;
  const mine = track ? trackProgress(track, progress) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
      {/* The exam plate: the learner's track and where they stand, or the
          three ways in when no track is chosen yet. */}
      <section aria-labelledby="bagrut-title" className="relative overflow-hidden rounded-lg bg-primary text-primary-ink">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to left, black, transparent 80%)",
          }}
        />
        <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 id="bagrut-title" className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">
              בגרות באנגלית
            </h1>
            <p className="mt-2 max-w-md text-primary-ink/80 leading-relaxed">
              מבנה כל שאלון, המיומנויות שהוא בודק, וערכות תרגול באותו מבנה, גם בזמן אמיתי של בחינה.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              {last && lastUnit ? (
                <Link
                  href={`/bagrut/${last.module_code}/${last.unit_slug}`}
                  className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                >
                  <History size={17} aria-hidden="true" />
                  <span className="truncate">להמשיך: שאלון {last.module_code}</span>
                </Link>
              ) : (
                <Link
                  href={track ? `/bagrut/track/${track}` : "/bagrut/exam-guide"}
                  className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                >
                  {track ? "לערכה הראשונה" : "איך מתחילים להתכונן"}
                  <ChevronLeft size={17} aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/bagrut/exam-guide"
                className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-lg border-2 border-primary-ink/35 font-bold hover:bg-primary-ink/10 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
              >
                <CalendarCheck size={17} aria-hidden="true" /> לקראת הבחינה
              </Link>
            </div>
          </div>

          {track && mine ? (
            <div className="rounded-lg bg-primary-ink/10 ring-1 ring-primary-ink/20 px-5 py-4 md:min-w-56">
              <p className="text-xs font-bold text-primary-ink/75">המסלול שלכם</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="chyron text-6xl leading-none tabular-nums">{track}</span>
                <span className="font-bold">יח״ל</span>
              </p>
              <p dir="ltr" className="mt-3 flex justify-end gap-1.5">
                {mine.codes.map((c) => (
                  <span key={c} className="chyron inline-flex w-8 h-8 items-center justify-center rounded-md bg-primary-ink/15 text-lg">
                    {c}
                  </span>
                ))}
              </p>
              <span className="mt-3 block h-1.5 rounded-full bg-primary-ink/15 overflow-hidden" aria-hidden="true">
                <span className="block h-full bg-primary-ink" style={{ width: `${mine.total ? (mine.done / mine.total) * 100 : 0}%` }} />
              </span>
              <p className="mt-1.5 text-xs font-medium text-primary-ink/80 tabular-nums">
                {mine.done} מתוך {mine.total} ערכות תרגול
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-primary-ink/10 ring-1 ring-primary-ink/20 px-5 py-4">
              <p className="text-xs font-bold text-primary-ink/75">באיזה מסלול אתם?</p>
              <p className="mt-2 flex gap-2">
                {TRACKS.map((u) => (
                  <Link
                    key={u}
                    href={`/bagrut/track/${u}`}
                    className="game-press inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary-ink/15 hover:bg-primary-ink/25 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink"
                  >
                    <span className="chyron text-3xl leading-none">{u}</span>
                    <span className="text-[0.7rem] font-bold">יח״ל</span>
                  </Link>
                ))}
              </p>
            </div>
          )}
        </div>
      </section>

      <div role="note" className="mt-4 flex gap-2.5 rounded-lg bg-background-2 px-4 py-3 text-xs leading-relaxed text-muted">
        <AlertTriangle size={15} aria-hidden="true" className="shrink-0 text-accent-hover mt-px" />
        <p>
          מבנה השאלונים אומת מול מקורות ציבוריים. ההסברים, הדוגמאות וערכות התרגול נכתבו על ידי AI ולא נבדקו על ידי מורה מוסמך.
          מתאים כתרגול נוסף, לא כתחליף לחומר לימוד רשמי או להנחיית מורה.
        </p>
      </div>

      <section aria-labelledby="tracks-title" className="mt-12">
        <h2 id="tracks-title" className="text-xl font-black tracking-tight">
          שלושת המסלולים
        </h2>
        <ul className="mt-4 grid sm:grid-cols-3 gap-3">
          {TRACKS.map((units) => {
            const { codes, total, done } = trackProgress(units, progress);
            const isMine = track === units;
            const minutes = codes.reduce((n, c) => n + (BAGRUT_MODULE_FORMATS[c].timeMinutes ?? 0), 0);
            return (
              <li key={units}>
                <Link
                  href={`/bagrut/track/${units}`}
                  className={`game-press group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card p-5 transition-[border-color,transform,box-shadow] duration-150 hover:border-primary/50 hover:shadow-[0_12px_30px_-18px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                    isMine ? "border-primary/60" : "border-card-border"
                  }`}
                >
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${isMine ? "bg-primary" : "bg-card-border"}`} />
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex items-baseline gap-1.5">
                      <span className="chyron text-6xl leading-none text-primary tabular-nums">{units}</span>
                      <span className="font-bold">יח״ל</span>
                    </span>
                    {isMine && <span className="rounded-md bg-primary/12 px-2 py-0.5 text-xs font-bold text-primary">שלכם</span>}
                  </span>
                  <span className="mt-3 text-sm text-muted leading-snug">{TRACK_NOTE[units]}</span>
                  <span className="mt-4 flex items-center justify-between gap-2">
                    <span dir="ltr" className="flex gap-1">
                      {codes.map((c) => (
                        <span key={c} className="chyron inline-flex w-7 h-7 items-center justify-center rounded-md bg-background-2 text-base">
                          {c}
                        </span>
                      ))}
                    </span>
                    {minutes > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
                        <Timer size={13} aria-hidden="true" />
                        {minutes} דק׳ בסך הכל
                      </span>
                    )}
                  </span>
                  <span className="mt-auto pt-4">
                    <span className="block h-1.5 rounded-full bg-background-2 overflow-hidden" aria-hidden="true">
                      <span className="block h-full bg-primary" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                    </span>
                    <span className="mt-1.5 flex items-center justify-between text-xs text-muted tabular-nums">
                      {done} מתוך {total} ערכות
                      <ChevronLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="skills-title" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="skills-title" className="text-xl font-black tracking-tight">
            מיומנויות לבחינה
          </h2>
          <Link href="/bagrut/skills" className="text-sm font-bold text-primary hover:underline">
            לכל {BAGRUT_SKILLS.length} המיומנויות
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">הסבר קצר, צעדים, מלכודות נפוצות ודוגמה פתורה לכל מיומנות.</p>
        {/* Columns, not a grid: reading has many skills and the others one or
            two, so cards stack by height instead of leaving holes. */}
        <ul className="mt-4 gap-3 sm:columns-2 lg:columns-3">
          {KIND_ORDER.map((kind) => {
            const skills = BAGRUT_SKILLS.filter((s) => s.kind === kind);
            if (skills.length === 0) return null;
            const Icon = KIND_ICON[kind];
            return (
              <li key={kind} className="mb-3 break-inside-avoid rounded-lg border border-card-border bg-card p-4">
                <p className="flex items-center gap-2.5">
                  <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="font-bold">{BAGRUT_SKILL_KIND_LABEL[kind]}</span>
                  <span className="ms-auto chyron text-lg text-muted tabular-nums">{skills.length}</span>
                </p>
                <ul className="mt-3 space-y-0.5">
                  {skills.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/bagrut/skills/${s.slug}`}
                        className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 -mx-2 text-sm hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {s.titleHe}
                        <ChevronLeft size={15} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-12 text-xs text-muted">
        מבנה השאלונים: {(Object.values(BAGRUT_MODULE_FORMATS).every((f) => f.verified) ? "כל שבעת המודולים אומתו" : "חלק מהמודולים אומתו")} מול ארכיון
        משרד החינוך ומדריכי הכנה ציבוריים.
      </p>
    </div>
  );
}
