import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ListeningPlayer from "@/components/ListeningPlayer";
import MotionLink from "@/components/MotionLink";
import { getListeningClip } from "@/lib/content/listening";
import { createClient } from "@/lib/supabase/serverClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const clip = await getListeningClip(id);
  return { title: clip ? `${clip.title_he} — האזנה` : "האזנה" };
}

export default async function ListeningClipPage({ params }: PageProps) {
  const { id } = await params;
  const clip = await getListeningClip(id);
  if (!clip) notFound();

  const supabase = await createClient();
  const { data: firstExercise } = await supabase
    .from("exercises")
    .select("id")
    .eq("listening_clip_id", clip.id)
    .eq("status", "published")
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/listening" className="text-sm text-primary">
        ← כל הקטעים
      </Link>

      <div className="animate-fade-up">
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{clip.title_he}</h1>
          <CefrBadge level={clip.cefr_level} />
        </div>
        <EnglishText as="p" className="mt-1 text-muted">
          {clip.title_en}
        </EnglishText>
      </div>

      <div className="mt-8">
        <ListeningPlayer transcriptEn={clip.transcript_en} />
      </div>

      {firstExercise && (
        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={`/practice/${firstExercise.id}`}
          className="mt-6 block text-center px-5 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          בדקו את ההבנה שלכם 🎯
        </MotionLink>
      )}
    </div>
  );
}
