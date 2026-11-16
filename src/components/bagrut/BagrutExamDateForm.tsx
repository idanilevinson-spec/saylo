"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { BagrutExamKind } from "@/types/database";
import { MAX_DAYS_AHEAD, checkExamDate, examKindLabel } from "@/lib/bagrut/examPlan";

const DATE_ERROR: Record<"invalid" | "past" | "too-far", string> = {
  invalid: "צריך לבחור תאריך.",
  past: "התאריך הזה כבר עבר.",
  "too-far": "אפשר לבחור תאריך עד שנה קדימה בערך.",
};

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Saves the learner's next exam (profiles.bagrut_exam_date / _kind, the
// learner's own row, like the track choice), or clears it.
export default function BagrutExamDateForm({
  kinds,
  todayIso,
  initialDate,
  initialKind,
}: {
  kinds: BagrutExamKind[];
  todayIso: string;
  initialDate: string | null;
  initialKind: BagrutExamKind | null;
}) {
  const { profile } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(initialDate && initialDate >= todayIso ? initialDate : "");
  const [kind, setKind] = useState<BagrutExamKind>(initialKind && kinds.includes(initialKind) ? initialKind : kinds[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(values: { bagrut_exam_date: string | null; bagrut_exam_kind: BagrutExamKind | null }) {
    if (!profile || saving) return;
    setSaving(true);
    setError(null);
    const { error: dbError } = await supabase.from("profiles").update(values).eq("id", profile.id);
    setSaving(false);
    if (dbError) {
      setError("לא הצלחנו לשמור. אפשר לנסות שוב.");
      return;
    }
    router.refresh();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const check = checkExamDate(date, todayIso);
    if (check !== "ok") {
      setError(DATE_ERROR[check]);
      return;
    }
    void save({ bagrut_exam_date: date, bagrut_exam_kind: kind });
  }

  const field =
    "min-h-12 w-full rounded-lg border border-card-border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  return (
    <form onSubmit={submit} noValidate className="mt-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">איזו בחינה</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as BagrutExamKind)} className={field}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {examKindLabel(k)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">תאריך</span>
          <input
            type="date"
            value={date}
            min={todayIso}
            max={addDays(todayIso, MAX_DAYS_AHEAD)}
            onChange={(e) => setDate(e.target.value)}
            className={field}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "exam-date-error" : undefined}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="game-press inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 font-bold text-primary-ink hover:bg-primary-hover transition-[background-color,transform] duration-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {saving ? "שומר…" : "לשמור"}
        </button>
      </div>
      {error && (
        <p id="exam-date-error" role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {initialDate && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void save({ bagrut_exam_date: null, bagrut_exam_kind: null })}
          className="mt-3 text-sm text-muted underline underline-offset-4 hover:text-foreground disabled:opacity-60"
        >
          להסיר את התאריך
        </button>
      )}
    </form>
  );
}
