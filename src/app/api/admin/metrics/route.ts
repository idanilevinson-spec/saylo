import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { loadDashboardMetrics } from "@/lib/admin/dashboardMetrics";

// Headline numbers for the admin overview and analytics screens. Computed
// with the service role, so the admin check is the whole gate.
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await loadDashboardMetrics());
  } catch (err) {
    console.error("admin metrics failed:", err);
    return NextResponse.json({ error: "metrics failed" }, { status: 500 });
  }
}
