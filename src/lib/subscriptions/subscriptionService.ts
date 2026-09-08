import { supabase } from "@/lib/supabase/browserClient";
import { isPremiumActive, isPaidActive } from "./entitlements";

export async function isUserPremium(profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();

  // No row (shouldn't normally happen — created at profile setup) defaults
  // to non-premium rather than open access.
  if (!data) return false;
  return isPremiumActive(data);
}

// Stricter check for the AI Teacher chat/voice conversation — see
// isPaidActive: unlike isUserPremium, an active trial does not qualify.
export async function isUserPaidSubscriber(profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return false;
  return isPaidActive(data);
}
