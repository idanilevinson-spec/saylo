import type { createClient } from "@/lib/supabase/serverClient";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function logAiUsage(
  supabase: SupabaseClient,
  profileId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  await supabase
    .from("ai_usage_log")
    .insert({ profile_id: profileId, feature, input_tokens: inputTokens, output_tokens: outputTokens });
}
