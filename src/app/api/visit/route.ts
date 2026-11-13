import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { deviceFromUserAgent, DUPLICATE_WINDOW_MS, isBot, seenRecently, visitKey } from "@/lib/marketing/visit";

const recent = new Map<string, number>();

// Stores one anonymous marketing arrival (MarketingVisitBeacon): which
// link tag or social app it came from, the landing page, the time and the
// device type. No IP, cookie or user id is kept (migration 055).

const value = z.string().trim().min(1).max(100).optional();

const Body = z.object({
  utm_source: value,
  utm_medium: value,
  utm_campaign: value,
  utm_content: value,
  utm_term: value,
  path: z.string().max(200).startsWith("/"),
  referrerHost: z.string().max(100).regex(/^[a-z0-9.-]+$/).nullable(),
});

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) return new NextResponse(null, { status: 204 });

  let parsed;
  try {
    parsed = Body.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const b = parsed.data;
  const hasTag = Boolean(b.utm_source || b.utm_medium || b.utm_campaign || b.utm_content || b.utm_term);
  if (!hasTag && !b.referrerHost) return new NextResponse(null, { status: 204 });

  // The same arrival sent more than once counts once (see visitKey).
  const device = deviceFromUserAgent(userAgent ?? "");
  const now = Date.now();
  if (seenRecently(recent, visitKey(b, device), now)) return new NextResponse(null, { status: 204 });
  const { count: repeats } = await supabaseAdmin
    .from("marketing_visits")
    .select("id", { count: "exact", head: true })
    .gte("created_at", new Date(now - DUPLICATE_WINDOW_MS).toISOString())
    .eq("landing_path", b.path)
    .eq("device", device)
    .filter("referrer_host", b.referrerHost ? "eq" : "is", b.referrerHost ?? null)
    .filter("utm_source", b.utm_source ? "eq" : "is", b.utm_source ?? null)
    .filter("utm_campaign", b.utm_campaign ? "eq" : "is", b.utm_campaign ?? null)
    .filter("utm_content", b.utm_content ? "eq" : "is", b.utm_content ?? null);
  if (repeats) return new NextResponse(null, { status: 204 });

  const { error } = await supabaseAdmin.from("marketing_visits").insert({
    utm_source: b.utm_source ?? null,
    utm_medium: b.utm_medium ?? null,
    utm_campaign: b.utm_campaign ?? null,
    utm_content: b.utm_content ?? null,
    utm_term: b.utm_term ?? null,
    landing_path: b.path,
    referrer_host: b.referrerHost,
    device,
  });
  if (error) {
    console.error("marketing visit insert failed:", error.message);
    return NextResponse.json({ error: "not saved" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
