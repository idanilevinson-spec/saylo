import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/og/meta";
import Link from "next/link";
import { Timer, ChevronLeft } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import BagrutCredit from "@/components/BagrutCredit";
import { BAGRUT_MODULE_FORMATS, modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_SAMPLE_UNITS } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS, BAGRUT_SKILL_KIND_LABEL, type BagrutSkillKind } from "@/lib/content/bagrut/skills";

// A public, indexable page for people searching for Bagrut English prep.
// Everything on it comes from the same data the signed-in Bagrut area
// uses: the verified questionnaire structure, the skill lessons and the
// practice sets. Nothing here is a promise the product doesn't keep.

const DESCRIPTION =
  "מבנה כל שאלון בבגרות באנגלית (A עד G), מיומנויות עם דוגמה פתורה, וערכות תרגול באותו מבנה, עם שעון באורך הבחינה. לפי 3, 4 ו-5 יחידות לימוד.";

export const metadata: Metadata = {
  title: "הכנה לבגרות באנגלית: 3, 4 ו-5 יח״ל — Saylo",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">הכנה לבגרות באנגלית</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          לכל מסלול, 3, 4 או 5 יחידות לימוד: איך כל שאלון בנוי, אילו מיומנויות הוא בודק, וערכות תרגול באותו מבנה בדיוק.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/signup"
            className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
          >
            להתחיל לתרגל, 3 ימים חינם
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
              <article key={units} className="rounded-lg border border-card-border bg-card p-5">
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
                          <Link href={`/english-bagrut/${code.toLowerCase()}`} className="chyron text-2xl hover:text-primary hover:underline">
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
          <div className="mt-5 divide-y divide-card-border rounded-lg border border-card-border bg-card">
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
          <p className="mt-1 text-primary-ink/80">מבחן רמה של כ-10 דקות, בחירת מסלול, ואזור בגרות שנפתח לפיו.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            להרשמה חינם
          </Link>
        </section>

        <BagrutCredit className="mt-10" />
      </div>
      <SiteFooter />
    </>
  );
}
