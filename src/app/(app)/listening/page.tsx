import type { Metadata } from "next";
import { Headphones, Waves } from "lucide-react";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { groupListeningClipsByStyle, listListeningClips } from "@/lib/content/listening";
import { getLearnerLevels, levelFor } from "@/lib/content/learnerLevel";
import type { ListeningClip } from "@/types/database";

export const metadata: Metadata = {
  title: "האזנה — Saylo",
};

function clipTile(clip: ListeningClip, natural: boolean) {
  return (
    <TopicTile
      href={`/listening/${clip.id}`}
      titleEn={clip.title_en}
      titleHe={clip.title_he}
      level={clip.cefr_level}
      meta={
        natural ? (
          <span className="inline-flex items-center gap-1">
            <Waves size={12} aria-hidden="true" /> דיבור טבעי
          </span>
        ) : undefined
      }
    />
  );
}

export default async function ListeningPage() {
  const [clips, levels] = await Promise.all([listListeningClips(), getLearnerLevels()]);
  const { naturalSpeech } = groupListeningClipsByStyle(clips);
  const natural = new Set(naturalSpeech.map((c) => c.id));
  const level = levelFor(levels, "listening");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={Headphones}
        title="האזנה"
        description="מקשיבים לקטע, מנסים להבין בלי תמלול, ואז בודקים את עצמכם. קטעי 'דיבור טבעי' כוללים קיצורים והססות, כמו שאנשים באמת מדברים."
        level={level}
        levelLabel="הרמה שלכם בהאזנה"
        signedIn={levels.signedIn}
      />
      <div className="mt-10">
        {clips.length === 0 ? (
          <p className="text-muted">עוד אין כאן קטעים.</p>
        ) : (
          <LevelShelves
            items={clips}
            level={level}
            levelOf={(c) => c.cefr_level}
            keyOf={(c) => c.id}
            renderItem={(c) => clipTile(c, natural.has(c.id))}
          />
        )}
      </div>
    </div>
  );
}
