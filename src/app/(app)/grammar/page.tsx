import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listGrammarTopics } from "@/lib/content/grammar";

export const metadata: Metadata = {
  title: "דקדוק — Saylo",
};

export default async function GrammarPage() {
  const topics = await listGrammarTopics();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">דקדוק</h1>
        <p className="mt-2 text-muted">מסלול דקדוק מלא, שלב אחרי שלב</p>
      </div>

      {topics.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין שיעורים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <ContentCard key={topic.id} href={`/grammar/${topic.slug}`} index={i}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">{topic.name_he}</h2>
                <CefrBadge level={topic.cefr_level} />
              </div>
              <EnglishText as="p" className="mt-1 text-sm text-muted">
                {topic.name_en}
              </EnglishText>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
