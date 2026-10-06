import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { generatePaymentPageLink } from "@/lib/subscriptions/payplusClient";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { planCode } = (await request.json()) as { planCode?: string };
  if (!planCode) return NextResponse.json({ error: "missing planCode" }, { status: 400 });

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("code", planCode).maybeSingle();
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  // profile_id/plan_id travel in more_info_1/more_info_2 and come back
  // unchanged on the IPN callback (see payplusClient.ts) — that's how the
  // webhook knows which profile/plan a charge belongs to, since PayPlus has
  // no concept of our own ids otherwise. Each id goes in its own field
  // rather than one combined JSON string: PayPlus truncates more_info at
  // 100 characters, which silently corrupted the combined JSON.
  try {
    const { payment_page_link } = await generatePaymentPageLink({
      amount: plan.price_ils,
      planLabel: plan.code,
      customerName: user.user_metadata?.display_name ?? user.email ?? "Saylo",
      customerEmail: user.email ?? "",
      profileId: user.id,
      planId: plan.id,
      successUrl: `${origin}/dashboard?upgraded=1`,
      failureUrl: `${origin}/pricing?checkout=canceled`,
      callbackUrl: `${origin}/api/webhooks/payplus`,
    });
    return NextResponse.json({ url: payment_page_link });
  } catch (err) {
    console.error("payplus checkout failed:", err);
    return NextResponse.json({ error: "checkout failed" }, { status: 502 });
  }
}
