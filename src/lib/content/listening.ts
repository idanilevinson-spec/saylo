import { createClient } from "@/lib/supabase/serverClient";
import type { ListeningClip } from "@/types/database";

export async function listListeningClips(): Promise<ListeningClip[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listening_clips")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}

export async function getListeningClip(id: string): Promise<ListeningClip | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listening_clips")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

// "natural_speech" clips (docs/specs/connected-speech-listening.md) are an
// additive section on the same /listening page, not a replacement for
// "standard" ones — pure so the grouping itself is unit-testable without a
// database.
export function groupListeningClipsByStyle(clips: ListeningClip[]): {
  standard: ListeningClip[];
  naturalSpeech: ListeningClip[];
} {
  return {
    standard: clips.filter((clip) => clip.style !== "natural_speech"),
    naturalSpeech: clips.filter((clip) => clip.style === "natural_speech"),
  };
}
