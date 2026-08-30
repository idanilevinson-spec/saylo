import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import GrammarLessonContent from "@/components/GrammarLessonContent";
import MotionLink from "@/components/MotionLink";
import { getGrammarTopicBySlug, listGrammarLessons } from "@/lib/content/grammar";
import { createClient } from "@/lib/supabase/serverClient";

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
  const { data: firstExercise } = await supabase
    .from("exercises")
    .select("id")
    .eq("grammar_topic_id", topic.id)
    .eq("status", "published")
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/grammar" className="text-sm text-primary">
        ← כל נושאי הדקדוק
      </Link>

      <div className="animate-fade-up">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{topic.name_he}</h1>
            <CefrBadge level={topic.cefr_level} />
          </div>
          {firstExercise && (
            <MotionLink
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={`/practice/${firstExercise.id}`}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
            >
              תרגלו את הנושא 🎯
            </MotionLink>
          )}
        </div>
        <EnglishText as="p" className="mt-1 text-muted">
          {topic.name_en}
        </EnglishText>
      </div>

      <div className="mt-8 space-y-10">
        {lessons.map((lesson) => (
          <article key={lesson.id} className="bg-card border border-card-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">{lesson.title_he}</h2>
            <GrammarLessonContent bodyMd={lesson.body_md} />
          </article>
        ))}
      </div>
    </div>
  );
}
