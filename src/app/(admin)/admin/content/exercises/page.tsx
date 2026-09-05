"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import { McqContentSchema } from "@/types/exercises";
import type { CefrLevel, ContentStatus, Exercise, SkillArea } from "@/types/database";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STATUSES: ContentStatus[] = ["draft", "ai_generated_pending_review", "published"];
const SKILL_AREAS: SkillArea[] = ["vocabulary", "grammar", "listening", "reading", "writing", "speaking"];

interface McqForm {
  skill_area: SkillArea;
  cefr_level: CefrLevel;
  prompt: string;
  optionsText: string;
  correctIndex: number;
}

const emptyMcqForm: McqForm = {
  skill_area: "vocabulary",
  cefr_level: "A1",
  prompt: "",
  optionsText: "",
  correctIndex: 0,
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<McqForm>(emptyMcqForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("exercises").select("*").order("created_at", { ascending: false }).limit(200);
    setExercises(data ?? []);
  }

  async function toggleStatus(exercise: Exercise) {
    const next: ContentStatus = exercise.status === "published" ? "draft" : "published";
    await supabase.from("exercises").update({ status: next }).eq("id", exercise.id);
    await load();
  }

  async function remove(exercise: Exercise) {
    if (!window.confirm("למחוק את התרגיל?")) return;
    await supabase.from("exercises").delete().eq("id", exercise.id);
    await load();
  }

  async function createMcq() {
    setFormError(null);
    const options = form.optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = McqContentSchema.safeParse({
      prompt: form.prompt,
      options,
      correctIndex: form.correctIndex,
    });
    if (!parsed.success) {
      setFormError("בדקו שהוזן שאלה, לפחות שתי תשובות, ושנבחרה תשובה נכונה תקינה.");
      return;
    }

    await supabase.from("exercises").insert({
      type: "mcq",
      skill_area: form.skill_area,
      cefr_level: form.cefr_level,
      content: parsed.data,
      status: "draft",
    });
    setCreating(false);
    setForm(emptyMcqForm);
    await load();
  }

  const optionsList = form.optionsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const filtered = (exercises ?? []).filter((e) => statusFilter === "all" || e.status === statusFilter);

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold">תרגילים {exercises ? `(${exercises.length})` : ""}</h2>
        <div className="flex items-center gap-3">
          <select
            aria-label="סינון לפי סטטוס"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "all")}
            className="px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          >
            <option value="all">כל הסטטוסים</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setForm(emptyMcqForm);
              setCreating(true);
            }}
            className="text-sm text-primary font-medium hover:underline"
          >
            + תרגיל MCQ חדש
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted">
        יצירה מודרכת זמינה כרגע רק לסוג MCQ. סוגי תרגילים אחרים (השלמת מילה, התאמה, סידור, הכתבה) נוצרים כרגע דרך
        סקריפטים/AI ומנוהלים כאן רק לפרסום/מחיקה.
      </p>

      {creating && (
        <div className="mt-3 p-3 rounded-lg bg-background-2 space-y-2">
          <div className="flex gap-2">
            <select
              aria-label="תחום מיומנות"
              value={form.skill_area}
              onChange={(e) => setForm({ ...form, skill_area: e.target.value as SkillArea })}
              className="flex-1 px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            >
              {SKILL_AREAS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
          </div>
          <input
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            placeholder="שאלה (prompt)"
            dir="ltr"
            className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          />
          <textarea
            value={form.optionsText}
            onChange={(e) => setForm({ ...form, optionsText: e.target.value })}
            placeholder={"אפשרויות תשובה — כל שורה אפשרות אחת"}
            dir="ltr"
            rows={4}
            className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
          />
          {optionsList.length > 0 && (
            <select
              aria-label="תשובה נכונה"
              value={form.correctIndex}
              onChange={(e) => setForm({ ...form, correctIndex: Number(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-card-border bg-card text-sm"
            >
              {optionsList.map((opt, i) => (
                <option key={i} value={i}>
                  תשובה נכונה: {opt}
                </option>
              ))}
            </select>
          )}
          {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={createMcq} className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm font-medium">
              שמירה כטיוטה
            </button>
            <button onClick={() => setCreating(false)} className="px-3 py-1.5 rounded-lg border border-card-border text-sm">
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-right text-muted border-b border-card-border">
              <th className="py-2 pe-4 font-medium">סוג</th>
              <th className="py-2 pe-4 font-medium">תחום</th>
              <th className="py-2 pe-4 font-medium">רמה</th>
              <th className="py-2 pe-4 font-medium">סטטוס</th>
              <th className="py-2 pe-4 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exercise) => (
              <tr key={exercise.id} className="border-b border-card-border last:border-0">
                <td className="py-2.5 pe-4">{exercise.type}</td>
                <td className="py-2.5 pe-4">{exercise.skill_area}</td>
                <td className="py-2.5 pe-4">{exercise.cefr_level}</td>
                <td className="py-2.5 pe-4">
                  <StatusBadge status={exercise.status} />
                </td>
                <td className="py-2.5 pe-4">
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => toggleStatus(exercise)} className="text-primary hover:underline">
                      {exercise.status === "published" ? "החזרה לטיוטה" : "פרסום"}
                    </button>
                    <button onClick={() => remove(exercise)} className="text-danger hover:underline">
                      מחיקה
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {exercises && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted">
                  אין תרגילים בסינון הנוכחי.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
