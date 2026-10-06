import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { isValidPayplusCallback } from "@/lib/subscriptions/payplusClient";
import { planDescription, recordPaymentAndIssueReceipt } from "@/lib/billing/receipts";
import { customerForProfile } from "@/lib/billing/customer";

// PayPlus calls this directly (server-to-server) for the initial checkout
// charge — there's no user session here, so the HMAC hash check IS the
// authentication (see payplusClient.ts). Fires once per charge attempt,
// success or failure (send_failure_callback is set on checkout), the same
// shape both times except for status_code.
//
// more_info_1/more_info_2 carry our own ids back unchanged (set in the
// checkout route) since PayPlus has no concept of our profile/plan ids
// otherwise. They're two separate short fields, not one combined JSON
// string in `more_info`: PayPlus silently truncates `more_info` at 100
// characters, which corrupted every single real callback's combined
// `{"profile_id":...,"plan_id":...}` JSON (102+ chars) into invalid JSON —
// every charge failed JSON.parse with a 400, and PayPlus kept retrying the
// same broken callback every 5 minutes, which is what full raw-body
// logging below is for: that's how this got caught.
//
// Only the FIRST charge comes through here now — renewals are charged
// directly by api/cron/payplus-renewals via chargeToken, which gets its
// result synchronously and doesn't need a callback at all. So this is also
// the only place the card token/customer_uid is ever captured, which makes
// getting it right on this call the one thing that matters for every later
// renewal to work.
//
// PayPlus's own IPN docs don't give a concrete example payload, and the
// first real test charge proved the generic docs example was wrong: status
// and more_info are nested under `transaction`, NOT top-level, which meant
// every successful charge was silently falling into the `else` (failure)
// branch below and never writing a subscription row at all. The shape here
// is taken from that real logged payload, not the docs — see the raw body
// log line if PayPlus ever changes it again.
interface PayplusCallback {
  transaction?: { uid?: string; status_code?: string; more_info_1?: string; more_info_2?: string };
  data?: {
    customer_uid?: string;
    card_information?: { token?: string };
    transaction_uid?: string;
    transaction?: { uid?: string };
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  console.log("payplus webhook raw body:", rawBody);
  const hash = request.headers.get("hash");
  if (!isValidPayplusCallback(rawBody, hash)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PayplusCallback;
  const profileId = event.transaction?.more_info_1 || undefined;
  const planId = event.transaction?.more_info_2 || undefined;
  if (!profileId) return NextResponse.json({ error: "missing profile_id" }, { status: 400 });

  const succeeded = event.transaction?.status_code === "000";
  const token = event.data?.card_information?.token ?? null;
  const customerUid = event.data?.customer_uid ?? null;

  if (succeeded) {
    if (!token || !customerUid) {
      console.error("payplus webhook: no card token captured on a successful charge — renewals will not work for",
        profileId);
    }

    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("months, price_ils, code")
      .eq("id", planId ?? "")
      .maybeSingle();
    const months = plan?.months ?? 1;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + months);

    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      profile_id: profileId,
      plan_id: planId ?? null,
      status: "active",
      billing_provider: "payplus",
      payplus_token: token,
      payplus_customer_uid: customerUid,
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("payplus webhook write failed:", error.message);
      return NextResponse.json({ error: "write failed" }, { status: 500 });
    }

    // The receipt. Keyed on PayPlus's transaction uid so a redelivered
    // callback finds the same row instead of issuing a second document.
    const transactionUid = event.transaction?.uid ?? event.data?.transaction_uid ?? event.data?.transaction?.uid ?? null;
    if (plan?.price_ils) {
      const customer = await customerForProfile(profileId);
      await recordPaymentAndIssueReceipt({
        paymentRef: transactionUid ? `payplus:${transactionUid}` : `checkout:${profileId}:${periodEnd.toISOString().slice(0, 10)}`,
        source: "checkout",
        profileId,
        amountIls: plan.price_ils,
        description: planDescription(plan.code),
        customerName: customer.name,
        customerEmail: customer.email,
      });
    }
  } else {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("profile_id", profileId)
      .eq("billing_provider", "payplus");
    if (error) {
      console.error("payplus webhook write failed:", error.message);
      return NextResponse.json({ error: "write failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
