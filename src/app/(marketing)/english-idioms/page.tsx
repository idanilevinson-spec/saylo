import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import PracticeLink from "@/components/PracticeLink";
import { pageOpenGraph } from "@/lib/og/meta";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { listPublicIdioms, type PublicIdiom } from "@/lib/content/publicIdioms";
import type { CefrLevel } from "@/types/database";

// Every idiom and phrasal verb the app teaches, public and grouped by
// level: the phrase, what it means in Hebrew, and an example.

export const revalidate = 3600;

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPTION =
  "ביטויים ופעלים מורכבים באנגלית ופירושם בעברית, מ-A1 עד C2: piece of cake, break the ice, the elephant in the room ועוד, כל אחד עם משפט לדוגמה.";

export const metadata: Metadata = {
  title: "ביטויים באנגלית ופירושם בעברית, לפי רמה — Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/english-idioms" },
  openGraph: pageOpenGraph(
    "ביטויים באנגלית ופירושם בעברית",
    DESCRIPTION,
    "/english-idioms"
  ),
};

const TYPE_HE: Record<PublicIdiom["type"], string> = {
  idiom: "ביטוי",
  phrasal_verb: "פועל מורכב",
};

export default async function EnglishIdiomsPage() {
  const idioms = await listPublicIdioms();
  const counts = {
    idioms: idioms.filter((i) => i.type === "idiom").length,
    phrasal: idioms.filter((i) => i.type === "phrasal_verb").length,
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
          ביטויים באנגלית ופירושם
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          {counts.idioms} ביטויים ו-{counts.phrasal} פעלים מורכבים (
          <bdi lang="en" className="whitespace-nowrap">
            phrasal verbs
          </bdi>
          ), מהנפוצים ביותר ועד אלה שבעיתונות ובאקדמיה. לכל אחד: פירוש בעברית
          ומשפט לדוגמה.
        </p>
        <nav aria-label="קפיצה לרמה" className="mt-5 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <a
              key={l}
              href={`#level-${l}`}
              className="chyron rounded-md bg-background-2 px-2 py-1 text-sm text-primary hover:underline"
              dir="ltr"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {LEVELS.map((level) => {
            const list = idioms.filter((i) => i.cefr_level === level);
            if (list.length === 0) return null;
            return (
              <section
                key={level}
                aria-labelledby={`level-${level}`}
                className="scroll-mt-24"
              >
                <h2 id={`level-${level}`} className="flex items-baseline gap-3">
                  <span className="chyron text-3xl text-primary" dir="ltr">
                    {level}
                  </span>
                  <span className="text-lg font-black">
                    {CEFR_NAME_HE[level]}
                  </span>
                </h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {list.map((i) => (
                    <div
                      key={i.phrase}
                      className="rounded-lg border border-card-border bg-card px-4 py-3.5"
                    >
                      <dt className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted">
                          {TYPE_HE[i.type]}
                        </span>
                        <span
                          dir="ltr"
                          lang="en"
                          className="text-lg font-bold text-primary font-content"
                        >
                          {i.phrase}
                        </span>
                      </dt>
                      <dd className="mt-1 font-bold">{i.meaning_he}</dd>
                      <dd
                        dir="ltr"
                        lang="en"
                        className="mt-2 border-s-2 border-primary/50 ps-3 text-left text-sm text-muted font-content leading-relaxed"
                      >
                        {i.example_en}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>

        <section className="mt-14 rounded-lg bg-primary px-6 py-7 text-primary-ink">
          <h2 className="text-2xl font-black">לזכור אותם, לא רק לקרוא</h2>
          <p className="mt-1 text-primary-ink/80">
            באפליקציה יש תרגול לכל הביטויים, לפי הרמה שלכם.
          </p>
          <PracticeLink signedInHref="/idioms/practice" signedInLabel="לתרגול הביטויים"
            className="game-press mt-4 inline-flex min-h-12 items-center px-6 rounded-lg bg-background text-foreground font-bold"
          >
            להתחיל בחינם
          </PracticeLink>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
