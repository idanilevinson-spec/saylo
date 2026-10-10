import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Target } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import PracticeLink from "@/components/PracticeLink";
import { pageOpenGraph } from "@/lib/og/meta";
import { breadcrumbJsonLd, jsonLdHtml } from "@/lib/site/breadcrumbs";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getPublicReading, listPublicReading } from "@/lib/content/publicReading";

// One public page per reading text: the text and its questions. The
// answers aren't shown here; answering, checking and feedback happen in
// the app.

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listPublicReading()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const text = await getPublicReading((await params).slug);
  if (!text) return {};
  const title = `קטע קריאה באנגלית: ${text.title_en} (${text.cefr_level})`;
  const description = `${text.title_he}: קטע קריאה באנגלית ברמה ${text.cefr_level}, ${text.words} מילים, עם ${text.questions.length} שאלות הבנה${text.openQuestions.length ? " ושאלות פתוחות" : ""}.`;
  const path = `/english-reading/${text.slug}`;
  return {
    title: `${title} — Saylo`,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function EnglishReadingText({ params }: { params: Promise<{ slug: string }> }) {
  const text = await getPublicReading((await params).slug);
  if (!text) notFound();
  const all = await listPublicReading();
  const sameLevel = all.filter((t) => t.cefr_level === text.cefr_level && t.slug !== text.slug).slice(0, 6);
  const paragraphs = text.body_en.split(/\r?\n\s*\r?\n/).filter((p) => p.trim());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbJsonLd([
              { name: "Saylo", path: "/" },
              { name: "קטעי קריאה באנגלית", path: "/english-reading" },
              { name: text.title_en, path: `/english-reading/${text.slug}` },
            ]),
          ),
        }}
      />
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <Link href="/english-reading" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ChevronRight size={15} aria-hidden="true" /> כל קטעי הקריאה
        </Link>

        <header className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Link
              href={`/english-level/${text.cefr_level.toLowerCase()}`}
              className="chyron rounded-md bg-background-2 px-1.5 py-0.5 text-sm text-primary hover:underline"
              dir="ltr"
            >
              {text.cefr_level}
            </Link>
            <span>
              {CEFR_NAME_HE[text.cefr_level]} · {text.words} מילים
            </span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{text.title_he}</h1>
        </header>

        <article
          lang="en"
          dir="ltr"
          className="relative mt-6 overflow-hidden rounded-lg border border-card-border bg-card px-5 py-6 sm:px-9 sm:py-8 text-left font-content"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">{text.title_en}</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p.trim()}</p>
            ))}
          </div>
        </article>

        {text.questions.length > 0 && (
          <section aria-labelledby="questions" className="mt-10">
            <h2 id="questions" className="text-xl font-black tracking-tight">
              שאלות הבנה
            </h2>
            <ol lang="en" dir="ltr" className="mt-3 space-y-4 text-left font-content">
              {text.questions.map((q, i) => (
                <li key={i} className="rounded-lg border border-card-border bg-card px-4 py-3">
                  <p className="font-bold">
                    {i + 1}. {q.prompt}
                  </p>
                  <ol className="mt-2 space-y-1 text-muted" type="a">
                    {q.options.map((o, k) => (
                      <li key={k} className="ms-5 list-[lower-alpha]">
                        {o}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        )}

        {text.openQuestions.length > 0 && (
          <section aria-labelledby="open" className="mt-8">
            <h2 id="open" className="text-xl font-black tracking-tight">
              שאלות פתוחות
            </h2>
            <ul lang="en" dir="ltr" className="mt-3 space-y-2 text-left font-content">
              {text.openQuestions.map((q) => (
                <li key={q} className="rounded-lg bg-background-2 px-4 py-3">
                  {q}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-primary-ink">
          <div>
            <h2 className="text-lg font-black">לענות ולקבל משוב</h2>
            <p className="text-sm text-primary-ink/80">באפליקציה עונים על השאלות, רואים מיד מה נכון, ומקבלים משוב על התשובות הפתוחות.</p>
          </div>
          <PracticeLink
            signedInHref={`/reading/${text.id}`}
            signedInLabel={
              <>
                <Target size={17} aria-hidden="true" /> לענות באפליקציה
              </>
            }
            className="game-press inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-lg bg-background text-foreground font-bold"
          >
            <Target size={17} aria-hidden="true" /> להתחיל בחינם
          </PracticeLink>
        </section>

        {sameLevel.length > 0 && (
          <nav aria-label="עוד קטעים ברמה" className="mt-10">
            <h2 className="text-lg font-black">עוד קטעי קריאה ברמה {text.cefr_level}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameLevel.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/english-reading/${t.slug}`}
                    className="inline-flex rounded-lg border border-card-border bg-card px-3 py-2 text-sm font-bold hover:border-primary/50"
                  >
                    {t.title_he}
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
