import type { createClient } from "@/lib/supabase/serverClient";
import { isPremiumActive, isPaidActive } from "./entitlements";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Server-side check for API routes gating an AI-cost feature (Writing Coach,
// Teacher suggestions). Client-side gates (PremiumGate) are UX only — this
// is the actual boundary, since routes can be called directly regardless of
// which page reached them.
export async function isPremiumServer(supabase: SupabaseServerClient, profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return false;
  return isPremiumActive(data);
}

// Same real boundary as isPremiumServer, but for the AI Teacher chat/voice
// conversation route specifically — deliberately excludes the 3-day trial
// (see isPaidActive), since a live back-and-forth conversation is a much
// larger recurring AI cost than the other trial-included features.
export async function isPaidServer(supabase: SupabaseServerClient, profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return false;
  return isPaidActive(data);
}
