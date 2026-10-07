import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { syncOpenReceipts } from "@/lib/billing/receipts";

// The admin screen's "sync with PayPlus" button — the same pass the daily
// renewals cron runs, on demand.
export const maxDuration = 60;

export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await syncOpenReceipts());
  } catch (err) {
    console.error("receipt sync failed:", err);
    return NextResponse.json({ error: "sync failed" }, { status: 502 });
  }
}
