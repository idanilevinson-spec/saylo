import "server-only";
import { createClient } from "@/lib/supabase/serverClient";

// Resolves the signed-in admin's id, or null for anyone else. The billing
// routes act with the service role, so this check is the whole gate.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return profile?.is_admin ? user.id : null;
}
