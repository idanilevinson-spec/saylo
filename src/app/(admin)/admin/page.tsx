"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";

interface Metrics {
  totalUsers: number;
  activeSubs: number;
  mrr: number;
  avgStreak: number;
  publishedExercises: number;
  openReports: number;
  signupsLast7Days: number;
}

function MetricCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all h-full">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function load() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { data: activeSubsData },
        { data: streaksData },
        { count: publishedExercises },
        { count: openReports },
        { count: signupsLast7Days },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("status, subscription_plans(price_ils, months)")
          .eq("status", "active"),
        supabase.from("streaks").select("current_streak"),
        supabase.from("exercises").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      ]);

      const mrr = (activeSubsData ?? []).reduce((sum, row) => {
        const plan = row.subscription_plans as unknown as { price_ils: number; months: number } | null;
        if (!plan || !plan.months) return sum;
        return sum + plan.price_ils / plan.months;
      }, 0);

      const streaks = streaksData ?? [];
      const avgStreak = streaks.length
        ? streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length
        : 0;

      setMetrics({
        totalUsers: totalUsers ?? 0,
        activeSubs: activeSubsData?.length ?? 0,
        mrr: Math.round(mrr),
        avgStreak: Math.round(avgStreak * 10) / 10,
        publishedExercises: publishedExercises ?? 0,
        openReports: openReports ?? 0,
        signupsLast7Days: signupsLast7Days ?? 0,
      });
    }
    load();
  }, []);

  if (!metrics) {
    return <p className="text-muted">טוען נתונים...</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard label="משתמשים רשומים" value={String(metrics.totalUsers)} href="/admin/users" />
      <MetricCard label="הרשמות ב-7 ימים אחרונים" value={String(metrics.signupsLast7Days)} href="/admin/users" />
      <MetricCard label="מנויים פעילים" value={String(metrics.activeSubs)} href="/admin/analytics" />
      <MetricCard label="הכנסה חודשית משוערת" value={`₪${metrics.mrr}`} href="/admin/analytics" />
      <MetricCard label="רצף ממוצע (ימים)" value={String(metrics.avgStreak)} href="/admin/analytics" />
      <MetricCard label="תרגילים פורסמו" value={String(metrics.publishedExercises)} href="/admin/content/exercises" />
      <MetricCard label="דיווחים פתוחים לבדיקה" value={String(metrics.openReports)} href="/admin/moderation" />
    </div>
  );
}
