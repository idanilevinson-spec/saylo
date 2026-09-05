"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import type { CefrLevel, ContentStatus, ListeningClip } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STATUSES: ContentStatus[] = ["draft", "ai_generated_pending_review", "published"];

type Form = Pick<ListeningClip, "title_he" | "title_en" | "transcript_en" | "cefr_level" | "status">;
const emptyForm: Form = { title_he: "", title_en: "", transcript_en: "", cefr_level: "A1", status: "draft" };

export default function AdminListeningPage() {
  const [clips, setClips] = useState<ListeningClip[] | null>(null);
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const [form, setForm] = useState<Form>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("listening_clips").select("*").order("sort_order");
    setClips(data ?? []);
  }

  function startEdit(clip: ListeningClip) {
    setForm({
      title_he: clip.title_he,
      title_en: clip.title_en,
      transcript_en: clip.transcript_en,
      cefr_level: clip.cefr_level,
      status: clip.status,
    });
    setEditingId(clip.id);
  }

  async function save() {
    if (editingId === "new") {
      await supabase.from("listening_clips").insert(form);
    } else if (editingId) {
      await supabase.from("listening_clips").update(form).eq("id", editingId);
    }
    setEditingId(null);
    await load();
  }

  async function remove(clip: ListeningClip) {
    if (!window.confirm(`למחוק את הקטע "${clip.title_he}"?`)) return;
    await supabase.from("listening_clips").delete().eq("id", clip.id);
    await load();
  }

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">קטעי האזנה</h2>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId("new");
          }}
          className="text-sm text-primary font-medium hover:underline"
        >
          + קטע חדש
        </button>
      </div>

      {editingId && (
        <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
          <input
            value={form.title_he}
            onChange={(e) => setForm({ ...form, title_he: e.target.value })}
            placeholder="כותרת בעברית"
            className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          />
          <input
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            placeholder="Title in English"
            dir="ltr"
            className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          />
          <textarea
            value={form.transcript_en}
            onChange={(e) => setForm({ ...form, transcript_en: e.target.value })}
            placeholder="Transcript (English) — synthesized via the browser's TTS"
            dir="ltr"
            rows={8}
            className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          />
          <div className="flex gap-2">
            <select
              aria-label="רמת CEFR"
              value={form.cefr_level}
              onChange={(e) => setForm({ ...form, cefr_level: e.target.value as CefrLevel })}
              className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              aria-label="סטטוס"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
              className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
              שמירה
            </button>
            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
              ביטול
            </button>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {(clips ?? []).map((clip) => (
          <li key={clip.id} className="p-3 rounded-lg border border-card-border flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{clip.title_he}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted">{clip.cefr_level}</span>
                <StatusBadge status={clip.status} />
              </div>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <button onClick={() => startEdit(clip)} className="text-primary hover:underline">
                עריכה
              </button>
              <button onClick={() => remove(clip)} className="text-danger hover:underline">
                מחיקה
              </button>
            </div>
          </li>
        ))}
        {clips && clips.length === 0 && <p className="text-muted text-sm">אין עדיין קטעי האזנה.</p>}
      </ul>
    </div>
  );
}
