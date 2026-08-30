import { createClient } from "@/lib/supabase/serverClient";
import type { IdiomPhrasalVerb } from "@/types/database";

export async function listIdiomsAndPhrasalVerbs(): Promise<IdiomPhrasalVerb[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("idioms_phrasal_verbs")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  return data ?? [];
}
