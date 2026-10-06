import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildReceiptBody, israelDate } from "./invoicePlusClient";

describe("israelDate", () => {
  it("uses the Israeli calendar date, not the UTC one", () => {
    // 22:30 UTC on Oct 5 is already Oct 6 in Israel (UTC+3).
    expect(israelDate(new Date("2026-10-05T22:30:00Z"))).toBe("2026-10-06");
  });
});

describe("buildReceiptBody", () => {
  const body = buildReceiptBody({
    uniqueIdentifier: "payplus:txn-1",
    customerName: "Dana",
    customerEmail: "dana@example.com",
    description: "מנוי Saylo — חודשי",
    amountIls: 59,
    paidAt: new Date("2026-10-06T09:00:00Z"),
    paymentMethod: "credit-card",
  });

  it("is a VAT-exempt receipt — the seller is an עוסק פטור", () => {
    expect(body.vatType).toBe("vat-type-exempt");
    expect(body.items.every((i) => i.vat_type_code === "vat-type-exempt")).toBe(true);
  });

  it("carries the payment ref as PayPlus's idempotency key", () => {
    expect(body.unique_identifier).toBe("payplus:txn-1");
  });

  it("balances items against payments", () => {
    const items = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const payments = body.payments.reduce((s, p) => s + p.amount, 0);
    expect(items).toBe(59);
    expect(payments).toBe(59);
    expect(body.totalAmount).toBe(59);
  });

  it("only asks PayPlus to email when there is an address", () => {
    expect(body.send_document_email).toBe(true);
    const noEmail = buildReceiptBody({
      uniqueIdentifier: "x",
      customerName: "School",
      customerEmail: null,
      description: "d",
      amountIls: 10,
      paidAt: new Date(),
      paymentMethod: "bank-transfer",
    });
    expect(noEmail.send_document_email).toBe(false);
  });
});
