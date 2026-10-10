import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "הדף לא נמצא — Saylo",
  robots: { index: false },
};

// Where people who followed an old or mistyped link usually meant to go.
const PLACES: { href: string; label: string }[] = [
  { href: "/english-level-test", label: "מבחן רמה באנגלית" },
  { href: "/english-bagrut", label: "הכנה לבגרות" },
  { href: "/pricing", label: "מסלולים ומחירים" },
  { href: "/support", label: "תמיכה" },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <p className="chyron text-7xl sm:text-8xl leading-none text-primary">
        404
      </p>
      <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight">הדף הזה לא קיים</h1>
      <p className="mt-3 text-lg text-muted leading-relaxed">
        ייתכן שהקישור ישן, או שנפלה טעות בכתובת. אפשר להמשיך מכאן:
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="game-press inline-flex items-center justify-center min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
        >
          לדף הבית
        </Link>
        <Link
          href="/dashboard"
          className="game-press inline-flex items-center justify-center min-h-12 px-6 rounded-lg border border-card-border bg-card font-bold hover:border-primary/50 transition-[border-color,transform] duration-150"
        >
          לאזור הלמידה שלי
        </Link>
      </div>

      <ul className="mt-10 divide-y divide-card-border border-y border-card-border">
        {PLACES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="flex items-center justify-between py-3.5 font-bold hover:text-primary">
              {p.label}
              <ChevronLeft size={16} aria-hidden="true" className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
