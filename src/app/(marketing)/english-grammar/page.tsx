import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { pageOpenGraph } from "@/lib/og/meta";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { listPublicGrammar } from "@/lib/content/publicGrammar";
import type { CefrLevel } from "@/types/database";

// Every grammar lesson the app teaches, public and grouped by level, so
// people searching "present perfect הסבר" land on a real explanation.

export const revalidate = 3600;

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPTION =
  "הסברים בעברית לכל נושאי הדקדוק באנגלית, מ-A1 עד C2: מבנה, דוגמאות, טבלאות השוואה והטעויות הנפוצות של דוברי עברית.";

export const metadata: Metadata = {
  title: "דקדוק באנגלית: הסברים בעברית לפי רמה — Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-grammar" },
  openGraph: pageOpenGraph("דקדוק באנגלית: הסברים בעברית לפי רמה", DESCRIPTION, "/english-grammar"),
};

export default async function EnglishGrammarIndex() {
  const topics = await listPublicGrammar();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">דקדוק באנגלית, בעברית</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          {topics.length} נושאים, מהבסיס ועד הרמה הגבוהה. כל הסבר כולל מבנה, דוגמאות, ואת הטעויות שדוברי עברית עושים הכי
          הרבה.
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
                        href={`/english-grammar/${t.slug}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block font-bold">{t.name_he}</span>
                          <span dir="ltr" lang="en" className="block text-right text-sm text-muted font-content">
                            {t.name_en}
                          </span>
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
          <h2 className="text-2xl font-black">לא בטוחים מאיפה להתחיל?</h2>
          <p className="mt-1 text-primary-ink/80">מבחן רמה של כ-10 דקות, ואחריו תוכנית יומית עם הנושאים שמתאימים לרמה שלכם.</p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            למבחן הרמה, חינם
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
