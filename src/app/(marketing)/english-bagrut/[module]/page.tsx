import type { Metadata } from "next";
import { breadcrumbJsonLd, jsonLdHtml } from "@/lib/site/breadcrumbs";
import { pageOpenGraph } from "@/lib/og/meta";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Timer, ChevronRight, CheckCircle2 } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import BagrutCredit from "@/components/BagrutCredit";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_SAMPLE_UNITS } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_SKILLS } from "@/lib/content/bagrut/skills";

// One public page per Bagrut questionnaire (A–G): the verified structure,
// the skills it tests, and one worked example from the skill lessons, so
// someone searching for "שאלון E באנגלית" lands on something useful even
// before signing up.

const CODES: BagrutModuleCode[] = ["A", "B", "C", "D", "E", "F", "G"];

export function generateStaticParams() {
  return CODES.map((c) => ({ module: c.toLowerCase() }));
}

function codeFrom(param: string): BagrutModuleCode | null {
  const c = param.toUpperCase() as BagrutModuleCode;
  return CODES.includes(c) ? c : null;
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const code = codeFrom((await params).module);
  if (!code) return {};
  const f = BAGRUT_MODULE_FORMATS[code];
  const tracks = f.studyUnitTracks.map((u) => `${u} יח״ל`).join(" ו-");
  const title = `שאלון ${code} בבגרות באנגלית (${tracks}): מבנה, מיומנויות ותרגול`;
  const description = `איך בנוי שאלון ${code} בבגרות באנגלית: ${f.sections.map((s) => `${s.nameHe} (${s.points} נק׳)`).join(", ")}${f.timeMinutes ? `, ${f.timeMinutes} דקות` : ""}. מיומנויות עם דוגמה פתורה וערכות תרגול באותו מבנה.`;
  const path = `/english-bagrut/${code.toLowerCase()}`;
  return {
    title: `${title} — Saylo`,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function BagrutModulePage({ params }: { params: Promise<{ module: string }> }) {
  const code = codeFrom((await params).module);
  if (!code) notFound();
  const f = BAGRUT_MODULE_FORMATS[code];
  const skills = BAGRUT_SKILLS.filter((s) => s.modules.includes(code));
  const sets = BAGRUT_SAMPLE_UNITS.filter((u) => u.moduleCode === code);
  // One worked example: the first skill for this module that has a
  // multiple-choice example with a passage.
  const sample = skills.find((s) => s.example.options && s.example.passageEn) ?? skills[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd([{ name: "Saylo", path: "/" }, { name: "בגרות באנגלית", path: "/english-bagrut" }, { name: `שאלון ${code}`, path: `/english-bagrut/${code.toLowerCase()}` }])) }}
      />
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
        <Link href="/english-bagrut" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ChevronRight size={15} aria-hidden="true" /> כל השאלונים
        </Link>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">שאלון {code} בבגרות באנגלית</h1>
        <p className="mt-3 text-lg text-muted">
          חלק מ{f.studyUnitTracks.map((u) => `${u} יחידות לימוד`).join(" ומ")}
          {f.timeMinutes ? ` · ${f.timeMinutes} דקות` : ""}
        </p>

        <section aria-labelledby="structure" className="mt-10">
          <h2 id="structure" className="text-2xl font-black tracking-tight">
            מבנה השאלון
          </h2>
          <ul className="mt-4 space-y-3">
            {f.sections.map((s) => (
              <li key={s.nameHe} className="rounded-lg border border-card-border bg-card p-4">
                <p className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-black">{s.nameHe}</span>
                  <span className="chyron text-2xl text-primary tabular-nums">{s.points} נק׳</span>
                </p>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  {[
                    s.wordCountRange ? `${s.wordCountRange[0] > 1 ? `${s.wordCountRange[0]}–` : "עד "}${s.wordCountRange[1]} מילים` : null,
                    s.questionCount ? `כ-${s.questionCount} שאלות` : null,
                    s.questionFormatsHe?.join(", "),
                    s.notesHe,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          {f.timeMinutes && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
              <Timer size={14} aria-hidden="true" /> {f.timeMinutes} דקות לכל השאלון
            </p>
          )}
        </section>

        {skills.length > 0 && (
          <section aria-labelledby="skills" className="mt-12">
            <h2 id="skills" className="text-2xl font-black tracking-tight">
              מה כדאי לחזק לקראתו
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {skills.map((s) => (
                <li key={s.slug} className="rounded-lg bg-background-2 px-4 py-3 text-sm leading-relaxed">
                  <span className="font-bold">{s.titleHe}:</span> <span className="text-muted">{s.summaryHe}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sample && (
          <section aria-labelledby="example" className="mt-12">
            <h2 id="example" className="text-2xl font-black tracking-tight">
              דוגמה פתורה: {sample.titleHe}
            </h2>
            <div className="mt-4 rounded-lg border border-card-border bg-card p-5">
              {sample.example.passageEn && (
                <p dir="ltr" lang="en" className="text-left font-content leading-relaxed text-foreground/90">
                  {sample.example.passageEn}
                </p>
              )}
              <p dir="ltr" lang="en" className="mt-4 text-left font-content font-bold">
                {sample.example.questionEn}
              </p>
              {sample.example.options && (
                <ol dir="ltr" lang="en" className="mt-2 space-y-1.5 text-left font-content">
                  {sample.example.options.map((o, i) => (
                    <li
                      key={o}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                        i === sample.example.correctOptionIndex ? "bg-success/12 font-bold text-success" : "bg-background-2"
                      }`}
                    >
                      {i === sample.example.correctOptionIndex && <CheckCircle2 size={15} aria-hidden="true" />}
                      {o}
                    </li>
                  ))}
                </ol>
              )}
              {sample.example.modelAnswerEn && (
                <p dir="ltr" lang="en" className="mt-3 rounded-md bg-background-2 p-3 text-left font-content text-sm leading-relaxed">
                  {sample.example.modelAnswerEn}
                </p>
              )}
              <p className="mt-4 border-t border-card-border pt-4 text-sm leading-relaxed">
                <span className="font-bold">למה זו התשובה:</span> {sample.example.explanationHe}
              </p>
            </div>
          </section>
        )}

        <section className="mt-12 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">
            {sets.length} ערכות תרגול במבנה של שאלון {code}
          </h2>
          <p className="mt-1 text-primary-ink/80">עם שעון באורך הבחינה האמיתית ומעקב אחרי הציון הכי טוב שלכם.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            להתחיל לתרגל, 3 ימים חינם
          </Link>
        </section>

        <nav aria-label="שאלונים אחרים" className="mt-10 flex flex-wrap gap-2">
          {CODES.filter((c) => c !== code).map((c) => (
            <Link
              key={c}
              href={`/english-bagrut/${c.toLowerCase()}`}
              className="game-press inline-flex min-h-10 items-center rounded-lg border border-card-border bg-card px-3 text-sm font-bold hover:border-primary/50 transition-[border-color,transform] duration-150"
            >
              שאלון {c}
            </Link>
          ))}
        </nav>

        <BagrutCredit className="mt-10" />
      </div>
      <SiteFooter />
    </>
  );
}
