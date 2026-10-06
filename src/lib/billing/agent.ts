import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropic } from "@/lib/ai/claudeClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import type { BillingDocument } from "@/types/database";
import { invoicesEnabled } from "./invoicePlusClient";
import { buildBillingSystemPrompt } from "./systemPrompt";

// The back-office billing agent: the owner asks in plain Hebrew ("which
// payments have no receipt?", "issue a receipt for the school that paid
// 1,200 by transfer") and it looks things up and prepares receipts.
//
// It can READ freely but it can't ISSUE anything itself. Issuing a receipt
// is a bookkeeping act that can't be undone (a wrong receipt can only be
// cancelled with another document), so the agent's write tools only produce
// a proposal; the admin screen shows it as a card and the receipt is issued
// when a person presses confirm (api/admin/billing/execute). Same principle
// as the public support agent: an agent that can act can be talked into acting.

export const BILLING_MODEL = "claude-opus-5-5";
const MAX_ROUNDS = 6;

export const ManualReceiptProposal = z.object({
  kind: z.literal("manual_receipt"),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(254).nullable(),
  profile_id: z.string().uuid().nullable(),
  amount_ils: z.number().positive().max(100000),
  payment_method: z.enum(["credit-card", "bank-transfer", "cash", "payment-app", "other"]),
  paid_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().trim().min(2).max(200),
});

export const RetryReceiptProposal = z.object({
  kind: z.literal("retry_receipt"),
  document_id: z.string().uuid(),
  summary: z.string().max(300),
});

export const BillingProposal = z.discriminatedUnion("kind", [ManualReceiptProposal, RetryReceiptProposal]);
export type BillingProposal = z.infer<typeof BillingProposal>;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "list_open_receipts",
    description:
      "List payments that still have no issued receipt (status pending = not attempted yet, failed = Invoice+ returned an error; last_error says why). Takes no input.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "search_receipts",
    description:
      "Search the receipts ledger by customer email or name (partial match), receipt number, or a date range. Returns up to 30 rows, newest first. Any field may be omitted.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Part of a customer email, customer name, or a receipt number." },
        from_date: { type: "string", description: "YYYY-MM-DD, inclusive." },
        to_date: { type: "string", description: "YYYY-MM-DD, inclusive." },
        status: { type: "string", enum: ["pending", "issued", "failed"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "totals",
    description:
      "Sum of issued receipts (count and ₪ amount) between two dates, broken down by source (checkout / renewal / manual). Useful for an exempt dealer keeping an eye on the yearly turnover ceiling.",
    input_schema: {
      type: "object",
      properties: {
        from_date: { type: "string", description: "YYYY-MM-DD, inclusive." },
        to_date: { type: "string", description: "YYYY-MM-DD, inclusive." },
      },
      required: ["from_date", "to_date"],
      additionalProperties: false,
    },
  },
  {
    name: "find_customer",
    description:
      "Look up a Saylo account by its sign-in email: profile id, nickname, subscription status, plan and billing provider. Use before proposing a receipt for an existing user so it is linked to their account.",
    input_schema: {
      type: "object",
      properties: { email: { type: "string" } },
      required: ["email"],
      additionalProperties: false,
    },
  },
  {
    name: "propose_manual_receipt",
    description:
      "Prepare a receipt for a payment received outside the website checkout (bank transfer, Bit, cash, a school paying for students). This does NOT issue it: the admin sees a confirmation card and issues it with a button. Only call it once every field is known from the conversation or a lookup — never guess an amount, a date or a name.",
    input_schema: {
      type: "object",
      properties: {
        customer_name: { type: "string", description: "Name to print on the receipt (person or organisation)." },
        customer_email: { type: ["string", "null"], description: "Where Invoice+ emails the receipt. null if none was given." },
        profile_id: { type: ["string", "null"], description: "From find_customer, if the payer has a Saylo account; otherwise null." },
        amount_ils: { type: "number", description: "Amount paid, in shekels." },
        payment_method: { type: "string", enum: ["credit-card", "bank-transfer", "cash", "payment-app", "other"] },
        paid_at: { type: "string", description: "Date the money was received, YYYY-MM-DD." },
        description: { type: "string", description: "Line item in Hebrew, e.g. 'מנוי Saylo — שנתי'." },
      },
      required: ["customer_name", "customer_email", "profile_id", "amount_ils", "payment_method", "paid_at", "description"],
      additionalProperties: false,
    },
  },
  {
    name: "propose_retry",
    description:
      "Prepare another attempt at issuing the receipt for an existing ledger row that is pending or failed. The admin confirms it with a button.",
    input_schema: {
      type: "object",
      properties: {
        document_id: { type: "string" },
        summary: { type: "string", description: "One Hebrew line describing the payment, shown on the confirmation card." },
      },
      required: ["document_id", "summary"],
      additionalProperties: false,
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<{ result: unknown; proposal?: BillingProposal }> {
  if (name === "list_open_receipts") {
    const { data } = await supabaseAdmin
      .from("billing_documents")
      .select("id, payment_ref, source, status, amount_ils, customer_name, customer_email, paid_at, attempts, last_error")
      .neq("status", "issued")
      .order("created_at", { ascending: true })
      .limit(50);
    return { result: data ?? [] };
  }

  if (name === "search_receipts") {
    let query = supabaseAdmin
      .from("billing_documents")
      .select("id, source, status, doc_number, amount_ils, payment_method, description, customer_name, customer_email, paid_at, issued_at")
      .order("paid_at", { ascending: false })
      .limit(30);
    const text = typeof input.text === "string" ? input.text.replace(/[%,()]/g, "").trim() : "";
    if (text) query = query.or(`customer_email.ilike.%${text}%,customer_name.ilike.%${text}%,doc_number.eq.${text}`);
    if (typeof input.from_date === "string") query = query.gte("paid_at", `${input.from_date}T00:00:00+02:00`);
    if (typeof input.to_date === "string") query = query.lte("paid_at", `${input.to_date}T23:59:59+03:00`);
    if (typeof input.status === "string") query = query.eq("status", input.status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { result: data ?? [] };
  }

  if (name === "totals") {
    const { data, error } = await supabaseAdmin
      .from("billing_documents")
      .select("source, amount_ils")
      .eq("status", "issued")
      .gte("paid_at", `${input.from_date}T00:00:00+02:00`)
      .lte("paid_at", `${input.to_date}T23:59:59+03:00`);
    if (error) throw new Error(error.message);
    const bySource: Record<string, { count: number; amount_ils: number }> = {};
    let total = 0;
    for (const row of (data ?? []) as Pick<BillingDocument, "source" | "amount_ils">[]) {
      const bucket = (bySource[row.source] ??= { count: 0, amount_ils: 0 });
      bucket.count++;
      bucket.amount_ils += Number(row.amount_ils);
      total += Number(row.amount_ils);
    }
    return { result: { count: data?.length ?? 0, total_ils: total, by_source: bySource } };
  }

  if (name === "find_customer") {
    const email = String(input.email ?? "").trim().toLowerCase();
    // auth.admin has no lookup-by-email; scan pages (fine at this scale).
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      const user = data.users.find((u) => u.email?.toLowerCase() === email);
      if (user) {
        const [{ data: profile }, { data: sub }] = await Promise.all([
          supabaseAdmin.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
          supabaseAdmin
            .from("subscriptions")
            .select("status, billing_provider, current_period_end, subscription_plans(code)")
            .eq("profile_id", user.id)
            .maybeSingle(),
        ]);
        return { result: { profile_id: user.id, email: user.email, nickname: profile?.display_name ?? null, subscription: sub ?? null } };
      }
      if (data.users.length < 1000) break;
    }
    return { result: { found: false } };
  }

  if (name === "propose_manual_receipt") {
    const parsed = ManualReceiptProposal.safeParse({ kind: "manual_receipt", ...input });
    if (!parsed.success) throw new Error(`Invalid proposal: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    return { result: "The confirmation card is now shown to the admin. It is NOT issued until they press the button.", proposal: parsed.data };
  }

  if (name === "propose_retry") {
    const parsed = RetryReceiptProposal.safeParse({ kind: "retry_receipt", ...input });
    if (!parsed.success) throw new Error("Invalid proposal: document_id must be a ledger row id.");
    const { data } = await supabaseAdmin.from("billing_documents").select("status").eq("id", parsed.data.document_id).maybeSingle();
    if (!data) throw new Error("No ledger row with that id.");
    if (data.status === "issued") throw new Error("That receipt is already issued.");
    return { result: "The confirmation card is now shown to the admin.", proposal: parsed.data };
  }

  throw new Error(`Unknown tool ${name}`);
}

export interface BillingAgentReply {
  text: string;
  proposals: BillingProposal[];
}

export async function runBillingAgent(history: Anthropic.MessageParam[]): Promise<BillingAgentReply> {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const messages = [...history];
  const proposals: BillingProposal[] = [];
  const texts: string[] = [];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const message = await anthropic.messages.create({
      model: BILLING_MODEL,
      max_tokens: 2048,
      system: buildBillingSystemPrompt(today, invoicesEnabled()),
      tools: TOOLS,
      messages,
    });

    for (const block of message.content) if (block.type === "text" && block.text.trim()) texts.push(block.text.trim());

    const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0 || message.stop_reason !== "tool_use") break;

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const call of toolUses) {
      try {
        const { result, proposal } = await runTool(call.name, (call.input ?? {}) as Record<string, unknown>);
        if (proposal) proposals.push(proposal);
        results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(result) });
      } catch (err) {
        results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: err instanceof Error ? err.message : String(err) });
      }
    }
    messages.push({ role: "user", content: results });
  }

  return { text: texts.join("\n\n"), proposals };
}
