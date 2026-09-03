import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ReadingExam from "@/components/ReadingExam";
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

      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-10 h-40 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-3xl font-bold">{text.title_he}</h1>
            <CefrBadge level={text.cefr_level} />
          </div>
          <EnglishText as="p" className="mt-1 text-muted">
            {text.title_en}
          </EnglishText>
        </div>
      </div>

      <ReadingExam
        text={text}
        exercises={exercises ?? []}
        openQuestions={openQuestions ?? []}
        vocabByWord={vocabByWord}
      />
    </div>
  );
}
