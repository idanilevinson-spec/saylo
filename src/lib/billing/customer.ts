import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Who a receipt is made out to. The sign-up flow only asks for a nickname
// (data minimisation), so the name on the receipt is that nickname unless
// the person's auth metadata has a fuller one — and the email is the one
// they signed in with, which is also where Invoice+ sends the PDF.
//
// Never throws: it runs right after a successful charge, and a lookup
// problem there must not be mistaken for a failed payment.
export async function customerForProfile(profileId: string): Promise<{ name: string; email: string | null }> {
  try {
    const [{ data: profile }, { data: auth }] = await Promise.all([
      supabaseAdmin.from("profiles").select("display_name").eq("id", profileId).maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(profileId),
    ]);
    const user = auth?.user;
    const metaName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
    const name = (metaName || profile?.display_name || user?.email || "לקוח Saylo").trim();
    return { name, email: user?.email ?? null };
  } catch (err) {
    console.error("customerForProfile failed for", profileId, err);
    return { name: "לקוח Saylo", email: null };
  }
}
