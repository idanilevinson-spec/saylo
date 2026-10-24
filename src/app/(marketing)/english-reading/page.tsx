import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import HubHeader from "@/components/HubHeader";
import { pageOpenGraph } from "@/lib/og/meta";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { listPublicReading } from "@/lib/content/publicReading";
import type { CefrLevel } from "@/types/database";

// Every reading text the app teaches, public and grouped by level.

export const revalidate = 3600;

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPTION =
  "קטעי קריאה באנגלית עם שאלות הבנה, לפי רמה מ-A1 עד C2: טקסטים מקוריים על חיי היום-יום, מדע, חברה ותרבות, באורך שמתאים לכל רמה.";

export const metadata: Metadata = {
  title: "קטעי קריאה באנגלית עם שאלות, לפי רמה | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-reading" },
  openGraph: pageOpenGraph("קטעי קריאה באנגלית עם שאלות, לפי רמה", DESCRIPTION, "/english-reading"),
};

export default async function EnglishReadingIndex() {
  const texts = await listPublicReading();

  return (
    <>
      <HubHeader title="קטעי קריאה באנגלית">
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          {texts.length} טקסטים מקוריים עם שאלות הבנה, מקטעים קצרים לרמת מתחילים ועד מאמרים לרמה הגבוהה ביותר.
        </p>
      </HubHeader>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="mt-10 space-y-10">
          {LEVELS.map((level) => {
            const list = texts.filter((t) => t.cefr_level === level);
            if (list.length === 0) return null;
            return (
              <section key={level} aria-labelledby={`level-${level}`}>
                <h2 id={`level-${level}`} className="reveal-wipe flex items-baseline gap-3">
                  <span className="chyron text-3xl text-primary" dir="ltr">
                    {level}
                  </span>
                  <span className="text-lg font-black">{CEFR_NAME_HE[level]}</span>
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {list.map((t, n) => (
                    <li key={t.slug} className="reveal-item" style={{ "--col": n % 2 } as CSSProperties}>
                      <Link
                        href={`/english-reading/${t.slug}`}
                        className="lit-plate lit-hover flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card px-4 py-3 hover:border-primary/50"
                      >
                        <span className="min-w-0">
                          <span className="block font-bold">{t.title_he}</span>
                          <span className="block text-sm text-muted">
                            <bdi lang="en">{t.title_en}</bdi> · {t.words} מילים
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
      </div>
      <SiteFooter />
    </>
  );
}
