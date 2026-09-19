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

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  product_id: string;
  expiration_at_ms: number | null;
  environment: "SANDBOX" | "PRODUCTION";
}

// A database failure must not look like success: returning 500 makes
// RevenueCat show the failed delivery and retry it.
function failed(message: string) {
  console.error("revenuecat webhook write failed:", message);
  return NextResponse.json({ error: "write failed" }, { status: 500 });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "webhook not configured" }, { status: 500 });

  const authHeader = request.headers.get("authorization");
  if (authHeader !== webhookSecret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as { event?: RevenueCatEvent };
  const event = body.event;
  if (!event?.app_user_id) return NextResponse.json({ error: "missing event" }, { status: 400 });

  // Sandbox events are deliberately processed: TestFlight and App Review
  // purchases are always sandbox, and skipping them would leave the buyer
  // without access. app_user_id is the buyer's own profile id, so a sandbox
  // purchase can only ever touch that same person's row.
  const profileId = event.app_user_id;

  if (ACTIVE_EVENT_TYPES.has(event.type)) {
    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("id")
      .eq("apple_product_id", event.product_id)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      profile_id: profileId,
      plan_id: plan?.id ?? null,
      status: "active",
      billing_provider: "apple",
      current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
    if (error) return failed(error.message);
  } else if (event.type === "CANCELLATION" || event.type === "EXPIRATION") {
    // CANCELLATION means auto-renew was switched off (or a refund) — the
    // user has paid through expiration_at_ms, so access must continue until
    // then and only EXPIRATION ends it. A refund arrives with an expiration
    // already in the past, which is treated as ended.
    const expiresAt = event.expiration_at_ms;
    const ended = event.type === "EXPIRATION" || (expiresAt !== null && expiresAt <= Date.now());
    const update = ended
      ? { status: "expired", cancel_at_period_end: false }
      : {
          cancel_at_period_end: true,
          ...(expiresAt ? { current_period_end: new Date(expiresAt).toISOString() } : {}),
        };

    // billing_provider guard: only ever touch a row this event's own
    // provider actually owns — a stray Apple event must not overwrite a
    // subscription this profile is really paying for via PayPlus/Stripe.
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("profile_id", profileId)
      .eq("billing_provider", "apple");
    if (error) return failed(error.message);
  } else if (event.type === "BILLING_ISSUE") {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("profile_id", profileId)
      .eq("billing_provider", "apple");
    if (error) return failed(error.message);
  }

  return NextResponse.json({ received: true });
}
