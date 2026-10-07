import Link from "next/link";
import { Clock } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ReadingExam from "@/components/ReadingExam";
import ReportContentError from "@/components/ReportContentError";
import { getReadingText } from "@/lib/content/reading";
import { getVocabularyLookupMap } from "@/lib/content/vocabulary";
import { createClient } from "@/lib/supabase/serverClient";
import { shuffle } from "@/lib/utils/shuffle";

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

  // A learner's pace in a second language, roughly (same as the list page).
  const words = text.body_en.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 110));

  const supabase = await createClient();
  const [{ data: exercises }, { data: openQuestions }] = await Promise.all([
    supabase
      .from("exercises")
      .select("*")
      .eq("reading_text_id", text.id)
      .eq("status", "published")
      .order("sort_order"),
    supabase
      .from("reading_open_questions")
      .select("*")
      .eq("reading_text_id", text.id)
      .eq("status", "published")
      .order("sort_order"),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/reading" className="text-sm text-primary">
        ← כל הטקסטים
      </Link>

      <header className="mt-4">
        <EnglishText as="h1" className="text-3xl sm:text-4xl font-bold leading-tight">
          {text.title_en}
        </EnglishText>
        <p className="mt-1.5 text-lg text-muted">{text.title_he}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <CefrBadge level={text.cefr_level} />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock size={14} aria-hidden="true" />
            כ-{minutes} דק׳ קריאה · {words} מילים
          </span>
          <span className="ms-auto">
            <ReportContentError targetType="reading_text" targetId={text.id} />
          </span>
        </div>
      </header>

      <ReadingExam
        text={text}
        exercises={shuffle(exercises ?? [])}
        openQuestions={openQuestions ?? []}
        vocabByWord={vocabByWord}
      />
    </div>
  );
}
