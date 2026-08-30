import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import SpeakButton from "@/components/SpeakButton";
import PronunciationRecorder from "@/components/PronunciationRecorder";
import MotionLink from "@/components/MotionLink";
import ContentCard from "@/components/ContentCard";
import { getVocabularyTopicBySlug, listVocabularyItems } from "@/lib/content/vocabulary";
import { createClient } from "@/lib/supabase/serverClient";

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
  const { data: firstExercise } = await supabase
    .from("exercises")
    .select("id")
    .eq("topic_id", topic.id)
    .eq("status", "published")
    .order("sort_order")
    .limit(1)
    .maybeSingle();

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

      <div className="mt-8 space-y-3">
        {items.map((item, i) => (
          <ContentCard
            key={item.id}
            index={i}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
          >
            <div className="sm:w-40 shrink-0">
              <div className="flex items-center gap-2">
                <EnglishText as="p" className="text-xl font-bold text-primary">
                  {item.headword}
                </EnglishText>
                <SpeakButton text={item.headword} />
              </div>
              {item.ipa && (
                <EnglishText as="p" className="text-sm text-muted">
                  {item.ipa}
                </EnglishText>
              )}
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
