import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/subscriptions/stripeClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Stripe calls this directly (server-to-server) — there's no user session,
// so the signature check IS the authentication. Only after that passes do
// we touch the database, and only then with the service-role client (see
// migration 006: regular users can't update their own subscription row).

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const unix = subscription.items.data[0]?.current_period_end;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "placeholder-stripe-webhook-secret") {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const profileId = session.metadata?.profile_id ?? session.client_reference_id ?? undefined;
      const planId = session.metadata?.plan_id ?? null;
      if (profileId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabaseAdmin.from("subscriptions").upsert({
          profile_id: profileId,
          plan_id: planId,
          status: "active",
          stripe_customer_id: (session.customer as string) ?? null,
          stripe_subscription_id: subscription.id,
          current_period_end: periodEndIso(subscription),
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const profileId = subscription.metadata?.profile_id;
      if (profileId) {
        const status = subscription.status === "past_due" ? "past_due" : "active";
        await supabaseAdmin
          .from("subscriptions")
          .update({ status, current_period_end: periodEndIso(subscription), updated_at: new Date().toISOString() })
          .eq("profile_id", profileId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const profileId = subscription.metadata?.profile_id;
      if (profileId) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("profile_id", profileId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
