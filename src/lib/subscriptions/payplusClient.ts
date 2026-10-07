import "server-only";
import { createHmac } from "node:crypto";

// PayPlus REST API — see https://docs.payplus.co.il/reference/payplus-rest-api-urls
// and https://docs.payplus.co.il/reference/post_paymentpages-generatelink.
// Production only: this account has no separate sandbox credentials set up.
const BASE_URL = "https://restapi.payplus.co.il/api/v1.0";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it in Vercel (Production).`);
  return value;
}

interface GenerateLinkParams {
  amount: number;
  planLabel: string;
  customerName: string;
  customerEmail: string;
  profileId: string;
  planId: string;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
}

interface GenerateLinkResponse {
  data: { payment_page_link: string; page_request_uid: string };
}

// The merchant account isn't approved for PayPlus's own recurring-billing
// engine (charge_method 3 + recurring_settings — that call returns
// 422 "dont-have-permission-recurring-payment"), only for tokenization.
// So this is a plain one-time charge that also asks PayPlus to hand back a
// reusable card token (create_token) — see chargeToken below, and the
// api/cron/payplus-renewals job that actually charges it again each period.
export async function generatePaymentPageLink(params: GenerateLinkParams): Promise<GenerateLinkResponse["data"]> {
  const res = await fetch(`${BASE_URL}/PaymentPages/generateLink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": requiredEnv("PAYPLUS_API_KEY"),
      "secret-key": requiredEnv("PAYPLUS_SECRET_KEY"),
    },
    body: JSON.stringify({
      payment_page_uid: requiredEnv("PAYPLUS_PAYMENT_PAGE_UID"),
      charge_method: 1,
      create_token: true,
      amount: params.amount,
      currency_code: "ILS",
      sendEmailApproval: true,
      sendEmailFailure: false,
      customer: { customer_name: params.customerName, email: params.customerEmail },
      items: [{ name: `Saylo — מנוי ${params.planLabel}`, quantity: 1, price: params.amount }],
      // PayPlus silently truncates `more_info` at 100 characters — a
      // combined `{"profile_id":"...","plan_id":"..."}` JSON string (102+
      // chars) came back cut into invalid JSON on every real charge, so
      // every webhook call failed JSON.parse and PayPlus kept retrying the
      // same broken callback every 5 minutes forever. Each id alone (36
      // chars, a UUID) comfortably fits in its own more_info_N field instead.
      more_info_1: params.profileId,
      more_info_2: params.planId,
      // PayPlus issues the קבלה for this charge (Invoice+, terminal set up
      // to do so). Sent explicitly so a later change to the terminal's
      // default can't silently leave payments without receipts.
      initial_invoice: true,
      refURL_success: params.successUrl,
      refURL_failure: params.failureUrl,
      refURL_callback: params.callbackUrl,
      send_failure_callback: true,
    }),
  });

  const raw = await res.text();
  let body: GenerateLinkResponse & { results?: { status?: string } };
  try {
    body = JSON.parse(raw);
  } catch {
    // PayPlus returned something that isn't JSON at all (a gateway/WAF
    // rejection, most likely) — surface the exact text instead of losing it
    // to a JSON.parse "Unexpected token" message that only shows a few
    // characters.
    throw new Error(`PayPlus generateLink returned non-JSON (status ${res.status}): ${raw}`);
  }
  if (!res.ok || body?.results?.status !== "success") {
    throw new Error(`PayPlus generateLink failed (status ${res.status}): ${raw}`);
  }
  return body.data;
}

interface ChargeTokenParams {
  amount: number;
  token: string;
  customerUid: string;
  profileId: string;
}

// Charges a card token saved from an earlier generatePaymentPageLink call
// (create_token: true) — this is how api/cron/payplus-renewals bills each
// plan's renewal itself, since the account has no permission to let PayPlus
// run its own recurring schedule. Synchronous: the result is known from the
// response here, no separate IPN callback involved for this charge.
// See https://docs.payplus.co.il/reference/post_transactions-charge.
// Returns PayPlus's transaction uid, which is how the receipt PayPlus issues
// for this charge is found again (lib/billing/receipts.ts).
export async function chargeToken(params: ChargeTokenParams): Promise<{ transactionUid: string | null }> {
  const res = await fetch(`${BASE_URL}/Transactions/Charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": requiredEnv("PAYPLUS_API_KEY"),
      "secret-key": requiredEnv("PAYPLUS_SECRET_KEY"),
    },
    body: JSON.stringify({
      terminal_uid: requiredEnv("PAYPLUS_TERMINAL_UID"),
      cashier_uid: requiredEnv("PAYPLUS_CASHIER_UID"),
      amount: params.amount,
      currency_code: "ILS",
      credit_terms: 1,
      use_token: true,
      token: params.token,
      customer_uid: params.customerUid,
      more_info_1: params.profileId,
      // Same as checkout: PayPlus issues the renewal's קבלה itself.
      initial_invoice: true,
    }),
  });

  const raw = await res.text();
  let body: { results?: { status?: string }; data?: { transaction?: { status_code?: string; uid?: string } } };
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`PayPlus charge returned non-JSON (status ${res.status}): ${raw}`);
  }
  const succeeded = res.ok && body?.results?.status === "success" && body?.data?.transaction?.status_code === "000";
  if (!succeeded) {
    throw new Error(`PayPlus token charge failed (status ${res.status}): ${raw}`);
  }
  return { transactionUid: body.data?.transaction?.uid ?? null };
}

// Callback authenticity check — see
// https://docs.payplus.co.il/reference/validate-requests-received-from-payplus.
// Hashed over the exact raw bytes PayPlus sent, not a re-serialized copy —
// JSON.stringify(JSON.parse(raw)) can reorder keys or reformat numbers and
// silently break the signature.
export function isValidPayplusCallback(rawBody: string, hashHeader: string | null): boolean {
  if (!hashHeader) return false;
  const expected = createHmac("sha256", requiredEnv("PAYPLUS_SECRET_KEY")).update(rawBody).digest("base64");
  return expected === hashHeader;
}
