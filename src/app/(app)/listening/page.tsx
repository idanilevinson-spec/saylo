import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listListeningClips } from "@/lib/content/listening";

export const metadata: Metadata = {
  title: "האזנה — Saylo",
};

export default async function ListeningPage() {
  const clips = await listListeningClips();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">האזנה</h1>
        <p className="mt-2 text-muted">הקשיבו לקטע, נסו להבין בלי תמלול, ואז בדקו את עצמכם</p>
      </div>

      {clips.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין קטעים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {clips.map((clip, i) => (
            <ContentCard key={clip.id} href={`/listening/${clip.id}`} index={i}>
              <h2 className="font-bold text-lg">{clip.title_he}</h2>
              <div className="mt-3 flex flex-col items-start gap-1.5">
                <EnglishText as="span" className="text-sm font-medium tracking-tight text-foreground/70">
                  {clip.title_en}
                </EnglishText>
                <CefrBadge level={clip.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
