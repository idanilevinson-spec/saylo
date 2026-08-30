import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listLearningPath } from "@/lib/content/learningPath";

export const metadata: Metadata = {
  title: "מסלול הלימוד שלי — Saylo",
};

export default async function LearnPage() {
  const entries = await listLearningPath();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">מסלול הלימוד שלי</h1>
        <p className="mt-2 text-muted">
          סדר מומלץ להתחלה — עוברים על הנושאים אחד אחרי השני. בקרוב נוסיף מעקב התקדמות והמלצות אישיות.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="mt-10 text-muted">התוכן בדרך — חזרו לבדוק בקרוב.</p>
      ) : (
        <ol className="mt-8 space-y-3">
          {entries.map((entry, i) => (
            <li key={entry.node.id}>
              <ContentCard href={entry.href} index={i} className="p-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-background-2 flex items-center justify-center text-sm font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="text-xl">{entry.icon}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{entry.title_he}</span>
                    <EnglishText as="span" className="block text-xs text-muted">
                      {entry.title_en}
                    </EnglishText>
                  </span>
                  <CefrBadge level={entry.node.cefr_level} />
                </div>
              </ContentCard>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
