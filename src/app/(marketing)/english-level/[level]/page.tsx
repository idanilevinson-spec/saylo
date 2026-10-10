import type { Metadata } from "next";
import { breadcrumbJsonLd, jsonLdHtml } from "@/lib/site/breadcrumbs";
import { pageOpenGraph } from "@/lib/og/meta";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getLevelCatalog, getLevelSamples } from "@/lib/content/levelCatalog";
import { listPublicVocabulary } from "@/lib/content/publicVocabulary";
import type { CefrLevel, SkillArea } from "@/types/database";

// One public page per CEFR level: what a learner at that level can do (the
// same can-do statements the app shows) and a real sample of what is
// taught there, pulled from the content tables.

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS: { skill: SkillArea; label: string }[] = [
  { skill: "speaking", label: "דיבור" },
  { skill: "listening", label: "האזנה" },
  { skill: "reading", label: "קריאה" },
  { skill: "writing", label: "כתיבה" },
];

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

function levelFrom(param: string): CefrLevel | null {
  const l = param.toUpperCase() as CefrLevel;
  return LEVELS.includes(l) ? l : null;
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const level = levelFrom((await params).level);
  if (!level) return {};
  const title = `אנגלית ברמה ${level} (${CEFR_NAME_HE[level]}): מה יודעים ומה לומדים`;
  const description = `מה אפשר לעשות באנגלית ברמה ${level} לפי סולם CEFR, ודוגמאות אמיתיות למילים, לנושאי הדקדוק ולטקסטים שלומדים ברמה הזו.`;
  const path = `/english-level/${level.toLowerCase()}`;
  return {
    title: `${title} — Saylo`,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function EnglishLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const level = levelFrom((await params).level);
  if (!level) notFound();
  const [catalog, samples, vocabTopics] = await Promise.all([getLevelCatalog(), getLevelSamples(level), listPublicVocabulary()]);
  const levelTopics = vocabTopics.filter((t) => t.cefr_level === level);
  const c = catalog[level];
  const i = LEVELS.indexOf(level);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd([{ name: "Saylo", path: "/" }, { name: "מבחן רמה", path: "/english-level-test" }, { name: `רמה ${level}`, path: `/english-level/${level.toLowerCase()}` }])) }}
      />
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
        <Link href="/english-level-test" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ChevronRight size={15} aria-hidden="true" /> מבחן רמה וכל הרמות
        </Link>
        <h1 className="mt-4 flex flex-wrap items-baseline gap-3 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
          אנגלית ברמה
          <span className="chyron text-6xl sm:text-7xl text-primary" dir="ltr">
            {level}
          </span>
        </h1>
        <p className="mt-2 text-lg text-muted">{CEFR_NAME_HE[level]} · לפי הסולם הבינלאומי CEFR</p>

        <section aria-labelledby="cando" className="mt-10">
          <h2 id="cando" className="text-2xl font-black tracking-tight">
            מה יודעים לעשות ברמה הזו
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {SKILLS.map(({ skill, label }) => (
              <div key={skill} className="rounded-lg border border-card-border bg-card p-4">
                <dt className="font-black">{label}</dt>
                <dd className="mt-1 text-sm text-muted leading-relaxed">{getCanDoStatement(skill, level)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {samples.words.length > 0 && (
          <section aria-labelledby="words" className="mt-12">
            <h2 id="words" className="text-2xl font-black tracking-tight">
              מילים שלומדים ברמה {level}
            </h2>
            <p className="mt-1 text-sm text-muted">מתוך {c.words} המילים ברמה הזו באתר.</p>
            {levelTopics.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="נושאי אוצר מילים ברמה">
                {levelTopics.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/english-vocabulary/${t.slug}`}
                      className="inline-flex rounded-lg border border-card-border bg-card px-3 py-1.5 text-sm font-bold hover:border-primary/50"
                    >
                      {t.name_he}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {samples.words.map((w) => (
                <li key={w.headword} className="rounded-lg bg-background-2 px-4 py-3">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="text-sm">{w.translation_he}</span>
                    <span dir="ltr" lang="en" className="font-bold text-primary font-content">
                      {w.headword}
                    </span>
                  </p>
                  <p dir="ltr" lang="en" className="mt-1 text-left text-xs text-muted font-content">
                    {w.example_en}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {samples.grammar.length > 0 && (
            <section aria-labelledby="grammar">
              <h2 id="grammar" className="text-xl font-black tracking-tight">
                נושאי דקדוק ברמה {level}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {samples.grammar.map((g) => (
                  <li key={g.slug} className="border-b border-card-border pb-1.5">
                    <Link href={`/english-grammar/${g.slug}`} className="flex justify-between gap-3 hover:text-primary">
                      <span className="font-bold">{g.name_he}</span>
                      <span dir="ltr" lang="en" className="text-muted font-content">
                        {g.name_en}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {samples.readings.length > 0 && (
            <section aria-labelledby="readings">
              <h2 id="readings" className="text-xl font-black tracking-tight">
                טקסטים לקריאה ברמה {level}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {samples.readings.map((r) => (
                  <li key={r.title_en} className="flex justify-between gap-3 border-b border-card-border pb-1.5">
                    <span>{r.title_he}</span>
                    <span dir="ltr" lang="en" className="text-muted font-content">
                      {r.title_en}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="mt-12 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">לא בטוחים שזו הרמה שלכם?</h2>
          <p className="mt-1 text-primary-ink/80">מבחן רמה של כ-10 דקות, ואחריו תוכנית יומית בדיוק ברמה שלכם בכל מיומנות.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            למבחן הרמה, חינם
          </Link>
        </section>

        <nav aria-label="רמות אחרות" className="mt-10 flex flex-wrap items-center gap-2">
          {i > 0 && (
            <Link href={`/english-level/${LEVELS[i - 1].toLowerCase()}`} className="text-sm font-bold text-primary hover:underline">
              → רמה {LEVELS[i - 1]}
            </Link>
          )}
          <span className="flex-1" />
          {i < LEVELS.length - 1 && (
            <Link href={`/english-level/${LEVELS[i + 1].toLowerCase()}`} className="text-sm font-bold text-primary hover:underline">
              רמה {LEVELS[i + 1]} ←
            </Link>
          )}
        </nav>
      </div>
      <SiteFooter />
    </>
  );
}
