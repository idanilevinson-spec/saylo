"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";

// Shown when a page throws while rendering. Most of these are a dropped
// connection or a deploy landing mid-session, so the first move is a retry.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight">הדף לא נטען כמו שצריך</h1>
      <p className="mt-3 text-lg text-muted leading-relaxed">
        לפעמים זה רק חיבור שנקטע לרגע. אפשר לנסות שוב.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="game-press inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
        >
          <RotateCcw size={17} aria-hidden="true" />
          לנסות שוב
        </button>
        <Link
          href="/"
          className="game-press inline-flex items-center justify-center min-h-12 px-6 rounded-lg border border-card-border bg-card font-bold hover:border-primary/50 transition-[border-color,transform] duration-150"
        >
          לדף הבית
        </Link>
      </div>
      <p className="mt-10 text-sm text-muted">
        אם זה חוזר, כתבו לנו ל-
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2" dir="ltr">
          {CONTACT_EMAIL}
        </a>
        {error.digest ? (
          <>
            {" "}
            וצרפו את הקוד <span dir="ltr" className="font-mono">{error.digest}</span>
          </>
        ) : null}
        .
      </p>
    </div>
  );
}
