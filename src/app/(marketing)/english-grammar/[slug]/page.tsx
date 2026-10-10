import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Target } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import PracticeLink from "@/components/PracticeLink";
import GrammarLessonContent from "@/components/GrammarLessonContent";
import { pageOpenGraph } from "@/lib/og/meta";
import { breadcrumbJsonLd, jsonLdHtml } from "@/lib/site/breadcrumbs";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getPublicGrammar, listPublicGrammar } from "@/lib/content/publicGrammar";

// One public page per grammar topic: the full lesson from the app, two
// practice items to try, and the way into the rest of the practice.

export const revalidate = 3600;

// Some topics are named the same in both languages ("there is / there
// are"); then the title and heading shouldn't say it twice.
const hasHebrew = (s: string) => /[֐-׿]/.test(s);

export async function generateStaticParams() {
  return (await listPublicGrammar()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const topic = await getPublicGrammar((await params).slug);
  if (!topic) return {};
  const title = hasHebrew(topic.name_he)
    ? `${topic.name_en} באנגלית: ${topic.name_he}, הסבר בעברית ודוגמאות`
    : `${topic.name_en} באנגלית: הסבר בעברית ודוגמאות`;
  const description = `הסבר בעברית ל-${topic.name_en} (רמה ${topic.cefr_level}): מתי משתמשים, איך בונים משפט, דוגמאות, והטעויות הנפוצות של דוברי עברית.`;
  const path = `/english-grammar/${topic.slug}`;
  return {
    title: `${title} — Saylo`,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function EnglishGrammarTopic({ params }: { params: Promise<{ slug: string }> }) {
  const topic = await getPublicGrammar((await params).slug);
  if (!topic) notFound();
  const all = await listPublicGrammar();
  const sameLevel = all.filter((t) => t.cefr_level === topic.cefr_level && t.slug !== topic.slug).slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbJsonLd([
              { name: "Saylo", path: "/" },
              { name: "דקדוק באנגלית", path: "/english-grammar" },
              { name: topic.name_he, path: `/english-grammar/${topic.slug}` },
            ]),
          ),
        }}
      />
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <Link href="/english-grammar" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ChevronRight size={15} aria-hidden="true" /> כל נושאי הדקדוק
        </Link>

        <header className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Link
              href={`/english-level/${topic.cefr_level.toLowerCase()}`}
              className="chyron rounded-md bg-background-2 px-1.5 py-0.5 text-sm text-primary hover:underline"
              dir="ltr"
            >
              {topic.cefr_level}
            </Link>
            <span>{CEFR_NAME_HE[topic.cefr_level]}</span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{topic.name_he}</h1>
          {hasHebrew(topic.name_he) && (
            <p dir="ltr" lang="en" className="mt-0.5 text-right text-lg text-muted font-content">
              {topic.name_en}
            </p>
          )}
        </header>

        <div className="mt-8 space-y-6">
          {topic.lessons.map((lesson) => (
            <article
              key={lesson.title_he}
              className="relative overflow-hidden rounded-lg border border-card-border bg-card px-5 py-6 sm:px-9 sm:py-8"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{lesson.title_he}</h2>
              <div className="mt-4">
                <GrammarLessonContent bodyMd={lesson.body_md} />
              </div>
            </article>
          ))}
        </div>

        {topic.samples.length > 0 && (
          <section aria-labelledby="try" className="mt-10">
            <h2 id="try" className="text-xl font-black tracking-tight">
              נסו בעצמכם
            </h2>
            <ol className="mt-3 space-y-3">
              {topic.samples.map((s) => (
                <li key={s.sentence} className="rounded-lg border border-card-border bg-card px-4 py-3">
                  <p dir="ltr" lang="en" className="text-left font-content text-lg">
                    {s.sentence}
                  </p>
                  {s.hint && <p className="mt-1 text-sm text-muted">רמז: {s.hint}</p>}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-bold text-primary">לתשובה</summary>
                    <p dir="ltr" lang="en" className="mt-1 text-left font-content font-bold">
                      {s.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-primary-ink">
          <div>
            <h2 className="text-lg font-black">לתרגל את הנושא עד הסוף</h2>
            <p className="text-sm text-primary-ink/80">
              {topic.practiceCount} תרגילים על הנושא הזה באפליקציה, עם בדיקה מיידית והסבר על כל טעות.
            </p>
          </div>
          <PracticeLink signedInHref={`/grammar/${topic.slug}`} signedInLabel={<><Target size={17} aria-hidden="true" /> לתרגל באפליקציה</>}
            className="game-press inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-lg bg-background text-foreground font-bold"
          >
            <Target size={17} aria-hidden="true" /> להתחיל בחינם
          </PracticeLink>
        </section>

        {sameLevel.length > 0 && (
          <nav aria-label="עוד נושאים ברמה" className="mt-10">
            <h2 className="text-lg font-black">עוד נושאים ברמה {topic.cefr_level}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameLevel.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/english-grammar/${t.slug}`}
                    className="inline-flex rounded-lg border border-card-border bg-card px-3 py-2 text-sm font-bold hover:border-primary/50"
                  >
                    {t.name_he}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
