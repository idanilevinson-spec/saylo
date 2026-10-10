import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import SiteFooter from "@/components/SiteFooter";
import PracticeLink from "@/components/PracticeLink";
import { pageOpenGraph } from "@/lib/og/meta";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { CefrLevel } from "@/types/database";

// Every writing task the app offers, public and grouped by level. Writing
// and the feedback on it happen in the app (the writing coach).

export const revalidate = 3600;

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPTION =
  "נושאים לכתיבה ולחיבור באנגלית לפי רמה, מ-A1 עד C2: מהצגה עצמית ועד מסה ומכתב רשמי. באפליקציה כותבים ומקבלים משוב על הטקסט.";

export const metadata: Metadata = {
  title: "נושאים לחיבור ולכתיבה באנגלית, לפי רמה — Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-writing" },
  openGraph: pageOpenGraph("נושאים לחיבור ולכתיבה באנגלית, לפי רמה", DESCRIPTION, "/english-writing"),
};

const listPrompts = unstable_cache(
  async () => {
    const { data } = await supabaseAdmin
      .from("writing_prompts")
      .select("id, title_he, prompt_en, cefr_level")
      .eq("status", "published")
      .order("cefr_level")
      .order("sort_order");
    return data ?? [];
  },
  ["public-writing-prompts"],
  { revalidate: 3600 },
);

export default async function EnglishWritingPage() {
  const prompts = await listPrompts();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">נושאים לחיבור באנגלית</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          {prompts.length} משימות כתיבה לפי רמה, מכמה משפטים על עצמכם ועד מסה ומכתב רשמי. בוחרים נושא, כותבים באפליקציה,
          ומקבלים משוב על הדקדוק, אוצר המילים והבהירות.
        </p>

        <div className="mt-10 space-y-10">
          {LEVELS.map((level) => {
            const list = prompts.filter((p) => p.cefr_level === level);
            if (list.length === 0) return null;
            return (
              <section key={level} aria-labelledby={`level-${level}`}>
                <h2 id={`level-${level}`} className="flex items-baseline gap-3">
                  <span className="chyron text-3xl text-primary" dir="ltr">
                    {level}
                  </span>
                  <span className="text-lg font-black">{CEFR_NAME_HE[level]}</span>
                </h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {list.map((p) => (
                    <li key={p.id} className="flex flex-col rounded-lg border border-card-border bg-card px-4 py-3.5">
                      <p className="font-bold">{p.title_he}</p>
                      <p dir="ltr" lang="en" className="mt-1 flex-1 text-left text-sm text-muted font-content leading-relaxed">
                        {p.prompt_en}
                      </p>
                      <PracticeLink
                        signedInHref={`/writing/${p.id}`}
                        signedInLabel="לכתוב על הנושא"
                        className="mt-3 self-start text-sm font-bold text-primary hover:underline"
                      >
                        לכתוב ולקבל משוב
                      </PracticeLink>
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
