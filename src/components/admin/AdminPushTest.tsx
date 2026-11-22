"use client";

import { useState } from "react";

// "Send me a test notification" for the admin overview. Inside the iOS app the
// admin is already signed in, so this works where a pasted link in Safari
// (a different, signed-out browser) would not. Shows the server's plain
// Hebrew explanation of what happened per device.
export default function AdminPushTest() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [result, setResult] = useState<{ message: string; lines: string[] } | null>(null);

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/admin/test-push", { method: "POST" });
      const data = (await res.json()) as { message?: string; lines?: string[] };
      setResult({ message: data.message ?? "הבדיקה נכשלה.", lines: data.lines ?? [] });
    } catch {
      setResult({ message: "אין חיבור לשרת. כדאי לבדוק את האינטרנט ולנסות שוב.", lines: [] });
    }
    setState("done");
  }

  return (
    <section className="mt-6 bg-card border border-card-border rounded-lg p-5">
      <h2 className="font-bold">התראות לטלפון</h2>
      <p className="mt-1 text-sm text-muted">
        על כל נרשם חדש, בקשה לחזור אליו ושיחה חדשה בצ&apos;אט העזרה נשלחת התראה למכשירים של המנהלים.
      </p>
      <button
        type="button"
        onClick={send}
        disabled={state === "sending"}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "sending" ? "שולח..." : "שליחת התראת בדיקה"}
      </button>
      {result && (
        <div className="mt-3 text-sm" role="status">
          <p className="font-semibold">{result.message}</p>
          {result.lines.length > 0 && (
            <ul className="mt-1 list-disc ps-5 text-muted">
              {result.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
