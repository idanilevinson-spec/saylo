import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import { Target, GraduationCap, ClipboardCheck } from "lucide-react";
import SpeakButton from "@/components/SpeakButton";
import PronunciationRecorder from "@/components/PronunciationRecorder";
import MotionLink from "@/components/MotionLink";
import ContentCard from "@/components/ContentCard";
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/vocabulary" className="text-sm text-primary">
        ← כל הנושאים
      </Link>

      <div className="animate-fade-up">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{topic.name_he}</h1>
            <CefrBadge level={topic.cefr_level} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {firstExercise && (
              <MotionLink
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={`/practice/${firstExercise.id}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
              >
                תרגלו את הנושא <Target size={16} />
              </MotionLink>
            )}
            <MotionLink
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={`/games/learn?topic=${topic.slug}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-success/30 bg-success/5 text-success font-medium hover:bg-success/10 transition-colors"
            >
              למדו את הנושא <GraduationCap size={16} />
            </MotionLink>
            <MotionLink
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={`/games/test?topic=${topic.slug}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-accent-hover font-medium hover:bg-accent/10 transition-colors"
            >
              מבחן נושא <ClipboardCheck size={16} />
            </MotionLink>
          </div>
        </div>
        <EnglishText as="p" className="mt-1 text-muted">
          {topic.name_en}
        </EnglishText>
      </div>

      {intro && (
        <div className="mt-6">
          <TeacherExplanationCard text={intro} />
        </div>
      )}

      <div className="mt-8 space-y-3">
        {items.map((item, i) => (
          <ContentCard
            key={item.id}
            index={i}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6"
          >
            <div className="md:w-40 shrink-0">
              <div className="flex items-center gap-2">
                <EnglishText as="p" className="text-xl font-bold text-primary">
                  {item.headword}
                </EnglishText>
                <SpeakButton text={item.headword} />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.translation_he}</p>
              <EnglishText as="p" className="mt-1 text-sm text-muted">
                {item.example_en}
              </EnglishText>
              <div className="mt-2">
                <PronunciationRecorder targetPhrase={item.example_en} />
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
