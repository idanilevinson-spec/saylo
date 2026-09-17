import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// RevenueCat calls this directly (server-to-server) for every purchase/
// renewal/cancellation event from Apple's StoreKit — the iOS-native
// counterpart to the Stripe webhook. There's no user session here either,
// so the Authorization header (a value you set once in the RevenueCat
// dashboard when configuring this webhook URL) IS the authentication,
// exactly like Stripe's signature check plays that role there.
//
// app_user_id is our own Supabase profile_id — the client configures the
// SDK with `appUserID: profile.id` (see nativeIap.ts), so RevenueCat never
// needs its own separate identity mapping for this app.

const ACTIVE_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "REFUND_REVERSED",
]);
const CANCELED_EVENT_TYPES = new Set(["CANCELLATION", "EXPIRATION"]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  product_id: string;
  expiration_at_ms: number | null;
  environment: "SANDBOX" | "PRODUCTION";
}

export async function POST(request: Request) {
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "webhook not configured" }, { status: 500 });

  const authHeader = request.headers.get("authorization");
  if (authHeader !== webhookSecret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as { event?: RevenueCatEvent };
  const event = body.event;
  if (!event?.app_user_id) return NextResponse.json({ error: "missing event" }, { status: 400 });

  // Sandbox events happen constantly during App Review and while testing —
  // never let one touch a real user's production subscription row.
  if (event.environment !== "PRODUCTION") return NextResponse.json({ received: true, skipped: "sandbox" });

  const profileId = event.app_user_id;

  if (ACTIVE_EVENT_TYPES.has(event.type)) {
    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("id")
      .eq("apple_product_id", event.product_id)
      .maybeSingle();

    await supabaseAdmin.from("subscriptions").upsert({
      profile_id: profileId,
      plan_id: plan?.id ?? null,
      status: "active",
      billing_provider: "apple",
      current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
  } else if (CANCELED_EVENT_TYPES.has(event.type)) {
    // billing_provider guard: only ever touch a row this event's own
    // provider actually owns — a stray Apple event must not overwrite a
    // subscription this profile is really paying for via PayPlus/Stripe.
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: event.type === "EXPIRATION" ? "expired" : "canceled",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .eq("billing_provider", "apple");
  } else if (event.type === "BILLING_ISSUE") {
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("profile_id", profileId)
      .eq("billing_provider", "apple");
  }

  return NextResponse.json({ received: true });
}
