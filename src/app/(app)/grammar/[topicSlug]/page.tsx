import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import GrammarLessonContent from "@/components/GrammarLessonContent";
import ReportContentError from "@/components/ReportContentError";
import { Target, ChevronRight } from "lucide-react";
import { getGrammarTopicBySlug, listGrammarLessons } from "@/lib/content/grammar";
import { createClient } from "@/lib/supabase/serverClient";
import { seededShuffle, dailySeed } from "@/lib/utils/shuffle";

interface PageProps {
  params: Promise<{ topicSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getGrammarTopicBySlug(topicSlug);
  return { title: topic ? `${topic.name_he} — דקדוק` : "דקדוק" };
}

export default async function GrammarTopicPage({ params }: PageProps) {
  const { topicSlug } = await params;
  const topic = await getGrammarTopicBySlug(topicSlug);
  if (!topic) notFound();

  const lessons = await listGrammarLessons(topic.id);

  const supabase = await createClient();
  const { data: exerciseIds } = await supabase
    .from("exercises")
    .select("id, type")
    .eq("grammar_topic_id", topic.id)
    .eq("status", "published")
    .order("sort_order");
  // Shuffled with a seed that changes daily, so repeated practice of the
  // same topic doesn't always start on the identical first exercise —
  // practice/[exerciseId] applies the same seed to keep the "next
  // exercise" chain consistent with this order for the rest of the day.
  const firstExercise = exerciseIds?.length
    ? seededShuffle(exerciseIds, dailySeed(topic.id))[0]
    : null;

  const fills = (exerciseIds ?? []).filter((e) => e.type === "fill_blank").length;
  const reorders = (exerciseIds ?? []).filter((e) => e.type === "reorder").length;
  const practiceSummary = [fills ? `${fills} השלמות` : null, reorders ? `${reorders} סידורי משפט` : null].filter(Boolean).join(" ו-");

  const action =
    "game-press inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-lg font-bold transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
      <Link href="/grammar" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
        <ChevronRight size={15} aria-hidden="true" /> כל נושאי הדקדוק
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="chyron rounded-md bg-background-2 px-1.5 py-0.5 text-sm text-primary" dir="ltr">
              {topic.cefr_level}
            </span>
            {practiceSummary && <span>{practiceSummary}</span>}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{topic.name_he}</h1>
          <EnglishText as="p" className="mt-0.5 text-right text-lg text-muted">
            {topic.name_en}
          </EnglishText>
        </div>
        {firstExercise && (
          <Link href={`/practice/${firstExercise.id}`} className={`${action} bg-primary text-primary-ink hover:bg-primary-hover`}>
            <Target size={17} aria-hidden="true" /> לתרגל
          </Link>
        )}
      </header>

      {lessons.length > 0 && (
        <>
          <div className="mt-8 space-y-6">
            {lessons.map((lesson) => (
              <article key={lesson.id} className="relative overflow-hidden rounded-lg border border-card-border bg-card px-5 py-6 sm:px-9 sm:py-8">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{lesson.title_he}</h2>
                <div className="mt-4">
                  <GrammarLessonContent bodyMd={lesson.body_md} />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <ReportContentError targetType="grammar_topic" targetId={topic.id} />
          </div>

          {firstExercise && (
            <section className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-primary-ink">
              <div>
                <h2 className="text-lg font-black">עכשיו לתרגול</h2>
                <p className="text-sm text-primary-ink/80">
                  {practiceSummary ? `${practiceSummary}, ` : ""}עם בדיקה מיידית והסבר על כל טעות.
                </p>
              </div>
              <Link href={`/practice/${firstExercise.id}`} className={`${action} bg-background text-foreground`}>
                <Target size={17} aria-hidden="true" /> להתחיל
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}
