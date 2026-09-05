import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { stripe } from "@/lib/subscriptions/stripeClient";

// Cancels (or un-cancels) at period end, never immediately — the user keeps
// the access they already paid for through current_period_end, and billing
// simply stops renewing after that. Same idea as the checkout route: the
// user's own session can only trigger this, but the actual subscriptions
// row is written here (and again, idempotently, by the webhook) using
// Stripe's own response — never a value the client could forge directly.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { cancelAtPeriodEnd } = (await request.json()) as { cancelAtPeriodEnd?: boolean };
  if (typeof cancelAtPeriodEnd !== "boolean") {
    return NextResponse.json({ error: "missing cancelAtPeriodEnd" }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_subscription_id || sub.status !== "active") {
    return NextResponse.json({ error: "no active paid subscription to update" }, { status: 400 });
  }

  const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  await supabaseAdmin
    .from("subscriptions")
    .update({ cancel_at_period_end: updated.cancel_at_period_end, updated_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  return NextResponse.json({ cancelAtPeriodEnd: updated.cancel_at_period_end });
}
