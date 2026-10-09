import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import { Target, GraduationCap, ClipboardCheck, ChevronRight } from "lucide-react";
import WordCard from "@/components/content/WordCard";
import TeacherExplanationCard from "@/components/TeacherExplanationCard";
import { getVocabularyTopicBySlug, listVocabularyItems } from "@/lib/content/vocabulary";
import { createClient } from "@/lib/supabase/serverClient";
import { seededShuffle, dailySeed } from "@/lib/utils/shuffle";
import { getVocabularyTopicIntro } from "@/lib/ai/topicIntro";

interface PageProps {
  params: Promise<{ topicSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getVocabularyTopicBySlug(topicSlug);
  return { title: topic ? `${topic.name_he} — אוצר מילים` : "אוצר מילים" };
}

export default async function VocabularyTopicPage({ params }: PageProps) {
  const { topicSlug } = await params;
  const topic = await getVocabularyTopicBySlug(topicSlug);
  if (!topic) notFound();

  const items = await listVocabularyItems(topic.id);

  const supabase = await createClient();
  const { data: exerciseIds } = await supabase
    .from("exercises")
    .select("id")
    .eq("topic_id", topic.id)
    .eq("status", "published")
    .order("sort_order");
  // Shuffled with a seed that changes daily, so repeated practice of the
  // same topic doesn't always start on the identical first exercise —
  // practice/[exerciseId] applies the same seed to keep the "next
  // exercise" chain consistent with this order for the rest of the day.
  const firstExercise = exerciseIds?.length
    ? seededShuffle(exerciseIds, dailySeed(topic.id))[0]
    : null;

  const intro = await getVocabularyTopicIntro(supabase, topic, items.slice(0, 6));

  const action =
    "game-press inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-lg font-bold transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
      <Link href="/vocabulary" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
        <ChevronRight size={15} aria-hidden="true" /> כל הנושאים
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="chyron rounded-md bg-background-2 px-1.5 py-0.5 text-sm text-primary" dir="ltr">
              {topic.cefr_level}
            </span>
            <span className="tabular-nums">{items.length} מילים</span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{topic.name_he}</h1>
          <EnglishText as="p" className="mt-0.5 text-right text-lg text-muted">
            {topic.name_en}
          </EnglishText>
        </div>
        <div className="flex flex-wrap gap-2">
          {firstExercise && (
            <Link href={`/practice/${firstExercise.id}`} className={`${action} bg-primary text-primary-ink hover:bg-primary-hover`}>
              <Target size={17} aria-hidden="true" /> לתרגל
            </Link>
          )}
          <Link href={`/games/learn?topic=${topic.slug}`} className={`${action} border border-card-border bg-card hover:border-primary/50`}>
            <GraduationCap size={17} aria-hidden="true" /> ללמוד בכרטיסיות
          </Link>
          <Link href={`/games/test?topic=${topic.slug}`} className={`${action} border border-card-border bg-card hover:border-primary/50`}>
            <ClipboardCheck size={17} aria-hidden="true" /> מבחן על הנושא
          </Link>
        </div>
      </header>

      {intro && (
        <div className="mt-6">
          <TeacherExplanationCard text={intro} />
        </div>
      )}

      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <WordCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
