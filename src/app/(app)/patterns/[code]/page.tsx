import Link from "next/link";
import type { Metadata } from "next";
import { getPatternDefinition } from "@/lib/patterns/patternDefinitions";
import { getReviewedDrill } from "@/lib/patterns/drills";
import PatternDrillRunner from "@/components/PatternDrillRunner";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const definition = getPatternDefinition(code);
  return { title: definition ? `תרגול: ${definition.labelHe} — Saylo` : "תרגול — Saylo" };
}

export default async function PatternDrillPage({ params }: PageProps) {
  const { code } = await params;
  const definition = getPatternDefinition(code);
  const drill = getReviewedDrill(code);

  if (!definition) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-muted">הדפוס הזה לא קיים.</p>
        <Link href="/patterns" className="mt-4 inline-block text-primary hover:underline">
          חזרה לדפוסים שלי
        </Link>
      </div>
    );
  }

  // Content-review gate (docs/specs/hebrew-pattern-coach.md §7, §11): the
  // pattern's own explanation was verified 2026-09-21, but its drill
  // sentences are a separate approval a learner should never see until
  // they've actually been reviewed — see drills.ts.
  if (!drill) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">{definition.labelHe}</h1>
        <p className="mt-4 text-muted">התרגול הקצר על הדפוס הזה עדיין בבדיקה ויעלה בקרוב.</p>
        <Link href="/patterns" className="mt-6 inline-block text-primary hover:underline">
          חזרה לדפוסים שלי
        </Link>
      </div>
    );
  }

  return <PatternDrillRunner definition={definition} drill={drill} />;
}
