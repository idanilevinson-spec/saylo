"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import type { AgeBand } from "@/types/database";

interface UserRow {
  id: string;
  display_name: string;
  age: number;
  age_band: AgeBand;
  is_admin: boolean;
  created_at: string;
  subscription_status: string | null;
  current_streak: number;
}

const AGE_BAND_LABELS: Record<AgeBand, string> = { child: "ילד/ה", teen: "נוער", adult: "מבוגר/ת" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: subs }, { data: streaks }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, age, age_band, is_admin, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("profile_id, status"),
        supabase.from("streaks").select("profile_id, current_streak"),
      ]);

      const subByProfile = new Map((subs ?? []).map((s) => [s.profile_id, s.status]));
      const streakByProfile = new Map((streaks ?? []).map((s) => [s.profile_id, s.current_streak]));

      setUsers(
        (profiles ?? []).map((p) => ({
          ...p,
          subscription_status: subByProfile.get(p.id) ?? null,
          current_streak: streakByProfile.get(p.id) ?? 0,
        }))
      );
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = search.trim();
    if (!q) return users;
    return users.filter((u) => u.display_name.includes(q));
  }, [users, search]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-bold">משתמשים {users ? `(${users.length})` : ""}</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם..."
          className="px-3 py-2 rounded-lg border border-card-border bg-card text-sm w-56"
        />
      </div>

      {!filtered ? (
        <p className="mt-6 text-muted">טוען...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-muted">לא נמצאו משתמשים.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-right text-muted border-b border-card-border">
                <th className="py-2 pe-4 font-medium">שם</th>
                <th className="py-2 pe-4 font-medium">גיל</th>
                <th className="py-2 pe-4 font-medium">קבוצת גיל</th>
                <th className="py-2 pe-4 font-medium">מנוי</th>
                <th className="py-2 pe-4 font-medium">רצף</th>
                <th className="py-2 pe-4 font-medium">נרשם/ה</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-card-border last:border-0 hover:bg-background-2">
                  <td className="py-2.5 pe-4">
                    <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-primary transition-colors">
                      {u.display_name}
                    </Link>
                    {u.is_admin && <span className="ms-2 text-xs text-accent-hover font-bold">מנהל</span>}
                  </td>
                  <td className="py-2.5 pe-4">{u.age}</td>
                  <td className="py-2.5 pe-4">{AGE_BAND_LABELS[u.age_band]}</td>
                  <td className="py-2.5 pe-4">
                    {u.subscription_status ? <StatusBadge status={u.subscription_status} /> : "—"}
                  </td>
                  <td className="py-2.5 pe-4">{u.current_streak} 🔥</td>
                  <td className="py-2.5 pe-4 text-muted">
                    {new Date(u.created_at).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
