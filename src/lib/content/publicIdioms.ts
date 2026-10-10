import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { CefrLevel } from "@/types/database";

// Idioms and phrasal verbs for the public /english-idioms page: the same
// published rows the app practices, cached for an hour.

export interface PublicIdiom {
  phrase: string;
  type: "idiom" | "phrasal_verb";
  meaning_he: string;
  example_en: string;
  cefr_level: CefrLevel;
}

export const listPublicIdioms = unstable_cache(
  async (): Promise<PublicIdiom[]> => {
    const { data } = await supabaseAdmin
      .from("idioms_phrasal_verbs")
      .select("phrase, type, meaning_he, example_en, cefr_level")
      .eq("status", "published")
      .order("cefr_level")
      .order("sort_order");
    return (data ?? []) as PublicIdiom[];
  },
  ["public-idioms"],
  { revalidate: 3600 }
);
