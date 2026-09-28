import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { stripe } from "@/lib/subscriptions/stripeClient";
import { setRecurringValid } from "@/lib/subscriptions/payplusClient";

// Cancels (or un-cancels) at period end, never immediately — the user keeps
// the access they already paid for through current_period_end, and billing
// simply stops renewing after that. Same idea as the checkout routes: the
// user's own session can only trigger this, but the actual subscriptions
// row is written here (and again, idempotently, by each provider's webhook)
// using the provider's own response — never a value the client could forge.
//
// Apple subscriptions can only be canceled by the user inside their Apple
// account settings, never from here.
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
    .select("stripe_subscription_id, payplus_recurring_uid, status, billing_provider")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!sub || sub.status !== "active") {
    return NextResponse.json({ error: "no active paid subscription to update" }, { status: 400 });
  }

  if (sub.billing_provider === "stripe") {
    if (!sub.stripe_subscription_id) {
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

  if (sub.billing_provider === "payplus") {
    if (!sub.payplus_recurring_uid) {
      return NextResponse.json({ error: "no active paid subscription to update" }, { status: 400 });
    }
    await setRecurringValid(sub.payplus_recurring_uid, !cancelAtPeriodEnd);
    await supabaseAdmin
      .from("subscriptions")
      .update({ cancel_at_period_end: cancelAtPeriodEnd, updated_at: new Date().toISOString() })
      .eq("profile_id", user.id);
    return NextResponse.json({ cancelAtPeriodEnd });
  }

  return NextResponse.json({ error: "no active paid subscription to update" }, { status: 400 });
}
