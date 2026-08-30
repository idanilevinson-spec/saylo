import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { stripe } from "@/lib/subscriptions/stripeClient";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { planCode } = (await request.json()) as { planCode?: string };
  if (!planCode) return NextResponse.json({ error: "missing planCode" }, { status: 400 });

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("code", planCode).maybeSingle();
  if (!plan?.stripe_price_id) {
    return NextResponse.json({ error: "plan not found or not linked to Stripe" }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  // stripe_customer_id isn't written here (this route runs with the user's
  // own session, which can't write to subscriptions beyond the initial
  // trial row — see migration 006) — the webhook persists it once the
  // checkout actually completes, using the service-role client.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { profile_id: user.id, plan_id: plan.id },
    subscription_data: { metadata: { profile_id: user.id, plan_id: plan.id } },
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
