import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Target } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import WordCard from "@/components/content/WordCard";
import { pageOpenGraph } from "@/lib/og/meta";
import { breadcrumbJsonLd, jsonLdHtml } from "@/lib/site/breadcrumbs";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getPublicVocabulary, listPublicVocabulary } from "@/lib/content/publicVocabulary";

// One public page per vocabulary topic: every word with its translation,
// IPA, example and definition, and the way into practicing them.

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listPublicVocabulary()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const topic = await getPublicVocabulary((await params).slug);
  if (!topic) return {};
  const title = `${topic.name_he} באנגלית: ${topic.wordCount} מילים עם תרגום והגייה`;
  const sample = topic.words
    .slice(0, 4)
    .map((w) => w.headword)
    .join(", ");
  const description = `אוצר מילים באנגלית בנושא ${topic.name_he} (רמה ${topic.cefr_level}): ${sample} ועוד, כל מילה עם תרגום, הגייה ומשפט לדוגמה.`;
  const path = `/english-vocabulary/${topic.slug}`;
  return {
    title: `${title} — Saylo`,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function EnglishVocabularyTopic({ params }: { params: Promise<{ slug: string }> }) {
  const topic = await getPublicVocabulary((await params).slug);
  if (!topic) notFound();
  const all = await listPublicVocabulary();
  const sameLevel = all.filter((t) => t.cefr_level === topic.cefr_level && t.slug !== topic.slug).slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbJsonLd([
              { name: "Saylo", path: "/" },
              { name: "אוצר מילים באנגלית", path: "/english-vocabulary" },
              { name: topic.name_he, path: `/english-vocabulary/${topic.slug}` },
            ]),
          ),
        }}
      />
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <Link href="/english-vocabulary" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ChevronRight size={15} aria-hidden="true" /> כל הנושאים
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
            <span>
              {CEFR_NAME_HE[topic.cefr_level]} · {topic.wordCount} מילים
            </span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{topic.name_he} באנגלית</h1>
          <p dir="ltr" lang="en" className="mt-0.5 text-right text-lg text-muted font-content">
            {topic.name_en}
          </p>
        </header>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {topic.words.map((w) => (
            <li key={w.id}>
              <WordCard item={w} withRecorder={false} />
            </li>
          ))}
        </ul>

        <section className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-primary-ink">
          <div>
            <h2 className="text-lg font-black">לתרגל את המילים האלה</h2>
            <p className="text-sm text-primary-ink/80">
              באפליקציה: תרגיל לכל מילה, חזרה במרווחים כדי שהמילים יישארו, ובדיקת הגייה של המשפטים.
            </p>
          </div>
          <Link
            href="/signup"
            className="game-press inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-lg bg-background text-foreground font-bold"
          >
            <Target size={17} aria-hidden="true" /> להתחיל בחינם
          </Link>
        </section>

        {sameLevel.length > 0 && (
          <nav aria-label="עוד נושאים ברמה" className="mt-10">
            <h2 className="text-lg font-black">עוד נושאים ברמה {topic.cefr_level}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameLevel.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/english-vocabulary/${t.slug}`}
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
