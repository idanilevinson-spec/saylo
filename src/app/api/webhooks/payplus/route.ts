import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { isValidPayplusCallback } from "@/lib/subscriptions/payplusClient";

// PayPlus calls this directly (server-to-server) for the initial charge and
// every automatic recurring renewal — there's no user session here, so the
// HMAC hash check IS the authentication (see payplusClient.ts). Fires once
// per charge attempt, success or failure (send_failure_callback is set on
// checkout), the same shape both times except for status_code.
//
// more_info carries our own ids back unchanged (set in the checkout route)
// since PayPlus has no concept of our profile/plan ids otherwise.
interface PayplusCallback {
  status_code?: string;
  more_info?: string;
  recurring_charge_information?: { recurring_uid?: string };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const hash = request.headers.get("hash");
  if (!isValidPayplusCallback(rawBody, hash)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PayplusCallback;
  let moreInfo: { profile_id?: string; plan_id?: string } = {};
  try {
    moreInfo = event.more_info ? JSON.parse(event.more_info) : {};
  } catch {
    return NextResponse.json({ error: "unparseable more_info" }, { status: 400 });
  }
  const profileId = moreInfo.profile_id;
  if (!profileId) return NextResponse.json({ error: "missing profile_id" }, { status: 400 });

  const succeeded = event.status_code === "000";
  const recurringUid = event.recurring_charge_information?.recurring_uid ?? null;

  if (succeeded) {
    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("months")
      .eq("id", moreInfo.plan_id ?? "")
      .maybeSingle();
    const months = plan?.months ?? 1;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + months);

    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      profile_id: profileId,
      plan_id: moreInfo.plan_id ?? null,
      status: "active",
      billing_provider: "payplus",
      payplus_recurring_uid: recurringUid,
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("payplus webhook write failed:", error.message);
      return NextResponse.json({ error: "write failed" }, { status: 500 });
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
