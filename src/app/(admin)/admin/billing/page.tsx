"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Send, RotateCw, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import type { BillingDocument } from "@/types/database";

type Proposal =
  | {
      kind: "manual_receipt";
      customer_name: string;
      customer_email: string | null;
      profile_id: string | null;
      amount_ils: number;
      payment_method: BillingDocument["payment_method"];
      paid_at: string;
      description: string;
    }
  | { kind: "retry_receipt"; document_id: string; summary: string };

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  proposals?: { proposal: Proposal; state: "open" | "working" | "done" | "dismissed"; result?: string }[];
}

const SOURCE_LABELS: Record<BillingDocument["source"], string> = { checkout: "רכישה באתר", renewal: "חידוש", manual: "ידנית" };
const METHOD_LABELS: Record<BillingDocument["payment_method"], string> = {
  "credit-card": "כרטיס אשראי",
  "bank-transfer": "העברה בנקאית",
  cash: "מזומן",
  "payment-app": "אפליקציית תשלום",
  other: "אחר",
};

const STARTERS = ["אילו תשלומים עדיין בלי קבלה?", "כמה הכנסות היו החודש?", "לרשום תשלום שהתקבל בהעברה בנקאית"];

const ils = (n: number) => `₪${Number(n).toLocaleString("he-IL", { maximumFractionDigits: 2 })}`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("he-IL", { dateStyle: "short" });

export default function AdminBillingPage() {
  const [docs, setDocs] = useState<BillingDocument[] | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadDocs();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [chat, thinking]);

  async function loadDocs() {
    const { data } = await supabase.from("billing_documents").select("*").order("paid_at", { ascending: false }).limit(100);
    setDocs((data ?? []) as BillingDocument[]);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || thinking) return;
    const next: ChatTurn[] = [...chat, { role: "user", content }];
    setChat(next);
    setDraft("");
    setThinking(true);
    setChatError(null);
    try {
      const res = await fetch("/api/admin/billing/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok) throw new Error();
      const reply = (await res.json()) as { text: string; proposals: Proposal[] };
      setChat([
        ...next,
        {
          role: "assistant",
          content: reply.text || "הכנתי את הפרטים למטה.",
          proposals: reply.proposals.map((proposal) => ({ proposal, state: "open" as const })),
        },
      ]);
    } catch {
      setChat(chat);
      setDraft(content);
      setChatError("העוזר לא הגיב. אפשר לנסות שוב.");
    } finally {
      setThinking(false);
    }
  }

  function updateProposal(turn: number, index: number, patch: Partial<NonNullable<ChatTurn["proposals"]>[number]>) {
    setChat((c) =>
      c.map((t, i) => (i === turn ? { ...t, proposals: t.proposals?.map((p, j) => (j === index ? { ...p, ...patch } : p)) } : t))
    );
  }

  async function confirm(turn: number, index: number, proposal: Proposal) {
    updateProposal(turn, index, { state: "working" });
    const res = await fetch("/api/admin/billing/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });
    const body = (await res.json().catch(() => ({}))) as { document?: BillingDocument; error?: string; recordedOnly?: boolean };
    if (res.ok && body.recordedOnly) {
      updateProposal(turn, index, {
        state: "done",
        result: "התשלום נרשם בטבלה. מוציאים עליו קבלה בחשבון מהיר ומסמנים אותה כהופקה.",
      });
    } else if (res.ok && body.document) {
      updateProposal(turn, index, { state: "done", result: `קבלה מס׳ ${body.document.doc_number} הופקה ונשלחה.` });
    } else {
      updateProposal(turn, index, { state: "open", result: `לא הופקה: ${body.error ?? "שגיאה"}` });
    }
    void loadDocs();
  }

  const open = (docs ?? []).filter((d) => d.status !== "issued");
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = (docs ?? []).filter((d) => d.status === "issued" && new Date(d.paid_at) >= monthStart);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0">
        <h2 className="font-bold text-lg">קבלות</h2>
        <p className="mt-1 text-sm text-muted">
          כל תשלום באתר ובחידוש נרשם כאן, ונשלח מייל שצריך להוציא עליו קבלה. מוציאים את הקבלה בחשבון מהיר, שולחים
          אותה ללקוח, ומסמנים כאן שהיא הופקה עם מספר הקבלה. רכישות דרך ה-App Store מקבלות קבלה מאפל ולא מופיעות
          כאן.
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="bg-card border border-card-border rounded-lg p-3">
            <dt className="text-muted">הופקו החודש</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{docs ? thisMonth.length : "—"}</dd>
          </div>
          <div className="bg-card border border-card-border rounded-lg p-3">
            <dt className="text-muted">סכום החודש</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{docs ? ils(thisMonth.reduce((s, d) => s + Number(d.amount_ils), 0)) : "—"}</dd>
          </div>
          <div className={`bg-card border rounded-lg p-3 ${open.length ? "border-danger/50" : "border-card-border"}`}>
            <dt className="text-muted">בלי קבלה</dt>
            <dd className={`mt-1 text-xl font-bold tabular-nums ${open.length ? "text-danger" : ""}`}>{docs ? open.length : "—"}</dd>
          </div>
        </dl>

        {docs === null ? (
          <p className="mt-4 text-sm text-muted">טוען…</p>
        ) : docs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">עוד אין תשלומים. התשלום הראשון באתר יופיע כאן עם הקבלה שלו.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-card-border">
            <table className="w-full text-sm">
              <thead className="bg-background-2 text-muted text-start">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">תאריך</th>
                  <th className="px-3 py-2 text-start font-medium">לקוח</th>
                  <th className="px-3 py-2 text-start font-medium">סכום</th>
                  <th className="px-3 py-2 text-start font-medium">מקור</th>
                  <th className="px-3 py-2 text-start font-medium">קבלה</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-card-border align-top">
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">{formatDate(d.paid_at)}</td>
                    <td className="px-3 py-2 min-w-0">
                      <div>{d.customer_name}</div>
                      {d.customer_email && (
                        <div dir="ltr" className="text-xs text-muted text-end truncate">
                          {d.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">{ils(d.amount_ils)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">{SOURCE_LABELS[d.source]}</td>
                    <td className="px-3 py-2">
                      {d.status === "issued" ? (
                        d.pdf_url ? (
                          <a href={d.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <FileText size={13} aria-hidden="true" />
                            <span className="tabular-nums">{d.doc_number}</span>
                          </a>
                        ) : (
                          <span className="tabular-nums">{d.doc_number}</span>
                        )
                      ) : (
                        <MarkIssued doc={d} onDone={loadDocs} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="billing-agent-title" className="lg:sticky lg:top-6 self-start bg-card border border-card-border rounded-lg flex flex-col max-h-[80vh]">
        <header className="px-4 py-3 border-b border-card-border">
          <h2 id="billing-agent-title" className="font-bold">עוזר הנהלת חשבונות</h2>
          <p className="text-xs text-muted mt-0.5">מחפש, מסכם, ומרכז את הפרטים לכל קבלה שצריך להוציא.</p>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm" aria-live="polite">
          {chat.length === 0 && (
            <div className="space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="block w-full text-start px-3 py-2 rounded-lg border border-card-border hover:bg-background-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {chat.map((turn, ti) => (
            <div key={ti} className={turn.role === "user" ? "flex justify-start" : ""}>
              <p
                className={`whitespace-pre-wrap ${
                  turn.role === "user" ? "bg-primary/10 rounded-lg px-3 py-2 max-w-[85%]" : ""
                }`}
              >
                {turn.content}
              </p>
              {turn.proposals?.map(({ proposal, state, result }, pi) =>
                state === "dismissed" ? null : (
                  <div key={pi} className="mt-2 rounded-lg border border-primary/40 bg-background p-3">
                    {proposal.kind === "manual_receipt" ? (
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        <dt className="text-muted">לקוח</dt>
                        <dd>{proposal.customer_name}</dd>
                        {proposal.customer_email && (
                          <>
                            <dt className="text-muted">מייל</dt>
                            <dd dir="ltr" className="text-end">
                              {proposal.customer_email}
                            </dd>
                          </>
                        )}
                        <dt className="text-muted">סכום</dt>
                        <dd className="font-bold tabular-nums">{ils(proposal.amount_ils)}</dd>
                        <dt className="text-muted">אמצעי</dt>
                        <dd>{METHOD_LABELS[proposal.payment_method]}</dd>
                        <dt className="text-muted">תאריך</dt>
                        <dd className="tabular-nums">{proposal.paid_at.split("-").reverse().join(".")}</dd>
                        <dt className="text-muted">פירוט</dt>
                        <dd>{proposal.description}</dd>
                      </dl>
                    ) : (
                      <p>ניסיון חוזר להפקת קבלה: {proposal.summary}</p>
                    )}
                    {result && <p className={`mt-2 ${state === "done" ? "text-success" : "text-danger"}`}>{result}</p>}
                    {state !== "done" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={state === "working"}
                          onClick={() => confirm(ti, pi, proposal)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-60"
                        >
                          {proposal.kind === "manual_receipt" ? <Check size={14} aria-hidden="true" /> : <RotateCw size={14} aria-hidden="true" />}
                          {state === "working" ? "מפיק…" : "הפקת הקבלה"}
                        </button>
                        <button
                          type="button"
                          disabled={state === "working"}
                          onClick={() => updateProposal(ti, pi, { state: "dismissed" })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-card-border hover:bg-background-2"
                        >
                          <X size={14} aria-hidden="true" />
                          ביטול
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
          {thinking && <p className="text-muted">בודק…</p>}
          {chatError && <p className="text-danger">{chatError}</p>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="border-t border-card-border p-2 flex gap-2"
        >
          <label className="sr-only" htmlFor="billing-agent-input">
            הודעה לעוזר
          </label>
          <input
            id="billing-agent-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="למשל: בית ספר העביר 1,200 ₪ בהעברה ב-1.10"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-card-border bg-background placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={thinking || !draft.trim()}
            aria-label="שליחה"
            className="px-3 rounded-lg bg-primary text-primary-ink disabled:opacity-50"
          >
            <Send size={16} aria-hidden="true" className="-scale-x-100" />
          </button>
        </form>
      </section>
    </div>
  );
}

// An open row's receipt cell: issue the receipt in חשבון מהיר, then record
// its number here (and the PDF link, if there is one, so the learner can
// open it from their profile).
function MarkIssued({ doc, onDone }: { doc: BillingDocument; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-danger">ממתינה לקבלה</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-2 py-1 rounded-lg border border-card-border text-xs font-medium hover:border-primary/40 transition-colors"
        >
          סימון שהופקה
        </button>
      </span>
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/billing/mark-issued", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: doc.id, doc_number: number.trim(), pdf_url: link.trim() || null }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(body.error ?? "השמירה נכשלה.");
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (number.trim()) void save();
      }}
      className="flex flex-col gap-1.5 min-w-44"
    >
      <label className="sr-only" htmlFor={`num-${doc.id}`}>
        מספר הקבלה
      </label>
      <input
        id={`num-${doc.id}`}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        inputMode="numeric"
        placeholder="מספר קבלה"
        autoFocus
        className="px-2 py-1 rounded-lg border border-card-border bg-background text-sm placeholder:text-muted"
      />
      <label className="sr-only" htmlFor={`link-${doc.id}`}>
        קישור לקבלה (רשות)
      </label>
      <input
        id={`link-${doc.id}`}
        value={link}
        onChange={(e) => setLink(e.target.value)}
        dir="ltr"
        type="url"
        placeholder="קישור ל-PDF (רשות)"
        className="px-2 py-1 rounded-lg border border-card-border bg-background text-sm placeholder:text-muted"
      />
      {error && <span className="text-xs text-danger">{error}</span>}
      <span className="flex gap-1.5">
        <button
          type="submit"
          disabled={saving || !number.trim()}
          className="px-2 py-1 rounded-lg bg-primary text-primary-ink text-xs font-medium disabled:opacity-50"
        >
          {saving ? "שומר…" : "שמירה"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 rounded-lg text-xs text-muted hover:text-foreground">
          ביטול
        </button>
      </span>
    </form>
  );
}
