import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { summarizeSiteFunnel, type SiteFunnelRow } from "@/lib/admin/siteFunnel";

// The anonymous site funnel (funnel_events, migration 061) for the admin
// analytics screen. Only the service role can read that table, so the
// admin check is the whole gate.
export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const days = Math.min(90, Math.max(1, Number(new URL(request.url).searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const rows: SiteFunnelRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("funnel_events")
      .select("step, source, detail, device")
      .gte("created_at", since)
      .order("id")
      .range(from, from + 999);
    if (error) {
      console.error("site funnel failed:", error.message);
      return NextResponse.json({ error: "funnel failed" }, { status: 500 });
    }
    rows.push(...((data ?? []) as SiteFunnelRow[]));
    if (!data || data.length < 1000) break;
  }
  return NextResponse.json({ days, ...summarizeSiteFunnel(rows) });
}
