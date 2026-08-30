import { supabase } from "@/lib/supabase/browserClient";
import { isPremiumActive } from "./entitlements";

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
