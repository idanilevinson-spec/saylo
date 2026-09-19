import type { createClient } from "@/lib/supabase/serverClient";
import { requiresParentalConsent } from "./consentGate";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Server-side twin of the client-side consent gate. A signed-in user with no
// profile row yet has told us no age, so they are treated as not cleared.
export async function hasParentalClearance(supabase: SupabaseServerClient, profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("age_band, parental_consent_status")
    .eq("id", profileId)
    .maybeSingle();
  if (!data) return false;
  return !requiresParentalConsent(data);
}
