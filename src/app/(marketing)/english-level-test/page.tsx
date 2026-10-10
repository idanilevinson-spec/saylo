import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/og/meta";
import Link from "next/link";
import { BookOpen, PenLine, BookOpenText, Headphones, NotebookPen, ChevronLeft, type LucideIcon } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getLevelCatalog } from "@/lib/content/levelCatalog";
import type { CefrLevel } from "@/types/database";

// Public page for "מבחן רמה באנגלית" searches: what the test checks, what
// each level means, and what opens up after it. The per-level content
// counts come from the database (cached), the can-do lines from the same
// statements the app shows learners.

const DESCRIPTION =
  "מבחן רמה באנגלית של כ-10 דקות: אוצר מילים, דקדוק, קריאה והאזנה. בסופו רמה מ-A1 עד C2 לכל מיומנות בנפרד, ותוכנית תרגול יומית שבנויה עליה.";

export const metadata: Metadata = {
  title: "מבחן רמה באנגלית לפי CEFR — Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-level-test" },
  openGraph: pageOpenGraph("מבחן רמה באנגלית לפי CEFR", DESCRIPTION, "/english-level-test"),
};

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const PARTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: BookOpen, title: "אוצר מילים", body: "מילים מכל רמה, מהבסיסיות ועד המתקדמות." },
  { icon: PenLine, title: "דקדוק", body: "מבנים מהבסיסיים ועד המתקדמים." },
  { icon: BookOpenText, title: "קריאה", body: "קטעים קצרים עם שאלות הבנה." },
  { icon: Headphones, title: "האזנה", body: "משפטים ושיחות קצרות, עם אפשרות להאט." },
  { icon: NotebookPen, title: "כתיבה", body: "קטע קצר בסוף, לא חובה." },
];

export default async function EnglishLevelTestPage() {
  const catalog = await getLevelCatalog();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">מבחן רמה באנגלית</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          כ-10 דקות. בסוף מקבלים רמה לפי הסולם הבינלאומי (CEFR) לכל מיומנות בנפרד, כי קריאה ודיבור לא תמיד באותה רמה,
          ותוכנית תרגול יומית שבנויה על התוצאה.
        </p>
        <Link
          href="/signup"
          className="game-press mt-6 inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
        >
          להתחיל את המבחן בחינם <ChevronLeft size={17} aria-hidden="true" />
        </Link>

        <section aria-labelledby="parts" className="mt-14">
          <h2 id="parts" className="text-2xl sm:text-3xl font-black tracking-tight">
            מה המבחן בודק
          </h2>
          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-px overflow-hidden rounded-lg border border-card-border bg-card-border">
            {PARTS.map((p) => (
              <li key={p.title} className="bg-card p-4">
                <p.icon size={18} aria-hidden="true" className="text-primary" />
                <p className="mt-2 font-bold">{p.title}</p>
                <p className="mt-1 text-sm text-muted leading-snug">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="levels" className="mt-14">
          <h2 id="levels" className="text-2xl sm:text-3xl font-black tracking-tight">
            שש הרמות, ומה עושים בכל אחת
          </h2>
          <p className="mt-2 text-muted">המספרים הם התוכן שמחכה בכל רמה באתר כרגע.</p>
          <ol className="mt-5 space-y-3">
            {LEVELS.map((l) => {
              const c = catalog[l];
              return (
                <li key={l} className="grid gap-3 rounded-lg border border-card-border bg-card p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                  <p className="flex items-baseline gap-2">
                    <Link href={`/english-level/${l.toLowerCase()}`} className="chyron text-4xl leading-none text-primary hover:underline" dir="ltr">
                      {l}
                    </Link>
                    <span className="font-bold">{CEFR_NAME_HE[l]}</span>
                  </p>
                  <p className="text-sm text-muted leading-relaxed">{getCanDoStatement("speaking", l)}</p>
                  <p className="text-xs text-muted tabular-nums sm:text-end">
                    {c.words} מילים · {c.reading} טקסטים · {c.listening} קטעי האזנה · {c.scenarios} תרחישי שיחה
                  </p>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-muted">הרמה ב-Saylo היא הערכה פנימית לפי סולם CEFR, לא תעודה רשמית.</p>
        </section>

        <section className="mt-14 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">ומה אחרי המבחן?</h2>
          <p className="mt-1 max-w-xl text-primary-ink/80 leading-relaxed">
            דף הבית נפתח על הרמה שלכם: תרגיל דקדוק, נושא מילים, טקסט, קטע האזנה, שיחה עם המורה וכתיבה, כל אחד ברמה שלכם
            במיומנות שלו.
          </p>
          <Link href="/signup" className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold">
            להרשמה חינם
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
