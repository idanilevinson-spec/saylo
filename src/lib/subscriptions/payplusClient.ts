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
  months: number;
  customerName: string;
  customerEmail: string;
  moreInfo: string;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
}

interface GenerateLinkResponse {
  data: { payment_page_link: string; page_request_uid: string };
}

// A hosted checkout page that, once paid, PayPlus itself re-charges on the
// given schedule (charge_method 3) — no separate per-renewal API call is
// needed on our side, unlike PayPlus's lower-level RecurringPayments/Add.
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
      charge_method: 3,
      amount: params.amount,
      currency_code: "ILS",
      sendEmailApproval: true,
      sendEmailFailure: false,
      customer: { customer_name: params.customerName, email: params.customerEmail },
      items: [{ name: `Saylo — מנוי ${params.planLabel}`, quantity: 1, price: params.amount }],
      more_info: params.moreInfo,
      refURL_success: params.successUrl,
      refURL_failure: params.failureUrl,
      refURL_callback: params.callbackUrl,
      send_failure_callback: true,
      recurring_settings: {
        instant_first_payment: true,
        recurring_type: 2, // monthly
        recurring_range: params.months, // every `months` months
        number_of_charges: 0, // unlimited, until cancelled
        start_date_on_payment_date: true,
        successful_invoice: true,
        customer_failure_email: true,
        send_customer_success_email: true,
      },
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

// Turns future recurring charges on/off without touching what's already been
// paid — the same on/off toggle as Stripe's cancel_at_period_end, just an
// explicit boolean instead of a cancel/reactivate pair of calls. See
// https://docs.payplus.co.il/reference/post_recurringpayments-uid-valid.
export async function setRecurringValid(recurringUid: string, isValid: boolean): Promise<void> {
  const res = await fetch(`${BASE_URL}/RecurringPayments/${recurringUid}/Valid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": requiredEnv("PAYPLUS_API_KEY"),
      "secret-key": requiredEnv("PAYPLUS_SECRET_KEY"),
    },
    body: JSON.stringify({ is_valid: isValid }),
  });
  const body = await res.json();
  if (!res.ok || body?.results?.status !== "success") {
    throw new Error(`PayPlus set recurring validity failed: ${JSON.stringify(body)}`);
  }
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
