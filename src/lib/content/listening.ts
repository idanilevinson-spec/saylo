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
