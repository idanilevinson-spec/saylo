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

// ---- Receipts PayPlus issues on its own ----
//
// The terminal is set (Invoice+ setup, "הגדרות הפקת מסמכים ממסוף סליקה") to
// issue a קבלה automatically after every charge — the first checkout and
// every token renewal alike (Transactions/Charge takes the terminal default
// when initial_invoice isn't sent) — and to email it to the customer. Our
// ledger then only has to find that document for each payment.
// See https://docs.payplus.co.il/reference/post_invoice-getdocuments and
// https://docs.payplus.co.il/reference/get_books-docs-get-uuid.

export interface TransactionDocument {
  type: string;
  pdfUrl: string;
  number: string | null;
  docUid: string | null;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": requiredEnv("PAYPLUS_API_KEY"),
    "secret-key": requiredEnv("PAYPLUS_SECRET_KEY"),
  };
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// GetDocuments returns links but no document number. When the link carries
// the document's uuid, the number comes from books/docs/get — best effort:
// a receipt without a number on our side is still a receipt.
async function documentNumber(docUid: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/books/docs/get/${docUid}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const body = (await res.json()) as { number?: string | number; data?: { number?: string | number } };
    const number = body.number ?? body.data?.number;
    return number === undefined || number === null ? null : String(number);
  } catch {
    return null;
  }
}

// The documents PayPlus generated for one charge. `paidAt` bounds the date
// filter the endpoint requires; a day either side covers time zones.
export async function getTransactionDocuments(transactionUid: string, paidAt: Date): Promise<TransactionDocument[]> {
  const from = new Date(paidAt.getTime() - 24 * 60 * 60 * 1000);
  const until = new Date(paidAt.getTime() + 2 * 24 * 60 * 60 * 1000);
  const res = await fetch(`${BASE_URL}/Invoice/GetDocuments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      transaction_uid: transactionUid,
      filter: { fromDate: israelDate(from), untilDate: israelDate(until) },
    }),
  });
  const raw = await res.text();
  let body: { invoices?: { status?: string; type?: string; original_doc_url?: string; copy_doc_url?: string }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`GetDocuments returned non-JSON (status ${res.status}): ${raw.slice(0, 500)}`);
  }
  if (!res.ok) throw new Error(`GetDocuments failed (status ${res.status}): ${raw.slice(0, 500)}`);

  const docs = (body.invoices ?? []).filter((d) => d.status === "success" && (d.original_doc_url || d.copy_doc_url));
  return Promise.all(
    docs.map(async (d) => {
      const pdfUrl = (d.original_doc_url || d.copy_doc_url) as string;
      const docUid = pdfUrl.match(UUID_RE)?.[0] ?? null;
      return { type: d.type ?? "", pdfUrl, docUid, number: docUid ? await documentNumber(docUid) : null };
    })
  );
}
