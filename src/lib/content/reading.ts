import { createClient } from "@/lib/supabase/serverClient";
import type { ReadingText } from "@/types/database";

export async function listReadingTexts(): Promise<ReadingText[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_texts")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}

export async function getReadingText(id: string): Promise<ReadingText | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_texts")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  return data;
}
