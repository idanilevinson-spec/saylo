import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ReadingTextViewer from "@/components/ReadingTextViewer";
import ReadingResponseForm from "@/components/ReadingResponseForm";
import MotionLink from "@/components/MotionLink";
import { Target } from "lucide-react";
import { getReadingText } from "@/lib/content/reading";
import { getVocabularyLookupMap } from "@/lib/content/vocabulary";
import { createClient } from "@/lib/supabase/serverClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const text = await getReadingText(id);
  return { title: text ? `${text.title_he} — קריאה` : "קריאה" };
}

export default async function ReadingTextPage({ params }: PageProps) {
  const { id } = await params;
  const [text, vocabByWord] = await Promise.all([getReadingText(id), getVocabularyLookupMap()]);
  if (!text) notFound();

  const supabase = await createClient();
  const { data: firstExercise } = await supabase
    .from("exercises")
    .select("id")
    .eq("reading_text_id", text.id)
    .eq("status", "published")
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/reading" className="text-sm text-primary">
        ← כל הטקסטים
      </Link>

      <div className="animate-fade-up">
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{text.title_he}</h1>
          <CefrBadge level={text.cefr_level} />
        </div>
        <EnglishText as="p" className="mt-1 text-muted">
          {text.title_en}
        </EnglishText>
      </div>

      <div className="mt-8 bg-card border border-card-border rounded-2xl p-6 sm:p-8">
        <ReadingTextViewer bodyEn={text.body_en} vocabByWord={vocabByWord} />
      </div>

      {firstExercise && (
        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={`/practice/${firstExercise.id}`}
          className="mt-6 flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בדקו את ההבנה שלכם <Target size={16} />
        </MotionLink>
      )}

      {text.open_question_en && (
        <div className="mt-6">
          <ReadingResponseForm readingTextId={text.id} questionEn={text.open_question_en} />
        </div>
      )}
    </div>
  );
}
