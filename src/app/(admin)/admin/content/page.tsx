"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";

const SECTIONS = [
  { href: "/admin/content/vocabulary", label: "אוצר מילים", table: "vocabulary_items" as const },
  { href: "/admin/content/grammar", label: "דקדוק", table: "grammar_lessons" as const },
  { href: "/admin/content/reading", label: "קריאה", table: "reading_texts" as const },
  { href: "/admin/content/listening", label: "האזנה", table: "listening_clips" as const },
  { href: "/admin/content/exercises", label: "תרגילים", table: "exercises" as const },
];

export default function AdminContentHubPage() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        SECTIONS.map((s) => supabase.from(s.table).select("*", { count: "exact", head: true }))
      );
      const next: Record<string, number> = {};
      results.forEach((r, i) => {
        next[SECTIONS[i].table] = r.count ?? 0;
      });
      setCounts(next);
    }
    load();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
        >
          <p className="font-bold text-lg">{s.label}</p>
          <p className="mt-1 text-sm text-muted">{counts ? `${counts[s.table]} פריטים` : "טוען..."}</p>
        </Link>
      ))}
    </div>
  );
}
