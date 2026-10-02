"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import { formatPhoneForDisplay, whatsappLink } from "@/lib/support/contact";
import { SUPPORT_CHANNEL_LABELS, SUPPORT_TOPIC_LABELS, type SupportChannel, type SupportTopic } from "@/lib/support/topics";

type RequestStatus = "new" | "in_progress" | "done";

interface SupportRequestRow {
  id: string;
  conversation_id: string | null;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  preferred_channel: SupportChannel;
  topic: SupportTopic;
  message: string;
  page_path: string | null;
  status: RequestStatus;
  admin_notes: string | null;
  created_at: string;
  handled_at: string | null;
}

interface TranscriptMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  rating: number | null;
  created_at: string;
}

interface Conversation {
  id: string;
  page_path: string | null;
  handoff_summary: string | null;
}

const STATUS_LABELS: Record<RequestStatus, string> = { new: "חדשה", in_progress: "בטיפול", done: "טופלה" };
const FILTERS: (RequestStatus | "all")[] = ["new", "in_progress", "done", "all"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminSupportPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<SupportRequestRow[] | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "all">("new");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, { conversation: Conversation | null; messages: TranscriptMessage[] }>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [unhelpful, setUnhelpful] = useState<{ question: string; answer: TranscriptMessage }[] | null>(null);
  const [weekStats, setWeekStats] = useState<{ conversations: number; up: number; down: number } | null>(null);

  useEffect(() => {
    void loadRequests();
    void loadQuality();
    // Loads once on mount; the loaders only read state through setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRequests() {
    const { data } = await supabase.from("support_requests").select("*").order("created_at", { ascending: false }).limit(200);
    const rows = (data ?? []) as SupportRequestRow[];
    setRequests(rows);
    setNotes(Object.fromEntries(rows.map((r) => [r.id, r.admin_notes ?? ""])));
    // Arriving from the notification email's link opens that request.
    const linked = new URLSearchParams(window.location.search).get("request");
    const target = linked ? rows.find((r) => r.id === linked) : null;
    if (target) {
      setFilter("all");
      void toggle(target);
    }
  }

  // Thumbs-down answers are where the knowledge base (src/lib/support/
  // knowledgeBase.ts) needs a fact added or corrected.
  async function loadQuality() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count }, { data: rated }, { data: down }] = await Promise.all([
      supabase.from("support_conversations").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("support_messages").select("rating").not("rating", "is", null).gte("created_at", since),
      supabase
        .from("support_messages")
        .select("id, conversation_id, role, content, rating, created_at")
        .eq("rating", -1)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setWeekStats({
      conversations: count ?? 0,
      up: (rated ?? []).filter((r) => r.rating === 1).length,
      down: (rated ?? []).filter((r) => r.rating === -1).length,
    });

    const answers = (down ?? []) as TranscriptMessage[];
    if (answers.length === 0) {
      setUnhelpful([]);
      return;
    }
    const { data: context } = await supabase
      .from("support_messages")
      .select("id, conversation_id, role, content, rating, created_at")
      .in("conversation_id", [...new Set(answers.map((a) => a.conversation_id))])
      .eq("role", "user")
      .order("created_at");
    setUnhelpful(
      answers.map((answer) => {
        const question = ((context ?? []) as TranscriptMessage[])
          .filter((m) => m.conversation_id === answer.conversation_id && m.created_at < answer.created_at)
          .at(-1);
        return { question: question?.content ?? "—", answer };
      })
    );
  }

  async function toggle(request: SupportRequestRow) {
    if (expanded === request.id) {
      setExpanded(null);
      return;
    }
    setExpanded(request.id);
    if (!request.conversation_id || transcripts[request.id]) return;
    const [{ data: conversation }, { data: messages }] = await Promise.all([
      supabase.from("support_conversations").select("id, page_path, handoff_summary").eq("id", request.conversation_id).maybeSingle(),
      supabase
        .from("support_messages")
        .select("id, conversation_id, role, content, rating, created_at")
        .eq("conversation_id", request.conversation_id)
        .order("created_at"),
    ]);
    setTranscripts((t) => ({ ...t, [request.id]: { conversation, messages: (messages ?? []) as TranscriptMessage[] } }));
  }

  async function setStatus(request: SupportRequestRow, status: RequestStatus) {
    if (!profile) return;
    const handled_at = status === "done" ? new Date().toISOString() : null;
    setRequests((rs) => rs?.map((r) => (r.id === request.id ? { ...r, status, handled_at } : r)) ?? null);
    await supabase.from("support_requests").update({ status, handled_at }).eq("id", request.id);
    await supabase.from("admin_audit_log").insert({
      admin_profile_id: profile.id,
      action: `support_request_${status}`,
      target_type: "support_request",
      target_id: request.id,
    });
  }

  async function saveNotes(request: SupportRequestRow) {
    const value = notes[request.id]?.trim() || null;
    if (value === (request.admin_notes ?? null)) return;
    setRequests((rs) => rs?.map((r) => (r.id === request.id ? { ...r, admin_notes: value } : r)) ?? null);
    await supabase.from("support_requests").update({ admin_notes: value }).eq("id", request.id);
  }

  const counts = Object.fromEntries(
    FILTERS.map((f) => [f, (requests ?? []).filter((r) => f === "all" || r.status === f).length])
  ) as Record<RequestStatus | "all", number>;
  const visible = (requests ?? []).filter((r) => filter === "all" || r.status === filter);
  const actionClass =
    "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-card-border text-xs hover:bg-background-2 transition-colors";

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-bold text-lg">פניות לחזרה</h2>
          {weekStats && (
            <p className="text-sm text-muted">
              בשבוע האחרון: {weekStats.conversations} שיחות עם העוזר · {weekStats.up} תשובות סומנו כמועילות ·{" "}
              {weekStats.down} כלא מועילות
            </p>
          )}
        </div>

        <div role="tablist" aria-label="סינון לפי סטטוס" className="mt-3 flex flex-wrap gap-1 bg-card/60 border border-card-border rounded-xl p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
              }`}
            >
              {f === "all" ? "הכול" : STATUS_LABELS[f]} {requests ? `(${counts[f]})` : ""}
            </button>
          ))}
        </div>

        {requests === null ? (
          <p className="mt-4 text-sm text-muted">טוען…</p>
        ) : visible.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {filter === "new" ? "אין פניות חדשות. כשמישהו ישאיר פרטים בצ׳אט, הפנייה תופיע כאן ותישלח גם למייל." : "אין פניות בסטטוס הזה."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visible.map((r) => {
              const transcript = transcripts[r.id];
              return (
                <li key={r.id} className="bg-card border border-card-border rounded-lg p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {r.name}
                        <span className="text-muted font-normal"> · {SUPPORT_TOPIC_LABELS[r.topic]}</span>
                        {!r.profile_id && <span className="text-muted font-normal"> · לא רשום/ה</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatTime(r.created_at)} · לחזור ב{SUPPORT_CHANNEL_LABELS[r.preferred_channel]}
                        {r.page_path ? ` · מתוך ${r.page_path}` : ""}
                        <span dir="ltr" className="font-mono ms-2 select-all">
                          {r.id.slice(0, 8).toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <label className="text-xs flex items-center gap-2">
                      <span className="text-muted">סטטוס</span>
                      <select
                        value={r.status}
                        onChange={(e) => setStatus(r, e.target.value as RequestStatus)}
                        className="px-2 py-1 rounded-lg border border-card-border bg-background text-sm"
                      >
                        {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <p className="mt-3 text-sm whitespace-pre-wrap">{r.message}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.email && (
                      <a href={`mailto:${r.email}?subject=${encodeURIComponent("הפנייה שלך ל-Saylo")}`} className={actionClass}>
                        <Mail size={13} aria-hidden="true" />
                        <span dir="ltr">{r.email}</span>
                      </a>
                    )}
                    {r.phone && (
                      <>
                        <a href={`tel:${r.phone}`} className={actionClass}>
                          <Phone size={13} aria-hidden="true" />
                          <span dir="ltr">{formatPhoneForDisplay(r.phone)}</span>
                        </a>
                        <a href={whatsappLink(r.phone)} target="_blank" rel="noopener noreferrer" className={actionClass}>
                          <MessageCircle size={13} aria-hidden="true" />
                          וואטסאפ
                        </a>
                      </>
                    )}
                    {r.conversation_id && (
                      <button type="button" onClick={() => toggle(r)} aria-expanded={expanded === r.id} className={actionClass}>
                        <ChevronDown size={13} aria-hidden="true" className={expanded === r.id ? "rotate-180" : ""} />
                        השיחה עם העוזר
                      </button>
                    )}
                  </div>

                  {expanded === r.id && r.conversation_id && (
                    <div className="mt-3 rounded-lg border border-card-border bg-background p-3 text-sm">
                      {!transcript ? (
                        <p className="text-muted">טוען…</p>
                      ) : (
                        <>
                          {transcript.conversation?.handoff_summary && (
                            <p className="mb-3">
                              <span className="font-medium">סיכום העוזר: </span>
                              {transcript.conversation.handoff_summary}
                            </p>
                          )}
                          <ol className="space-y-2">
                            {transcript.messages.map((m) => (
                              <li key={m.id} className={m.role === "user" ? "" : "text-muted"}>
                                <span className="font-medium text-foreground">{m.role === "user" ? "פונה" : "עוזר"}: </span>
                                <span className="whitespace-pre-wrap">{m.content}</span>
                                {m.rating === -1 && <span className="text-danger text-xs"> (סומן כלא מועיל)</span>}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                    </div>
                  )}

                  <label className="mt-3 block">
                    <span className="sr-only">הערות פנימיות</span>
                    <textarea
                      value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      onBlur={() => saveNotes(r)}
                      rows={1}
                      placeholder="הערות פנימיות (נשמר אוטומטית)"
                      className="w-full px-3 py-1.5 rounded-lg border border-card-border bg-background text-sm resize-y placeholder:text-muted"
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-bold text-lg">תשובות שסומנו כלא מועילות</h2>
        <p className="mt-1 text-sm text-muted">
          כאן רואים איפה לעוזר חסר מידע. מוסיפים או מתקנים את העובדה ב-<span dir="ltr" className="font-mono text-xs">src/lib/support/knowledgeBase.ts</span>.
        </p>
        {unhelpful === null ? (
          <p className="mt-3 text-sm text-muted">טוען…</p>
        ) : unhelpful.length === 0 ? (
          <p className="mt-3 text-sm text-muted">אין כרגע תשובות שסומנו כלא מועילות.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {unhelpful.map(({ question, answer }) => (
              <li key={answer.id} className="bg-card border border-card-border rounded-lg p-3 text-sm">
                <p>
                  <span className="font-medium">שאלה: </span>
                  {question}
                </p>
                <p className="mt-1 text-muted whitespace-pre-wrap">
                  <span className="font-medium text-foreground">תשובה: </span>
                  {answer.content}
                </p>
                <p className="mt-1 text-xs text-muted">{formatTime(answer.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
