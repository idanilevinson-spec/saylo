import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { PRICING_PLANS } from "@/lib/subscriptions/plans";
import type { BillingDocument } from "@/types/database";
import { createReceipt, invoicesEnabled } from "./invoicePlusClient";

// Every successful web payment gets exactly one receipt. The flow is always:
// record the payment as a 'pending' row (idempotent on payment_ref), then ask
// Invoice+ for the document. The second step can fail — Invoice+ not yet
// switched on, a timeout — and that's fine: the row stays open, the daily
// cron retries it, and the admin billing screen shows it until it's issued.

// After this many failed attempts the cron stops retrying on its own; the
// row stays 'failed' on the admin screen for someone to look at.
export const MAX_AUTO_ATTEMPTS = 5;

export interface PaymentRecord {
  paymentRef: string;
  source: BillingDocument["source"];
  profileId: string | null;
  amountIls: number;
  description: string;
  customerName: string;
  customerEmail: string | null;
  paidAt?: Date;
  paymentMethod?: BillingDocument["payment_method"];
  createdBy?: string | null;
}

export function planDescription(planCode: string | null | undefined): string {
  const plan = PRICING_PLANS.find((p) => p.code === planCode);
  return plan ? `מנוי Saylo — ${plan.label}` : "מנוי Saylo";
}

// Returns the row for this payment — the existing one if the same payment
// was already recorded (a webhook delivered twice, a cron rerun).
export async function recordPayment(payment: PaymentRecord): Promise<BillingDocument> {
  const { data: existing } = await supabaseAdmin
    .from("billing_documents")
    .select("*")
    .eq("payment_ref", payment.paymentRef)
    .maybeSingle();
  if (existing) return existing as BillingDocument;

  const { data, error } = await supabaseAdmin
    .from("billing_documents")
    .insert({
      payment_ref: payment.paymentRef,
      source: payment.source,
      profile_id: payment.profileId,
      amount_ils: payment.amountIls,
      description: payment.description,
      customer_name: payment.customerName,
      customer_email: payment.customerEmail,
      paid_at: (payment.paidAt ?? new Date()).toISOString(),
      payment_method: payment.paymentMethod ?? "credit-card",
      created_by: payment.createdBy ?? null,
    })
    .select("*")
    .single();
  if (error) {
    // Lost a race with a concurrent delivery of the same payment — read the
    // winner's row instead of failing.
    if (error.code === "23505") {
      const { data: winner } = await supabaseAdmin.from("billing_documents").select("*").eq("payment_ref", payment.paymentRef).single();
      if (winner) return winner as BillingDocument;
    }
    throw new Error(`recordPayment failed: ${error.message}`);
  }
  return data as BillingDocument;
}

export async function issueReceipt(doc: BillingDocument): Promise<BillingDocument> {
  if (doc.status === "issued") return doc;
  if (!invoicesEnabled()) return doc;

  try {
    const issued = await createReceipt({
      uniqueIdentifier: doc.payment_ref,
      customerName: doc.customer_name,
      customerEmail: doc.customer_email,
      description: doc.description,
      amountIls: Number(doc.amount_ils),
      paidAt: new Date(doc.paid_at),
      paymentMethod: doc.payment_method,
    });
    const now = new Date().toISOString();
    const { data } = await supabaseAdmin
      .from("billing_documents")
      .update({
        status: "issued",
        doc_uid: issued.docUid,
        doc_number: issued.number,
        pdf_url: issued.pdfUrl,
        issued_at: now,
        attempts: doc.attempts + 1,
        last_error: null,
        updated_at: now,
      })
      .eq("id", doc.id)
      .select("*")
      .single();
    return (data as BillingDocument) ?? { ...doc, status: "issued" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("receipt issue failed for", doc.payment_ref, message);
    const { data } = await supabaseAdmin
      .from("billing_documents")
      .update({ status: "failed", attempts: doc.attempts + 1, last_error: message.slice(0, 1000), updated_at: new Date().toISOString() })
      .eq("id", doc.id)
      .select("*")
      .single();
    return (data as BillingDocument) ?? { ...doc, status: "failed" };
  }
}

// The one call payment code makes. Never throws: a receipt problem must not
// turn a successful payment into a failed webhook or a skipped renewal.
export async function recordPaymentAndIssueReceipt(payment: PaymentRecord): Promise<BillingDocument | null> {
  try {
    return await issueReceipt(await recordPayment(payment));
  } catch (err) {
    console.error("receipt bookkeeping failed for", payment.paymentRef, err);
    return null;
  }
}

export async function retryOpenReceipts(limit = 50): Promise<{ issued: number; stillOpen: number }> {
  if (!invoicesEnabled()) return { issued: 0, stillOpen: 0 };
  const { data } = await supabaseAdmin
    .from("billing_documents")
    .select("*")
    .in("status", ["pending", "failed"])
    .lt("attempts", MAX_AUTO_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit);

  let issued = 0;
  let stillOpen = 0;
  for (const doc of (data ?? []) as BillingDocument[]) {
    const result = await issueReceipt(doc);
    if (result.status === "issued") issued++;
    else stillOpen++;
  }
  return { issued, stillOpen };
}
