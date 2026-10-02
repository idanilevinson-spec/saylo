import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Daily job (see vercel.json) — enforces the support data retention stated
// on the privacy page: chats without a request after 90 days, requests
// after 12 months, rate-limit rows after two days (migration 042).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin.rpc("purge_old_support_data");
  if (error) {
    console.error("support cleanup failed", error);
    return NextResponse.json({ error: "purge failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
