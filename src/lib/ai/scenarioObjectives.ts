import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanObjectives, type ScenarioObjective } from "@/lib/ai/conversationGoals";

// A scenario's missions, read on their own so the conversation keeps working
// before seed 053 adds the column (the query just fails and there are none).
export async function loadScenarioObjectives(supabase: SupabaseClient, scenarioId: string | null): Promise<ScenarioObjective[]> {
  if (!scenarioId) return [];
  try {
    const { data, error } = await supabase.from("conversation_scenarios").select("objectives").eq("id", scenarioId).maybeSingle();
    if (error) return [];
    return cleanObjectives((data as { objectives?: unknown } | null)?.objectives);
  } catch {
    return [];
  }
}

export const doneFrom = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((n): n is number => Number.isInteger(n) && n >= 0) : [];
