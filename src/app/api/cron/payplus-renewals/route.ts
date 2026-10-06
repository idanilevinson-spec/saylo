import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { chargeToken } from "@/lib/subscriptions/payplusClient";

// Daily job (see vercel.json). The PayPlus account has no permission for
// PayPlus's own recurring-billing engine, only for card tokenization (see
// payplusClient.ts), so renewals are our own responsibility: find every
// payplus subscription due within the next day, charge its saved token
// ourselves, and extend current_period_end on success. A failed charge is
// marked past_due, which isPremiumActive/isPaidActive already treat as not
// premium — access lapses with no other code path needed.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dueBy = new Date();
  dueBy.setDate(dueBy.getDate() + 1);

  const { data: due, error: queryError } = await supabaseAdmin
    .from("subscriptions")
    .select("profile_id, current_period_end, payplus_token, payplus_customer_uid, subscription_plans(months, price_ils)")
    .eq("billing_provider", "payplus")
    .eq("status", "active")
    .eq("cancel_at_period_end", false)
    .lte("current_period_end", dueBy.toISOString());

  if (queryError) {
    console.error("payplus renewals: failed to query due subscriptions", queryError.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  let charged = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of due ?? []) {
    const plan = sub.subscription_plans as unknown as { months: number; price_ils: number } | null;
    if (!plan || !sub.payplus_token || !sub.payplus_customer_uid) {
      console.error("payplus renewals: skipping", sub.profile_id, "— missing token, customer_uid or plan");
      skipped++;
      continue;
    }

    try {
      await chargeToken({
        amount: plan.price_ils,
        token: sub.payplus_token,
        customerUid: sub.payplus_customer_uid,
        profileId: sub.profile_id,
      });

      // Extend from the period that just ended, not from "now" — a renewal
      // run a few hours early or late shouldn't drift the customer's
      // billing date.
      const nextPeriodEnd = new Date(sub.current_period_end ?? Date.now());
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + plan.months);

      await supabaseAdmin
        .from("subscriptions")
        .update({ current_period_end: nextPeriodEnd.toISOString(), updated_at: new Date().toISOString() })
        .eq("profile_id", sub.profile_id);
      charged++;
    } catch (err) {
      console.error("payplus renewals: charge failed for", sub.profile_id, err);
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("profile_id", sub.profile_id);
      failed++;
    }
  }

  return NextResponse.json({ charged, failed, skipped });
}
