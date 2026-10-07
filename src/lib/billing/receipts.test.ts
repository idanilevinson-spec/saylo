import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { sendReceiptNeededNotification, createReceipt, getTransactionDocuments, invoicesEnabled, rows, updates } = vi.hoisted(() => ({
  sendReceiptNeededNotification: vi.fn(),
  createReceipt: vi.fn(),
  getTransactionDocuments: vi.fn(),
  invoicesEnabled: vi.fn(),
  rows: new Map<string, object>(),
  updates: [] as Record<string, unknown>[],
}));

vi.mock("@/lib/notifications/resend", () => ({ sendReceiptNeededNotification }));
vi.mock("./invoicePlusClient", () => ({ createReceipt, getTransactionDocuments, invoicesEnabled }));

// A small in-memory stand-in for billing_documents, covering only the query
// shapes receipts.ts uses.
vi.mock("@/lib/supabase/adminClient", () => {
  const table = {
    select: () => ({
      eq: (_col: string, ref: string) => ({ maybeSingle: async () => ({ data: rows.get(ref) ?? null }) }),
      in: () => ({ order: () => ({ limit: async () => ({ data: [...rows.values()].filter((r) => (r as { status?: string }).status !== "issued") }) }) }),
    }),
    insert: (row: Record<string, unknown>) => ({
      select: () => ({
        single: async () => {
          const full = { id: `doc-${rows.size + 1}`, status: "pending", attempts: 0, receipt_notified_at: null, ...row };
          rows.set(row.payment_ref as string, full);
          return { data: full, error: null };
        },
      }),
    }),
    update: (patch: Record<string, unknown>) => {
      updates.push(patch);
      const result = { data: null, error: null };
      return { eq: () => ({ select: () => ({ single: async () => result }), then: (r: (v: unknown) => void) => r(result) }) };
    },
  };
  return { supabaseAdmin: { from: () => table } };
});

import { recordPaymentAndIssueReceipt, syncOpenReceipts, syncReceipt } from "./receipts";
import type { BillingDocument } from "@/types/database";

const payment = {
  paymentRef: "payplus:txn-1",
  source: "checkout" as const,
  profileId: "p1",
  amountIls: 59,
  description: "מנוי Saylo — חודשי",
  customerName: "Dana",
  customerEmail: "dana@example.com",
};

function row(over: Partial<BillingDocument> = {}): BillingDocument {
  return {
    id: "doc-1",
    profile_id: "p1",
    payment_ref: "payplus:txn-1",
    source: "checkout",
    doc_type: "receipt",
    status: "pending",
    amount_ils: 59,
    payment_method: "credit-card",
    description: "מנוי Saylo — חודשי",
    customer_name: "Dana",
    customer_email: "dana@example.com",
    paid_at: new Date().toISOString(),
    doc_uid: null,
    doc_number: null,
    pdf_url: null,
    issued_at: null,
    attempts: 0,
    last_error: null,
    created_by: null,
    issued_via: null,
    receipt_notified_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  rows.clear();
  updates.length = 0;
  invoicesEnabled.mockReturnValue(false);
  sendReceiptNeededNotification.mockResolvedValue(true);
});

describe("recordPaymentAndIssueReceipt (PayPlus issues receipts itself)", () => {
  it("only records the payment: no API receipt, no email", async () => {
    const doc = await recordPaymentAndIssueReceipt(payment);
    expect(doc?.status).toBe("pending");
    expect(createReceipt).not.toHaveBeenCalled();
    expect(sendReceiptNeededNotification).not.toHaveBeenCalled();
  });
});

describe("syncReceipt", () => {
  it("marks the row issued with PayPlus's receipt, ignoring a refund document", async () => {
    getTransactionDocuments.mockResolvedValue([
      { type: "Refund Receipt", pdfUrl: "https://x/refund.pdf", number: "9", docUid: null },
      { type: "Receipt", pdfUrl: "https://x/r.pdf", number: "2000", docUid: "u-1" },
    ]);
    await syncReceipt(row());
    expect(getTransactionDocuments).toHaveBeenCalledWith("txn-1", expect.any(Date));
    expect(updates).toContainEqual(
      expect.objectContaining({ status: "issued", issued_via: "invoice_plus", doc_number: "2000", pdf_url: "https://x/r.pdf" })
    );
  });

  it("leaves the row open, with a reason, when PayPlus has no receipt yet", async () => {
    getTransactionDocuments.mockResolvedValue([]);
    await syncReceipt(row());
    expect(updates[0]).not.toHaveProperty("status");
    expect(updates[0]).toEqual(expect.objectContaining({ attempts: 1, last_error: expect.any(String) }));
  });

  it("skips rows it can't look up (no PayPlus transaction uid)", async () => {
    await syncReceipt(row({ payment_ref: "manual:abc" }));
    expect(getTransactionDocuments).not.toHaveBeenCalled();
  });
});

describe("syncOpenReceipts", () => {
  it("emails the owner once a card payment is two days old without a receipt", async () => {
    getTransactionDocuments.mockResolvedValue([]);
    const old = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    rows.set("payplus:txn-1", row({ paid_at: old }));
    rows.set("payplus:txn-2", row({ id: "doc-2", payment_ref: "payplus:txn-2" }));
    rows.set("manual:x", row({ id: "doc-3", payment_ref: "manual:x", source: "manual", paid_at: old }));

    const result = await syncOpenReceipts();

    expect(result).toEqual({ issued: 0, stillOpen: 3, alerted: 1 });
    expect(sendReceiptNeededNotification).toHaveBeenCalledTimes(1);
  });
});
