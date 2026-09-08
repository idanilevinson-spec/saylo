"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";

interface PlanBreakdown {
  code: string;
  count: number;
  mrr: number;
}

interface FunnelStep {
  label: string;
  count: number;
}

interface AnalyticsState {
  totalMrr: number;
  planBreakdown: PlanBreakdown[];
  activeLast7Days: number;
  totalUsers: number;
  exerciseAttemptsLast7Days: number;
  retainedPct: number;
  funnel: FunnelStep[];
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-background-2 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [state, setState] = useState<AnalyticsState | null>(null);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { data: activeSubs },
        { data: profiles },
        { data: streaks },
        { count: exerciseAttemptsLast7Days },
        { data: attemptProfiles },
        { count: completedPlacements },
        { data: usersWithAttempts },
        { data: usersWithConversations },
      ] = await Promise.all([
        supabase.from("subscriptions").select("status, subscription_plans(code, price_ils, months)").eq("status", "active"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("streaks").select("profile_id, last_active_date"),
        supabase.from("exercise_attempts").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("exercise_attempts").select("profile_id").gte("created_at", sevenDaysAgo),
        supabase.from("placement_tests").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("exercise_attempts").select("profile_id").limit(5000),
        supabase.from("conversations").select("profile_id").limit(5000),
      ]);

      const planMap = new Map<string, PlanBreakdown>();
      let totalMrr = 0;
      (activeSubs ?? []).forEach((row) => {
        const plan = row.subscription_plans as unknown as { code: string; price_ils: number; months: number } | null;
        if (!plan || !plan.months) return;
        const monthly = plan.price_ils / plan.months;
        totalMrr += monthly;
        const existing = planMap.get(plan.code) ?? { code: plan.code, count: 0, mrr: 0 };
        existing.count += 1;
        existing.mrr += monthly;
        planMap.set(plan.code, existing);
      });

      const activeProfileIds = new Set((attemptProfiles ?? []).map((r) => r.profile_id));

      const eligibleForRetention = (profiles ?? []).filter((p) => p.created_at < thirtyDaysAgo);
      const streakByProfile = new Map((streaks ?? []).map((s) => [s.profile_id, s.last_active_date]));
      const retainedCount = eligibleForRetention.filter((p) => {
        const lastActive = streakByProfile.get(p.id);
        return lastActive && lastActive >= sevenDaysAgo.slice(0, 10);
      }).length;

      const distinctAttemptUsers = new Set((usersWithAttempts ?? []).map((r) => r.profile_id)).size;
      const distinctConversationUsers = new Set((usersWithConversations ?? []).map((r) => r.profile_id)).size;

      setState({
        totalMrr: Math.round(totalMrr),
        planBreakdown: [...planMap.values()].sort((a, b) => b.mrr - a.mrr),
        activeLast7Days: activeProfileIds.size,
        totalUsers: (profiles ?? []).length,
        exerciseAttemptsLast7Days: exerciseAttemptsLast7Days ?? 0,
        retainedPct: eligibleForRetention.length ? Math.round((retainedCount / eligibleForRetention.length) * 100) : 0,
        funnel: [
          { label: "נרשמו", count: (profiles ?? []).length },
          { label: "השלימו מבחן רמה", count: completedPlacements ?? 0 },
          { label: "ביצעו תרגיל אחד לפחות", count: distinctAttemptUsers },
          { label: "ניסו שיחת AI", count: distinctConversationUsers },
        ],
      });
    }
    load();
  }, []);

  if (!state) return <p className="text-muted">טוען...</p>;

  const funnelMax = state.funnel[0]?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-lg">הכנסה</h2>
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-sm text-muted">הכנסה חודשית משוערת (MRR)</p>
            <p className="mt-2 text-3xl font-bold">₪{state.totalMrr}</p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-sm text-muted">פילוח לפי מסלול</p>
            <ul className="mt-2 space-y-1 text-sm">
              {state.planBreakdown.length === 0 && <li className="text-muted">אין מנויים פעילים עדיין.</li>}
              {state.planBreakdown.map((p) => (
                <li key={p.code} className="flex items-center justify-between">
                  <span>{p.code}</span>
                  <span className="text-muted">
                    {p.count} · ₪{Math.round(p.mrr)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-lg">מעורבות ושימור</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-4">
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-sm text-muted">משתמשים פעילים (7 ימים)</p>
            <p className="mt-2 text-3xl font-bold">{state.activeLast7Days}</p>
            <p className="mt-1 text-xs text-muted">מתוך {state.totalUsers} משתמשים</p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-sm text-muted">תרגילים בוצעו (7 ימים)</p>
            <p className="mt-2 text-3xl font-bold">{state.exerciseAttemptsLast7Days}</p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-sm text-muted">שימור 30→7 ימים</p>
            <p className="mt-2 text-3xl font-bold">{state.retainedPct}%</p>
            <p className="mt-1 text-xs text-muted">ממשתמשים שנרשמו לפני 30+ ימים ועדיין פעילים</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-lg">משפך המרה</h2>
        <div className="mt-3 bg-card border border-card-border rounded-2xl p-5 space-y-4">
          {state.funnel.map((step) => (
            <Bar key={step.label} label={step.label} count={step.count} max={funnelMax} />
          ))}
        </div>
      </div>
    </div>
  );
}
