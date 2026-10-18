"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";
import type { DashboardMetrics } from "@/lib/admin/dashboardMetrics";

interface Metrics {
  totalUsers: number;
  activeSubs: number;
  mrr: number;
  activeLast7Days: number;
  incompleteSignups: number;
  testAccountCount: number;
  avgStreak: number;
  publishedExercises: number;
  openReports: number;
  signupsLast7Days: number;
}

function MetricCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="bg-card border border-card-border rounded-lg p-5 hover:border-primary/40 hover:shadow-md transition-[border-color,box-shadow] h-full">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function load() {
      const [
        dashboardRes,
        { data: streaksData },
        { count: publishedExercises },
        { count: openReports },
      ] = await Promise.all([
        fetch("/api/admin/metrics", { cache: "no-store" }),
        supabase.from("streaks").select("current_streak"),
        supabase.from("exercises").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      if (!dashboardRes.ok) {
        setFailed(true);
        return;
      }
      const dashboard = (await dashboardRes.json()) as DashboardMetrics;

      const streaks = streaksData ?? [];
      const avgStreak = streaks.length
        ? streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length
        : 0;

      setMetrics({
        totalUsers: dashboard.totalUsers,
        activeSubs: dashboard.revenue.payingCount,
        mrr: dashboard.revenue.mrr,
        activeLast7Days: dashboard.activeLast7Days,
        incompleteSignups: dashboard.incompleteSignups.length,
        testAccountCount: dashboard.testAccountCount,
        avgStreak: Math.round(avgStreak * 10) / 10,
        publishedExercises: publishedExercises ?? 0,
        openReports: openReports ?? 0,
        signupsLast7Days: dashboard.signupsLast7Days,
      });
    }
    load();
  }, []);

  if (failed) {
    return <p className="text-danger">לא הצלחנו לטעון את הנתונים. נסו לרענן את העמוד.</p>;
  }
  if (!metrics) {
    return <p className="text-muted">טוען נתונים...</p>;
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="משתמשים רשומים" value={String(metrics.totalUsers)} href="/admin/users" />
        <MetricCard label="הרשמות ב-7 ימים אחרונים" value={String(metrics.signupsLast7Days)} href="/admin/users" />
        <MetricCard
          label="נרשמו ולא השלימו פרופיל"
          value={String(metrics.incompleteSignups)}
          href="/admin/users#incomplete"
        />
        <MetricCard label="משתמשים פעילים (7 ימים)" value={String(metrics.activeLast7Days)} href="/admin/analytics" />
        <MetricCard label="מנויים משלמים בתוקף" value={String(metrics.activeSubs)} href="/admin/analytics" />
        <MetricCard label="הכנסה חודשית משוערת" value={`₪${metrics.mrr}`} href="/admin/analytics" />
        <MetricCard label="רצף ממוצע (ימים)" value={String(metrics.avgStreak)} href="/admin/analytics" />
        <MetricCard label="תרגילים פורסמו" value={String(metrics.publishedExercises)} href="/admin/content/exercises" />
        <MetricCard label="דיווחים פתוחים לבדיקה" value={String(metrics.openReports)} href="/admin/moderation" />
      </div>
      {metrics.testAccountCount > 0 && (
        <p className="mt-4 text-xs text-muted">
          {metrics.testAccountCount} חשבונות בדיקה לא נכללים במספרי המשתמשים, הפעילות וההכנסה.
        </p>
      )}
    </div>
  );
}
