"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import StatusBadge from "@/components/admin/StatusBadge";
import { subscriptionLabel } from "@/lib/admin/metricRules";
import type { IncompleteSignup, DashboardMetrics } from "@/lib/admin/dashboardMetrics";
import type { AgeBand, SubscriptionStatus } from "@/types/database";

interface UserRow {
  id: string;
  display_name: string;
  age: number;
  age_band: AgeBand;
  is_admin: boolean;
  is_test_account: boolean;
  created_at: string;
  subscription_status: string | null;
  current_streak: number;
}

const AGE_BAND_LABELS: Record<AgeBand, string> = { child: "ילד/ה", teen: "נוער", adult: "מבוגר/ת" };

const PROVIDER_LABELS: Record<string, string> = { email: "מייל", apple: "Apple", google: "Google" };

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("he-IL") : "—";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [incomplete, setIncomplete] = useState<IncompleteSignup[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: subs }, { data: streaks }, metricsRes] = await Promise.all([
        // "*" rather than a column list so the page still loads before
        // is_test_account exists (migration 048).
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("profile_id, status, trial_ends_at, current_period_end"),
        supabase.from("streaks").select("profile_id, current_streak"),
        fetch("/api/admin/metrics", { cache: "no-store" }),
      ]);

      const now = new Date();
      const subByProfile = new Map(
        (subs ?? []).map((s) => [
          s.profile_id,
          subscriptionLabel(
            s as { status: SubscriptionStatus; trial_ends_at: string | null; current_period_end: string | null },
            now,
          ),
        ]),
      );
      const streakByProfile = new Map((streaks ?? []).map((s) => [s.profile_id, s.current_streak]));

      setUsers(
        (profiles ?? []).map((p) => ({
          id: p.id,
          display_name: p.display_name,
          age: p.age,
          age_band: p.age_band,
          is_admin: p.is_admin,
          is_test_account: !!p.is_test_account,
          created_at: p.created_at,
          subscription_status: subByProfile.get(p.id) ?? null,
          current_streak: streakByProfile.get(p.id) ?? 0,
        }))
      );
      if (metricsRes.ok) {
        setIncomplete(((await metricsRes.json()) as DashboardMetrics).incompleteSignups);
      }
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
          aria-label="חיפוש לפי שם"
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
                    {u.is_test_account && <span className="ms-2 text-xs text-muted font-bold">בדיקה</span>}
                  </td>
                  <td className="py-2.5 pe-4">{u.age}</td>
                  <td className="py-2.5 pe-4">{AGE_BAND_LABELS[u.age_band]}</td>
                  <td className="py-2.5 pe-4">
                    {u.subscription_status ? <StatusBadge status={u.subscription_status} /> : "—"}
                  </td>
                  <td className="py-2.5 pe-4">
                    <span className="flex items-center gap-1 text-accent-hover font-medium">
                      {u.current_streak} <Flame size={14} className="fill-current" />
                    </span>
                  </td>
                  <td className="py-2.5 pe-4 text-muted">
                    {new Date(u.created_at).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incomplete && incomplete.length > 0 && (
        <section id="incomplete" className="mt-10 scroll-mt-6">
          <h2 className="text-lg font-bold">נרשמו ולא השלימו פרופיל ({incomplete.length})</h2>
          <p className="mt-1 text-sm text-muted">
            פתחו חשבון אבל לא סיימו את הגדרת הפרופיל, ולכן לא מופיעים ברשימה למעלה ולא נספרים כמשתמשים.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-right text-muted border-b border-card-border">
                  <th className="py-2 pe-4 font-medium">מייל</th>
                  <th className="py-2 pe-4 font-medium">כניסה דרך</th>
                  <th className="py-2 pe-4 font-medium">מייל אומת</th>
                  <th className="py-2 pe-4 font-medium">נרשם/ה</th>
                  <th className="py-2 pe-4 font-medium">כניסה אחרונה</th>
                </tr>
              </thead>
              <tbody>
                {incomplete.map((u) => (
                  <tr key={u.id} className="border-b border-card-border last:border-0">
                    <td className="py-2.5 pe-4" dir="ltr">
                      {u.email ?? "—"}
                    </td>
                    <td className="py-2.5 pe-4">{u.provider ? (PROVIDER_LABELS[u.provider] ?? u.provider) : "—"}</td>
                    <td className="py-2.5 pe-4">{u.emailConfirmed ? "כן" : "לא"}</td>
                    <td className="py-2.5 pe-4 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="py-2.5 pe-4 text-muted">{u.lastSignInAt ? formatDate(u.lastSignInAt) : "אף פעם"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
