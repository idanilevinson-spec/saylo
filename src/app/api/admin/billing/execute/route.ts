import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { BillingProposal } from "@/lib/billing/agent";
import { issueReceipt, recordPayment } from "@/lib/billing/receipts";
import { invoicesEnabled } from "@/lib/billing/invoicePlusClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { BillingDocument } from "@/types/database";

// The only place a receipt is issued on a person's say-so: the admin pressed
// "confirm" on a card the billing agent prepared. The proposal is validated
// again here — the card's content is whatever the browser sends back.
export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!invoicesEnabled()) {
    return NextResponse.json({ error: "הפקת קבלות כבויה (PAYPLUS_INVOICES_ENABLED)." }, { status: 409 });
  }

  const parsed = BillingProposal.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid proposal" }, { status: 400 });
  const proposal = parsed.data;

  let doc: BillingDocument;
  if (proposal.kind === "manual_receipt") {
    doc = await recordPayment({
      paymentRef: `manual:${randomUUID()}`,
      source: "manual",
      profileId: proposal.profile_id,
      amountIls: proposal.amount_ils,
      description: proposal.description,
      customerName: proposal.customer_name,
      customerEmail: proposal.customer_email,
      // Noon Israel time, so the calendar date can't shift in conversion.
      paidAt: new Date(`${proposal.paid_at}T12:00:00+03:00`),
      paymentMethod: proposal.payment_method,
      createdBy: adminId,
    });
  } else {
    const { data } = await supabaseAdmin.from("billing_documents").select("*").eq("id", proposal.document_id).maybeSingle();
    if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
    doc = data as BillingDocument;
  }

  const result = await issueReceipt(doc);
  await supabaseAdmin.from("admin_audit_log").insert({
    admin_profile_id: adminId,
    action: proposal.kind === "manual_receipt" ? "billing.manual_receipt" : "billing.retry_receipt",
    target_type: "billing_document",
    target_id: result.id,
    details: { status: result.status, amount_ils: result.amount_ils, doc_number: result.doc_number },
  });

  if (result.status !== "issued") {
    return NextResponse.json({ error: result.last_error ?? "Invoice+ did not issue the receipt", document: result }, { status: 502 });
  }
  return NextResponse.json({ document: result });
}
