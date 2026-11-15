import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/site/breadcrumbs";
import { pageOpenGraph } from "@/lib/og/meta";
import Link from "next/link";
import { Timer, ChevronLeft } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import HubHeader from "@/components/HubHeader";
import BagrutCredit from "@/components/BagrutCredit";
import { BAGRUT_MODULE_FORMATS, modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_SAMPLE_UNITS } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS, BAGRUT_SKILL_KIND_LABEL, type BagrutSkillKind } from "@/lib/content/bagrut/skills";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";
import { ORAL_EXAM_MINUTES, PART_POINTS, partName, type OralPart } from "@/lib/bagrut/oralRules";
import { PAID_SIMULATIONS_PER_DAY, TRIAL_SIMULATIONS } from "@/lib/bagrut/oralAllowance";

const ORAL_PARTS: [OralPart, string][] = [
  ["A", "שני נושאים אישיים. בוחרים אחד ועונים על השאלות שלו."],
  ["B", "מדברים על הפרויקט שלכם, בין דקה לשתי דקות. מד זמן מראה מתי עברתם את הדקה."],
  ["C", "מקשיבים לקטע קצר ועונים על שתי קבוצות שאלות."],
];

// A public, indexable page for people searching for Bagrut English prep.
// Everything on it comes from the same data the signed-in Bagrut area
// uses: the verified questionnaire structure, the skill lessons and the
// practice sets. Nothing here is a promise the product doesn't keep.

const DESCRIPTION =
  "מבנה כל שאלון בבגרות באנגלית (A עד G), מיומנויות עם דוגמה פתורה, וערכות תרגול באותו מבנה, עם שעון באורך הבחינה. לפי 3, 4 ו-5 יחידות לימוד, וגם סימולציה של הבגרות בעל פה.";

export const metadata: Metadata = {
  title: "הכנה לבגרות באנגלית: 3, 4 ו-5 יח״ל | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-bagrut" },
  openGraph: pageOpenGraph("הכנה לבגרות באנגלית: 3, 4 ו-5 יח״ל", DESCRIPTION, "/english-bagrut"),
};

const TRACKS: BagrutStudyUnits[] = [3, 4, 5];
const KIND_ORDER: BagrutSkillKind[] = ["reading", "listening", "literature", "vocabulary", "writing"];

const FAQ: { q: string; a: string }[] = [
  {
    q: "אילו שאלונים יש בבגרות באנגלית בכל רמה?",
    a: "ב-3 יח״ל: שאלונים A, B ו-C. ב-4 יח״ל: C, D ו-E. ב-5 יח״ל: E, F ו-G. לכל שאלון יש מבנה משלו: קריאה, האזנה, ספרות, אוצר מילים או כתיבה.",
  },
  {
    q: "האם התרגול באתר זהה לבחינה האמיתית?",
    a: "המבנה כן: מספר החלקים, אורך הטקסטים, סוגי השאלות ומשך הזמן. הטקסטים והשאלות מקוריים, ולא נלקחו מבחינות קודמות.",
  },
  {
    q: "אפשר לתרגל בזמן אמיתי של בחינה?",
    a: "כן. בכל ערכת תרגול אפשר להפעיל שעון באורך השאלון האמיתי, כדי לתרגל גם את חלוקת הזמן.",
  },
  {
    q: "אפשר לתרגל את הבגרות בעל פה?",
    a: `כן, ב-4 וב-5 יח״ל. באפליקציה יש סימולציה של הבחינה הממוחשבת בעל פה: ${ORAL_EXAM_MINUTES} דקות, שלושה חלקים באותו מבנה, הקלטה בקול, וציון משוער לפי המחוון עם מה לשפר בכל חלק. זו הערכה של AI, לא ציון של בוחן.`,
  },
  {
    q: "איך יודעים באיזה מסלול להתחיל?",
    a: "במבחן הרמה באתר בוחרים את מספר היחידות, ובסופו מקבלים גם קטע קריאה קצר בפורמט הבגרות. משם אזור הבגרות נפתח לפי המסלול שבחרתם.",
  },
];

export default function EnglishBagrutPage() {
  const setsFor = (units: BagrutStudyUnits) =>
    modulesForUnits(units).reduce((n, code) => n + BAGRUT_SAMPLE_UNITS.filter((u) => u.moduleCode === code).length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <HubHeader title="הכנה לבגרות באנגלית">
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          לכל מסלול, 3, 4 או 5 יחידות לימוד: איך כל שאלון בנוי, אילו מיומנויות הוא בודק, וערכות תרגול באותו מבנה בדיוק.
        </p>
      </HubHeader>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/signup"
            className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
          >
            להתחיל לתרגל, {TRIAL_DAYS} ימים חינם
          </Link>
          {/* Most visitors land here from Instagram on a phone; let them try a
              short lesson before asking for a sign-up. */}
          <Link
            href="/try"
            className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg border border-primary/60 bg-card font-bold hover:border-primary transition-[border-color,transform] duration-150"
          >
            שיעור ניסיון, בלי הרשמה
          </Link>
          <Link
            href="/english-level-test"
            className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg border border-card-border bg-card font-bold hover:border-primary/50 transition-[border-color,transform] duration-150"
          >
            על מבחן הרמה
          </Link>
        </div>

        {/* The three tracks and their questionnaires */}
        <section aria-labelledby="tracks" className="mt-14">
          <h2 id="tracks" className="text-2xl sm:text-3xl font-black tracking-tight">
            השאלונים בכל מסלול
          </h2>
          <div className="mt-5 space-y-4">
            {TRACKS.map((units) => (
              <article key={units} className="lit-plate rounded-lg border border-card-border bg-card p-5">
                <h3 className="flex flex-wrap items-baseline gap-2">
                  <span className="chyron text-4xl leading-none text-primary">{units}</span>
                  <span className="text-xl font-black">יחידות לימוד</span>
                  <span className="text-sm text-muted">· {setsFor(units)} ערכות תרגול</span>
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {modulesForUnits(units).map((code) => {
                    const f = BAGRUT_MODULE_FORMATS[code];
                    return (
                      <li key={code} className="rounded-lg bg-background-2 p-3.5">
                        <p className="flex items-baseline justify-between gap-2">
                          <Link href={`/english-bagrut/${code.toLowerCase()}`} className="chyron -my-1 inline-block py-1 text-2xl hover:text-primary hover:underline">
                            שאלון {code}
                          </Link>
                          {f.timeMinutes && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted">
                              <Timer size={12} aria-hidden="true" /> {f.timeMinutes} דק׳
                            </span>
                          )}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {f.sections.map((s) => (
                            <li key={s.nameHe} className="flex justify-between gap-2">
                              <span>{s.nameHe}</span>
                              <span className="text-muted tabular-nums">{s.points} נק׳</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* The oral exam (COBE): 20% of the final grade in 4 and 5 points,
            and the one part only the app's own simulation practises. Every
            fact here is the same one the simulation's intro screen states. */}
        <section aria-labelledby="oral" className="mt-14">
          <h2 id="oral" className="text-2xl sm:text-3xl font-black tracking-tight">
            בגרות בעל פה, 4 ו-5 יח״ל
          </h2>
          <p className="mt-2 max-w-2xl text-muted leading-relaxed">
            הבחינה הממוחשבת בעל פה שווה 20% מהציון הסופי. באפליקציה יש סימולציה שלה: {ORAL_EXAM_MINUTES} דקות באותו מבנה,
            מקליטים את התשובות בקול, ובסוף מקבלים ציון משוער לפי ארבעת הקריטריונים של המחוון, מה להוסיף בכל חלק ואת התשובה
            שלכם עצמה ברמה הבאה.
          </p>
          <ol className="lit-plate mt-5 grid gap-px overflow-hidden rounded-lg border border-card-border bg-card-border sm:grid-cols-3">
            {ORAL_PARTS.map(([part, body]) => (
              <li key={part} className="bg-card p-4">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="chyron text-2xl">{partName(part)}</span>
                  <span className="text-sm text-muted tabular-nums">{PART_POINTS[part]} נק׳</span>
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            זו סימולציה של Saylo, לא בחינה רשמית. הציון הוא הערכה של AI, לא ציון של בוחן. השאלות והקטעים נכתבו על ידינו
            ואינם שאלות של משרד החינוך. בתקופת הניסיון: {TRIAL_SIMULATIONS === 1 ? "סימולציה אחת" : `${TRIAL_SIMULATIONS} סימולציות`}. במנוי: עד {PAID_SIMULATIONS_PER_DAY} סימולציות ביום.
          </p>
        </section>

        {/* Skills */}
        <section aria-labelledby="skills" className="mt-14">
          <h2 id="skills" className="text-2xl sm:text-3xl font-black tracking-tight">
            המיומנויות שהשאלונים בודקים
          </h2>
          <p className="mt-2 text-muted">לכל מיומנות: מה היא בודקת, איך ניגשים, מלכודות נפוצות ודוגמה פתורה.</p>
          <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {KIND_ORDER.map((kind) => {
              const skills = BAGRUT_SKILLS.filter((s) => s.kind === kind);
              if (skills.length === 0) return null;
              return (
                <div key={kind}>
                  <h3 className="font-black">{BAGRUT_SKILL_KIND_LABEL[kind]}</h3>
                  <ul className="mt-2 space-y-2">
                    {skills.map((s) => (
                      <li key={s.slug} className="text-sm leading-relaxed">
                        <span className="font-bold">{s.titleHe}:</span> <span className="text-muted">{s.summaryHe}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mt-14">
          <h2 id="faq" className="text-2xl sm:text-3xl font-black tracking-tight">
            שאלות נפוצות
          </h2>
          <div className="lit-plate mt-5 divide-y divide-card-border rounded-lg border border-card-border bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-muted transition-transform group-open:-rotate-90" />
                </summary>
                <p className="mt-2 text-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">מתחילים מהמסלול שלכם</h2>
          <p className="mt-1 text-primary-ink/90">מבחן רמה של כ-10 דקות, בחירת מסלול, ואזור בגרות שנפתח לפיו.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            להרשמה חינם
          </Link>
          <p className="mt-3 text-sm">
            <Link href="/try" className="font-bold underline underline-offset-4 decoration-primary-ink/50 hover:decoration-primary-ink">
              או שיעור ניסיון של כ-3 דקות, בלי הרשמה
            </Link>
          </p>
        </section>

        <BagrutCredit className="mt-10" />
      </div>
      <SiteFooter />
    </>
  );
}
