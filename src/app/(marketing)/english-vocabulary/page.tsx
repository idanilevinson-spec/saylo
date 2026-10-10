import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { pageOpenGraph } from "@/lib/og/meta";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { listPublicVocabulary } from "@/lib/content/publicVocabulary";
import type { CefrLevel } from "@/types/database";

// Every vocabulary topic the app teaches, public and grouped by level.

export const revalidate = 3600;

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPTION =
  "אוצר מילים באנגלית לפי נושא ורמה, מ-A1 עד C2: כל מילה עם תרגום, הגייה, משפט לדוגמה והגדרה באנגלית, ואפשרות לשמוע אותה.";

export const metadata: Metadata = {
  title: "אוצר מילים באנגלית לפי נושא ורמה — Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-vocabulary" },
  openGraph: pageOpenGraph("אוצר מילים באנגלית לפי נושא ורמה", DESCRIPTION, "/english-vocabulary"),
};

export default async function EnglishVocabularyIndex() {
  const topics = await listPublicVocabulary();
  const words = topics.reduce((n, t) => n + t.wordCount, 0);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">אוצר מילים באנגלית לפי נושא</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          {words} מילים ב-{topics.length} נושאים. לכל מילה: תרגום, הגייה, משפט לדוגמה והגדרה פשוטה באנגלית.
        </p>

        <div className="mt-10 space-y-10">
          {LEVELS.map((level) => {
            const list = topics.filter((t) => t.cefr_level === level);
            if (list.length === 0) return null;
            return (
              <section key={level} aria-labelledby={`level-${level}`}>
                <h2 id={`level-${level}`} className="flex items-baseline gap-3">
                  <span className="chyron text-3xl text-primary" dir="ltr">
                    {level}
                  </span>
                  <span className="text-lg font-black">{CEFR_NAME_HE[level]}</span>
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {list.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/english-vocabulary/${t.slug}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block font-bold">{t.name_he}</span>
                          <span className="block text-sm text-muted">{t.wordCount} מילים</span>
                        </span>
                        <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="mt-14 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">ללמוד את המילים, לא רק לקרוא אותן</h2>
          <p className="mt-1 text-primary-ink/80">באפליקציה: תרגול לכל מילה, חזרה במרווחים כדי שלא תישכח, ובדיקת הגייה.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            להתחיל בחינם
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
