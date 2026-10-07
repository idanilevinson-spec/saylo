import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { PRICING_PLANS } from "@/lib/subscriptions/plans";
import type { BillingDocument } from "@/types/database";
import { sendReceiptNeededNotification } from "@/lib/notifications/resend";
import { createReceipt, getTransactionDocuments, invoicesEnabled } from "./invoicePlusClient";

// Webhooks and crons have no request origin to build the link from.
const SITE_URL = "https://saylolearn.com";

// Every successful web payment gets exactly one receipt, and this ledger
// tracks it: the payment is recorded as a 'pending' row (idempotent on
// payment_ref) the moment the charge succeeds, and the row is marked issued
// once the receipt exists — found in PayPlus (it issues receipts itself),
// or recorded by the owner for a payment made outside the site.

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
        issued_via: "invoice_plus",
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

// A receipt PayPlus issued for this payment, found by the charge's
// transaction uid ("payplus:<uid>" refs). Refund documents (קבלה זיכוי) for
// the same transaction are skipped: they don't stand in for the receipt.
function isRefundDoc(type: string): boolean {
  return /refund|credit|זיכוי/i.test(type);
}

export async function syncReceipt(doc: BillingDocument): Promise<BillingDocument> {
  if (doc.status === "issued" || !doc.payment_ref.startsWith("payplus:")) return doc;
  const transactionUid = doc.payment_ref.slice("payplus:".length);
  const now = new Date().toISOString();
  try {
    const found = (await getTransactionDocuments(transactionUid, new Date(doc.paid_at))).find((d) => !isRefundDoc(d.type));
    if (!found) {
      const { data } = await supabaseAdmin
        .from("billing_documents")
        .update({ attempts: doc.attempts + 1, last_error: "PayPlus עוד לא הפיקה קבלה לעסקה הזו.", updated_at: now })
        .eq("id", doc.id)
        .select("*")
        .single();
      return (data as BillingDocument) ?? doc;
    }
    const { data } = await supabaseAdmin
      .from("billing_documents")
      .update({
        status: "issued",
        issued_via: "invoice_plus",
        doc_uid: found.docUid,
        doc_number: found.number,
        pdf_url: found.pdfUrl,
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
    console.error("receipt sync failed for", doc.payment_ref, message);
    const { data } = await supabaseAdmin
      .from("billing_documents")
      .update({ attempts: doc.attempts + 1, last_error: message.slice(0, 1000), updated_at: now })
      .eq("id", doc.id)
      .select("*")
      .single();
    return (data as BillingDocument) ?? doc;
  }
}

// The one call payment code makes. Never throws: a receipt problem must not
// turn a successful payment into a failed webhook or a skipped renewal.
//
// Normally PayPlus issues the receipt itself (see invoicePlusClient.ts), so
// this only records the payment; the receipt's number and PDF are filled in
// by syncOpenReceipts. PAYPLUS_INVOICES_ENABLED switches to issuing it from
// here through the API instead — never both, or every payment gets two.
export async function recordPaymentAndIssueReceipt(payment: PaymentRecord): Promise<BillingDocument | null> {
  try {
    const doc = await recordPayment(payment);
    return invoicesEnabled() ? await issueReceipt(doc) : doc;
  } catch (err) {
    console.error("receipt bookkeeping failed for", payment.paymentRef, err);
    return null;
  }
}

// After this long without a receipt, the owner is emailed about the payment:
// PayPlus normally issues within minutes, so two days means something is
// wrong (the terminal setting changed, the document failed) and the law
// wants a receipt promptly.
const ALERT_AFTER_MS = 48 * 60 * 60 * 1000;

async function alertMissingReceipt(doc: BillingDocument): Promise<void> {
  const sent = await sendReceiptNeededNotification({
    customerName: doc.customer_name,
    customerEmail: doc.customer_email,
    amountIls: Number(doc.amount_ils),
    description: doc.description,
    paidAt: doc.paid_at,
    source: doc.source,
    adminUrl: `${SITE_URL}/admin/billing`,
  });
  if (sent) {
    await supabaseAdmin.from("billing_documents").update({ receipt_notified_at: new Date().toISOString() }).eq("id", doc.id);
  }
}

// Daily (renewals cron) and on demand (admin "sync" button).
export async function syncOpenReceipts(limit = 100): Promise<{ issued: number; stillOpen: number; alerted: number }> {
  const { data } = await supabaseAdmin
    .from("billing_documents")
    .select("*")
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: true })
    .limit(limit);

  let issued = 0;
  let stillOpen = 0;
  let alerted = 0;
  for (const row of (data ?? []) as BillingDocument[]) {
    const doc = invoicesEnabled() ? (row.attempts < MAX_AUTO_ATTEMPTS ? await issueReceipt(row) : row) : await syncReceipt(row);
    if (doc.status === "issued") {
      issued++;
      continue;
    }
    stillOpen++;
    // Manual rows (a school's bank transfer) are entered by the owner, who
    // already knows they need a receipt.
    if (doc.source !== "manual" && !doc.receipt_notified_at && Date.now() - new Date(doc.paid_at).getTime() > ALERT_AFTER_MS) {
      await alertMissingReceipt(doc);
      alerted++;
    }
  }
  return { issued, stillOpen, alerted };
}
