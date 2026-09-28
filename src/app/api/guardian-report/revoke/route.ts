import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Lets the MINOR turn the guardian report off from their own profile, same
// right the spec (§3.2) gives the guardian via the unsubscribe link in
// every report email. Works from 'pending' or 'granted' — either way, the
// minor is saying "don't send this."
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("guardian_report_consents")
    .update({ status: "revoked", resolved_at: new Date().toISOString() })
    .eq("minor_profile_id", user.id)
    .in("status", ["pending", "granted"]);

  if (error) return NextResponse.json({ error: "failed to revoke" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
