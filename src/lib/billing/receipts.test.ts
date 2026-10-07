import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { sendReceiptNeededNotification, createReceipt, invoicesEnabled, rows, updates } = vi.hoisted(() => ({
  sendReceiptNeededNotification: vi.fn(),
  createReceipt: vi.fn(),
  invoicesEnabled: vi.fn(),
  rows: new Map<string, Record<string, unknown>>(),
  updates: [] as Record<string, unknown>[],
}));

vi.mock("@/lib/notifications/resend", () => ({ sendReceiptNeededNotification }));
vi.mock("./invoicePlusClient", () => ({ createReceipt, invoicesEnabled }));

// A tiny in-memory stand-in for the billing_documents table, covering only
// the query shapes receipts.ts uses.
vi.mock("@/lib/supabase/adminClient", () => {
  const table = {
    select: () => ({
      eq: (_col: string, ref: string) => ({ maybeSingle: async () => ({ data: rows.get(ref) ?? null }) }),
    }),
    insert: (row: Record<string, unknown>) => ({
      select: () => ({
        single: async () => {
          const full = { id: "doc-1", status: "pending", attempts: 0, receipt_notified_at: null, ...row };
          rows.set(row.payment_ref as string, full);
          return { data: full, error: null };
        },
      }),
    }),
    update: (patch: Record<string, unknown>) => ({
      eq: async () => {
        updates.push(patch);
        return { error: null };
      },
    }),
  };
  return { supabaseAdmin: { from: () => table } };
});

import { recordPaymentAndIssueReceipt } from "./receipts";

const payment = {
  paymentRef: "payplus:txn-1",
  source: "checkout" as const,
  profileId: "p1",
  amountIls: 59,
  description: "מנוי Saylo — חודשי",
  customerName: "Dana",
  customerEmail: "dana@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
  rows.clear();
  updates.length = 0;
  invoicesEnabled.mockReturnValue(false);
  sendReceiptNeededNotification.mockResolvedValue(true);
});

describe("recordPaymentAndIssueReceipt with automatic issuing off", () => {
  it("records the payment and emails the owner once", async () => {
    const doc = await recordPaymentAndIssueReceipt(payment);
    expect(doc?.status).toBe("pending");
    expect(sendReceiptNeededNotification).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ customerName: "Dana", amountIls: 59, source: "checkout" })
    );
    expect(updates).toContainEqual(expect.objectContaining({ receipt_notified_at: expect.any(String) }));
    expect(createReceipt).not.toHaveBeenCalled();
  });

  it("doesn't email again for a redelivered payment already notified", async () => {
    rows.set(payment.paymentRef, { id: "doc-1", payment_ref: payment.paymentRef, status: "pending", attempts: 0, receipt_notified_at: "2026-10-07T08:00:00Z" });
    await recordPaymentAndIssueReceipt(payment);
    expect(sendReceiptNeededNotification).not.toHaveBeenCalled();
  });

  it("leaves the row un-notified when the email fails, so the next delivery tries again", async () => {
    sendReceiptNeededNotification.mockResolvedValue(false);
    await recordPaymentAndIssueReceipt(payment);
    expect(updates).toHaveLength(0);
  });
});
