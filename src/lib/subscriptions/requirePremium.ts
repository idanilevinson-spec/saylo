import type { createClient } from "@/lib/supabase/serverClient";
import { isPremiumActive } from "./entitlements";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Server-side check for API routes gating an AI-cost feature (Speaking,
// Writing Coach, Teacher suggestions). Client-side gates (PremiumGate) are
// UX only — this is the actual boundary, since routes can be called
// directly regardless of which page reached them.
export async function isPremiumServer(supabase: SupabaseServerClient, profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return false;
  return isPremiumActive(data);
}
