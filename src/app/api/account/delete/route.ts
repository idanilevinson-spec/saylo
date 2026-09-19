import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { stripe } from "@/lib/subscriptions/stripeClient";

// Permanently deletes the signed-in user's account (App Store Guideline
// 5.1.1(v)). Deleting the auth.users row cascades to profiles and every table
// that references it, so there is nothing else to clean up by hand. Only the
// caller's own session can trigger this, and never for another user id.
//
// Stripe billing is stopped first: if that fails the account is left intact,
// so nobody ends up deleted but still being charged. An Apple subscription
// can't be cancelled from here — the app tells the user to do that in their
// Apple ID settings before deleting.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { confirm } = (await request.json().catch(() => ({}))) as { confirm?: boolean };
  if (confirm !== true) return NextResponse.json({ error: "missing confirmation" }, { status: 400 });

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_subscription_id, billing_provider")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (sub?.billing_provider === "stripe" && sub.stripe_subscription_id) {
    try {
      const existing = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      if (existing.status !== "canceled") {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      }
    } catch (err) {
      if ((err as { code?: string }).code !== "resource_missing") {
        console.error("account delete: could not cancel stripe subscription", err);
        return NextResponse.json({ error: "could not cancel subscription" }, { status: 502 });
      }
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account delete: could not delete user", error.message);
    return NextResponse.json({ error: "could not delete account" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
