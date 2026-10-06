import "server-only";

// PayPlus Invoice+ — the registered invoicing software that produces Saylo's
// receipts. See https://docs.payplus.co.il/reference/post_books-docs-new-doctype.
// Same credentials as the payment API (payplusClient.ts); Invoice+ has to be
// switched on for the account in the PayPlus dashboard, otherwise every call
// here fails and the documents stay 'pending' until it is.
const BASE_URL = "https://restapi.payplus.co.il/api/v1.0";

// The seller is an עוסק פטור: the only document a payment gets is a receipt
// (type 400 in the Tax Authority's numbering, "inv_receipt" in PayPlus),
// with no VAT on it. Never a tax invoice or tax-invoice-receipt.
const RECEIPT_DOC_TYPE = "inv_receipt";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it in Vercel (Production).`);
  return value;
}

export function invoicesEnabled(): boolean {
  return process.env.PAYPLUS_INVOICES_ENABLED === "true";
}

export interface ReceiptRequest {
  uniqueIdentifier: string;
  customerName: string;
  customerEmail: string | null;
  description: string;
  amountIls: number;
  paidAt: Date;
  paymentMethod: "credit-card" | "bank-transfer" | "cash" | "payment-app" | "other";
}

export interface IssuedReceipt {
  docUid: string;
  number: string;
  pdfUrl: string | null;
}

// Dates on the document are Israeli calendar dates, not UTC ones — a payment
// at 01:00 Israel time is still "today" on the receipt.
export function israelDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function buildReceiptBody(req: ReceiptRequest) {
  const date = israelDate(req.paidAt);
  return {
    doc_date: date,
    unique_identifier: req.uniqueIdentifier,
    language: "he",
    currency_code: "ILS",
    vatType: "vat-type-exempt",
    // PayPlus emails the PDF to the customer itself when there's an address.
    send_document_email: Boolean(req.customerEmail),
    customer: {
      name: req.customerName,
      customer_name: req.customerName,
      email: req.customerEmail ?? "",
    },
    items: [
      {
        name: req.description,
        quantity: 1,
        price: req.amountIls,
        vat_type_code: "vat-type-exempt",
      },
    ],
    payments: [
      {
        payment_type: req.paymentMethod,
        payment_date: date,
        amount: req.amountIls,
        currency_code: "ILS",
      },
    ],
    totalAmount: req.amountIls,
  };
}

export async function createReceipt(req: ReceiptRequest): Promise<IssuedReceipt> {
  const res = await fetch(`${BASE_URL}/books/docs/new/${RECEIPT_DOC_TYPE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": requiredEnv("PAYPLUS_API_KEY"),
      "secret-key": requiredEnv("PAYPLUS_SECRET_KEY"),
    },
    body: JSON.stringify(buildReceiptBody(req)),
  });

  const raw = await res.text();
  let body: {
    results?: { status?: string };
    data?: { docUID?: string; number?: string | number; originalDocAddress?: string; copyDocAddress?: string };
    docUID?: string;
    number?: string | number;
    originalDocAddress?: string;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`Invoice+ returned non-JSON (status ${res.status}): ${raw.slice(0, 500)}`);
  }
  // The reference shows the document fields at the top level; other PayPlus
  // endpoints wrap them in data. Accept either rather than guess wrong.
  const doc = body.data ?? body;
  if (!res.ok || body.results?.status === "error" || !doc.docUID || doc.number === undefined) {
    throw new Error(`Invoice+ receipt failed (status ${res.status}): ${raw.slice(0, 500)}`);
  }
  return {
    docUid: doc.docUID,
    number: String(doc.number),
    pdfUrl: doc.originalDocAddress ?? null,
  };
}
