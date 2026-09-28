import type { Metadata } from "next";
import { Waves } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { groupListeningClipsByStyle, listListeningClips } from "@/lib/content/listening";
import type { ListeningClip } from "@/types/database";

export const metadata: Metadata = {
  title: "האזנה — Saylo",
};

function ClipGrid({ clips }: { clips: ListeningClip[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {clips.map((clip, i) => (
        <ContentCard key={clip.id} href={`/listening/${clip.id}`} index={i}>
          <div className="flex flex-col items-start gap-1.5">
            <EnglishText as="h2" className="text-lg font-bold">
              {clip.title_en}
            </EnglishText>
            <p className="text-sm font-medium text-foreground/70">{clip.title_he}</p>
            <CefrBadge level={clip.cefr_level} />
          </div>
        </ContentCard>
      ))}
    </div>
  );
}

export default async function ListeningPage() {
  const clips = await listListeningClips();
  const { standard, naturalSpeech } = groupListeningClipsByStyle(clips);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold">האזנה</h1>
          <p className="mt-2 text-muted">הקשיבו לקטע, נסו להבין בלי תמלול, ואז בדקו את עצמכם</p>
        </div>
      </div>

      {clips.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין קטעים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {standard.length > 0 && <ClipGrid clips={standard} />}

          {naturalSpeech.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Waves size={18} className="text-primary" />
                <h2 className="text-lg font-bold">דיבור טבעי</h2>
              </div>
              <p className="mt-1 text-sm text-muted">
                שיחות אמיתיות, עם קיצורים, הססות ומשפטים לא גמורים — כמו שאנשים באמת מדברים, לא כמו טקסט כתוב.
              </p>
              <div className="mt-4">
                <ClipGrid clips={naturalSpeech} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
