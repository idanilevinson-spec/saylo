"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import StatusBadge from "@/components/admin/StatusBadge";
import type { ContentReport } from "@/types/database";

interface ConversationRow {
  id: string;
  status: string;
  created_at: string;
  profile_display_name: string;
  profile_age_band: string;
  scenario_title: string | null;
  message_count: number;
  overall_score: number | null;
}

export default function AdminModerationPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationRow[] | null>(null);
  const [reports, setReports] = useState<ContentReport[] | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadConversations();
    loadReports();
  }, []);

  async function loadConversations() {
    const { data: convos } = await supabase
      .from("conversations")
      .select("id, status, created_at, profile_id, scenario_id")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!convos) {
      setConversations([]);
      return;
    }

    const profileIds = [...new Set(convos.map((c) => c.profile_id))];
    const scenarioIds = [...new Set(convos.map((c) => c.scenario_id).filter((id): id is string => !!id))];
    const conversationIds = convos.map((c) => c.id);

    const [{ data: profiles }, { data: scenarios }, { data: messages }, { data: scores }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, age_band").in("id", profileIds),
      scenarioIds.length
        ? supabase.from("conversation_scenarios").select("id, title_he").in("id", scenarioIds)
        : Promise.resolve({ data: [] as { id: string; title_he: string }[] }),
      supabase.from("conversation_messages").select("conversation_id").in("conversation_id", conversationIds),
      supabase.from("conversation_scores").select("conversation_id, overall_score").in("conversation_id", conversationIds),
    ]);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const scenarioById = new Map((scenarios ?? []).map((s) => [s.id, s.title_he]));
    const scoreByConversation = new Map((scores ?? []).map((s) => [s.conversation_id, s.overall_score]));
    const messageCountByConversation = new Map<string, number>();
    (messages ?? []).forEach((m) => {
      messageCountByConversation.set(m.conversation_id, (messageCountByConversation.get(m.conversation_id) ?? 0) + 1);
    });

    setConversations(
      convos.map((c) => ({
        id: c.id,
        status: c.status,
        created_at: c.created_at,
        profile_display_name: profileById.get(c.profile_id)?.display_name ?? "—",
        profile_age_band: profileById.get(c.profile_id)?.age_band ?? "adult",
        scenario_title: c.scenario_id ? scenarioById.get(c.scenario_id) ?? null : null,
        message_count: messageCountByConversation.get(c.id) ?? 0,
        overall_score: scoreByConversation.get(c.id) ?? null,
      }))
    );
  }

  async function loadReports() {
    const { data } = await supabase
      .from("content_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setReports(data ?? []);
  }

  async function flagConversation(conversationId: string) {
    if (!profile || !reason.trim()) return;
    await supabase.from("content_reports").insert({
      reporter_profile_id: profile.id,
      target_type: "conversation",
      target_id: conversationId,
      reason: reason.trim(),
    });
    await supabase.from("admin_audit_log").insert({
      admin_profile_id: profile.id,
      action: "flag_conversation",
      target_type: "conversation",
      target_id: conversationId,
    });
    setFlaggingId(null);
    setReason("");
    await loadReports();
  }

  async function resolveReport(report: ContentReport, status: "resolved" | "dismissed") {
    if (!profile) return;
    await supabase
      .from("content_reports")
      .update({ status, resolved_at: new Date().toISOString() })
      .eq("id", report.id);
    await supabase.from("admin_audit_log").insert({
      admin_profile_id: profile.id,
      action: status === "resolved" ? "resolve_report" : "dismiss_report",
      target_type: report.target_type,
      target_id: report.target_id,
    });
    await loadReports();
  }

  const openReports = (reports ?? []).filter((r) => r.status === "open");
  const closedReports = (reports ?? []).filter((r) => r.status !== "open");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-lg">דיווחים פתוחים {reports ? `(${openReports.length})` : ""}</h2>
        {openReports.length === 0 ? (
          <p className="mt-2 text-sm text-muted">אין דיווחים פתוחים כרגע.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {openReports.map((report) => (
              <li key={report.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {report.target_type} · {report.target_id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-muted">{report.reason}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(report.created_at).toLocaleString("he-IL")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => resolveReport(report, "resolved")}
                    className="px-3 py-1.5 rounded-lg bg-success-ink text-success text-xs font-medium"
                  >
                    טופל
                  </button>
                  <button
                    onClick={() => resolveReport(report, "dismissed")}
                    className="px-3 py-1.5 rounded-lg border border-card-border text-xs"
                  >
                    דחייה
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-bold text-lg">שיחות AI אחרונות</h2>
        <p className="mt-1 text-sm text-muted">
          במיוחד רלוונטי לשיחות של קטינים — ניתן לסמן שיחה לבדיקה, מה שיוצר דיווח ברשימה למעלה.
        </p>
        {!conversations ? (
          <p className="mt-3 text-muted">טוען...</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-right text-muted border-b border-card-border">
                  <th className="py-2 pe-4 font-medium">משתמש/ת</th>
                  <th className="py-2 pe-4 font-medium">תרחיש</th>
                  <th className="py-2 pe-4 font-medium">הודעות</th>
                  <th className="py-2 pe-4 font-medium">ציון</th>
                  <th className="py-2 pe-4 font-medium">תאריך</th>
                  <th className="py-2 pe-4 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} className="border-b border-card-border last:border-0">
                    <td className="py-2.5 pe-4">
                      {c.profile_display_name}
                      {c.profile_age_band !== "adult" && (
                        <span className="ms-1 text-xs text-accent-hover font-bold">קטין/ה</span>
                      )}
                    </td>
                    <td className="py-2.5 pe-4">{c.scenario_title ?? "שיחה חופשית"}</td>
                    <td className="py-2.5 pe-4">{c.message_count}</td>
                    <td className="py-2.5 pe-4">{c.overall_score ?? "—"}</td>
                    <td className="py-2.5 pe-4 text-muted">{new Date(c.created_at).toLocaleDateString("he-IL")}</td>
                    <td className="py-2.5 pe-4">
                      {flaggingId === c.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="סיבת הסימון"
                            className="px-2 py-1 rounded border border-card-border bg-card text-xs w-40"
                          />
                          <button onClick={() => flagConversation(c.id)} className="text-xs text-primary hover:underline">
                            שליחה
                          </button>
                          <button onClick={() => setFlaggingId(null)} className="text-xs text-muted hover:underline">
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setFlaggingId(c.id)} className="text-xs text-danger hover:underline">
                          סימון לבדיקה
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {closedReports.length > 0 && (
        <div>
          <h2 className="font-bold text-lg">דיווחים שטופלו</h2>
          <ul className="mt-3 space-y-2">
            {closedReports.map((report) => (
              <li key={report.id} className="p-3 rounded-lg border border-card-border flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">
                  {report.target_type} · {report.reason}
                </span>
                <StatusBadge status={report.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
