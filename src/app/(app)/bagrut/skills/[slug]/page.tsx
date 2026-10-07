import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronLeft, ListOrdered, TriangleAlert } from "lucide-react";
import { BAGRUT_SKILL_KIND_LABEL, getBagrutSkill } from "@/lib/content/bagrut/skills";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import BagrutSkillExample from "@/components/BagrutSkillExample";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const skill = getBagrutSkill((await params).slug);
  return { title: skill ? `${skill.titleHe} — בגרות — Saylo` : "בגרות — Saylo" };
}

export default async function BagrutSkillPage({ params, searchParams }: PageProps) {
  const skill = getBagrutSkill((await params).slug);
  if (!skill) notFound();
  const from = (await searchParams).from;
  const fromModule = from && from in BAGRUT_MODULE_FORMATS ? (from as BagrutModuleCode) : null;
  // Back to the track the learner came from, or the hub.
  const backTrack = fromModule ? BAGRUT_MODULE_FORMATS[fromModule].studyUnitTracks[0] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href={backTrack ? `/bagrut/track/${backTrack}#module-${fromModule}` : "/bagrut"}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ChevronLeft size={15} aria-hidden="true" className="rotate-180" />
        {backTrack ? `חזרה לשאלון ${fromModule}` : "אזור הבגרות"}
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{skill.titleHe}</h1>
      <p className="mt-2 text-lg text-muted leading-relaxed">{skill.summaryHe}</p>
      <p className="mt-3 text-sm text-muted">
        {BAGRUT_SKILL_KIND_LABEL[skill.kind]} · שימושי בשאלונים{" "}
        <span dir="ltr" className="chyron text-base text-foreground">
          {skill.modules.join(" · ")}
        </span>
      </p>

      <section aria-labelledby="what-title" className="mt-8">
        <h2 id="what-title" className="text-lg font-bold">
          מה זה בודק
        </h2>
        <p className="mt-2 leading-relaxed">{skill.whatHe}</p>
      </section>

      <section aria-labelledby="steps-title" className="mt-8">
        <h2 id="steps-title" className="flex items-center gap-2 text-lg font-bold">
          <ListOrdered size={18} aria-hidden="true" className="text-primary" /> איך ניגשים
        </h2>
        <ol className="mt-3 space-y-3">
          {skill.stepsHe.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="chyron inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-lg tabular-nums">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="traps-title" className="mt-8">
        <h2 id="traps-title" className="flex items-center gap-2 text-lg font-bold">
          <TriangleAlert size={18} aria-hidden="true" className="text-danger" /> מלכודות נפוצות
        </h2>
        <ul className="mt-3 space-y-2">
          {skill.trapsHe.map((trap, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
              {trap}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="example-title" className="relative overflow-hidden mt-10 bg-card border border-card-border rounded-lg p-5 sm:p-7">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <h2 id="example-title" className="mb-4 text-lg font-bold">
          דוגמה פתורה
        </h2>
        <BagrutSkillExample skill={skill} />
      </section>

      <div role="note" className="mt-6 flex gap-3 rounded-lg border border-accent/40 bg-accent/[0.07] p-4 text-sm leading-relaxed">
        <AlertTriangle size={18} aria-hidden="true" className="shrink-0 text-accent-hover mt-0.5" />
        <p>ההסבר והדוגמה נכתבו על ידי AI, הם מקוריים ולא נלקחו מבחינה אמיתית, ולא נבדקו על ידי מורה מוסמך.</p>
      </div>
    </div>
  );
}
