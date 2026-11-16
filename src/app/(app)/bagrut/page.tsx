import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, BookOpenText, CalendarCheck, Mic, ListChecks, type LucideIcon } from "lucide-react";
import { modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { getPublishableSampleUnits, getSampleUnit } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS } from "@/lib/content/bagrut/skills";
import { bestScore, getBagrutExamState, getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";
import { nextSet } from "@/lib/content/bagrut/studyHelpers";
import type { BagrutUnitProgress } from "@/types/database";
import BagrutCredit from "@/components/BagrutCredit";
import BagrutExamCard from "@/components/bagrut/BagrutExamCard";

export const metadata: Metadata = {
  title: "בגרות באנגלית | Saylo",
};

const TRACKS: BagrutStudyUnits[] = [3, 4, 5];

function trackProgress(units: BagrutStudyUnits, progress: BagrutUnitProgress[]) {
  const codes = modulesForUnits(units);
  const sets = codes.flatMap((c) => getPublishableSampleUnits(c).map((s) => ({ code: c, slug: s.unitSlug })));
  // The same count as each questionnaire on the track page: a set is done
  // once it has a score.
  const done = sets.filter((s) => bestScore(progress, s.code, s.slug) !== null).length;
  return { codes, total: sets.length, done };
}

const primaryButton =
  "game-press inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-bold text-primary-ink hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

// The Bagrut home. One question or one next step at the top, never a menu
// of equal choices: a learner without a track picks one; a learner with a
// track sees the one set to do now. Everything else is a quiet list below.
export default async function BagrutHubPage() {
  const [{ track, progress }, exam] = await Promise.all([getBagrutLearnerState(), getBagrutExamState()]);
  const mine = track ? trackProgress(track, progress) : null;
  const next = mine ? nextSet(mine.codes, progress) : null;
  const nextUnit = next ? getSampleUnit(next.code, next.slug) : undefined;
  const nextIsRetry = next ? bestScore(progress, next.code, next.slug) !== null : false;

  const more: { href: string; icon: LucideIcon; title: string; note: string }[] = [
    ...(track
      ? [{ href: `/bagrut/track/${track}`, icon: ListChecks, title: `השאלונים של ${track} יח״ל`, note: "כל הערכות בכל שאלון, מה כבר עשיתם ומה נשאר" }]
      : []),
    ...(track === null || track >= 4
      ? [{ href: "/bagrut/oral", icon: Mic, title: "בגרות בעל פה", note: "סימולציה של 30 דקות עם ציון לפי המחוון (4 ו-5 יח״ל)" }]
      : []),
    {
      href: "/bagrut/skills",
      icon: BookOpenText,
      title: "מיומנויות לבחינה",
      note: `${BAGRUT_SKILLS.length} מיומנויות, לכל אחת הסבר קצר ודוגמה פתורה`,
    },
    { href: "/bagrut/exam-guide", icon: CalendarCheck, title: "איך מתכוננים לבחינה", note: "מה עושים בשבועות שלפני, ומה ביום עצמו" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
      <section aria-labelledby="bagrut-title" className="rounded-lg bg-primary text-primary-ink p-6 sm:p-8">
        <h1 id="bagrut-title" className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1]">
          בגרות באנגלית
        </h1>

        {track && mine ? (
          <>
            <p className="mt-2 text-primary-ink/90 leading-relaxed">
              המסלול שלכם: {track} יח״ל, שאלונים <span dir="ltr">{mine.codes.join(", ")}</span>.
            </p>
            <div className="mt-6 rounded-lg bg-background text-foreground p-5">
              {next && nextUnit ? (
                <>
                  <h2 className="text-sm font-bold text-muted">{nextIsRetry ? "כדאי לחזור על" : "הצעד הבא"}</h2>
                  <p className="mt-1 text-xl font-bold leading-snug">{nextUnit.titleHe}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    שאלון {next.code}, ערכה {next.slug}
                  </p>
                  <Link href={`/bagrut/${next.code}/${next.slug}`} className={`mt-4 w-full sm:w-auto ${primaryButton}`}>
                    {nextIsRetry ? "לתרגל שוב" : "להתחיל"}
                    <ChevronLeft size={17} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">עשיתם את כל הערכות במסלול, ובציון טוב.</h2>
                  <p className="mt-1 text-sm text-muted">אפשר לחזור על ערכה עם שעון של בחינה, או לתרגל את הבחינה בעל פה.</p>
                  <Link href={`/bagrut/track/${track}`} className={`mt-4 ${primaryButton}`}>
                    לשאלונים שלי
                    <ChevronLeft size={17} aria-hidden="true" />
                  </Link>
                </>
              )}
              <div className="mt-5">
                <div
                  role="progressbar"
                  aria-label="ערכות שעשיתם במסלול"
                  aria-valuemin={0}
                  aria-valuemax={mine.total}
                  aria-valuenow={mine.done}
                  className="h-2 overflow-hidden rounded-full bg-background-2"
                >
                  <span className="block h-full bg-primary" style={{ width: `${mine.total ? (mine.done / mine.total) * 100 : 0}%` }} />
                </div>
                <p className="mt-1.5 text-sm text-muted tabular-nums">
                  עשיתם {mine.done} מתוך {mine.total} ערכות במסלול
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 max-w-md text-primary-ink/90 leading-relaxed">
              מתחילים בבחירת מסלול. אחר כך מקבלים כל פעם צעד אחד ברור: איזו ערכה לעשות עכשיו.
            </p>
            <h2 className="mt-6 font-bold">באיזה מסלול אתם?</h2>
            <ul className="mt-3 grid max-w-md grid-cols-3 gap-2.5">
              {TRACKS.map((u) => (
                <li key={u}>
                  <Link
                    href={`/bagrut/track/${u}`}
                    className="game-press flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg bg-background px-2 py-3 text-foreground hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                  >
                    <span className="text-3xl font-black leading-none tabular-nums">{u}</span>
                    <span className="text-sm font-bold">יח״ל</span>
                    <span dir="ltr" className="text-xs text-muted">
                      {modulesForUnits(u).join(" ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-primary-ink/90">
              לא בטוחים?{" "}
              <Link
                href="/bagrut/exam-guide"
                className="rounded font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-ink"
              >
                איך מתכוננים לבחינה
              </Link>
            </p>
          </>
        )}
      </section>

      {track && <BagrutExamCard exam={exam} track={track} progress={progress} />}

      <section aria-labelledby="more-title" className="mt-10">
        <h2 id="more-title" className="text-lg font-bold">
          עוד באזור הבגרות
        </h2>
        <ul className="mt-3 divide-y divide-card-border rounded-lg border border-card-border bg-card">
          {more.map(({ href, icon: Icon, title, note }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-background-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
              >
                <Icon size={20} aria-hidden="true" className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm leading-snug text-muted">{note}</span>
                </span>
                <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
        {track && (
          <p className="mt-3 text-sm text-muted">
            להחליף מסלול:{" "}
            {TRACKS.filter((u) => u !== track).map((u, i) => (
              <span key={u}>
                {i > 0 && " או "}
                <Link href={`/bagrut/track/${u}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {u} יח״ל
                </Link>
              </span>
            ))}
          </p>
        )}
      </section>

      <p className="mt-12 text-xs text-muted">מבנה השאלונים נבדק מול ארכיון משרד החינוך ומדריכי הכנה ציבוריים.</p>
      <BagrutCredit className="mt-1" />
    </div>
  );
}
