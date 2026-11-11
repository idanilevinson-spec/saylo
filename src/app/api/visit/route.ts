import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { deviceFromUserAgent, isBot } from "@/lib/marketing/visit";

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

  const { error } = await supabaseAdmin.from("marketing_visits").insert({
    utm_source: b.utm_source ?? null,
    utm_medium: b.utm_medium ?? null,
    utm_campaign: b.utm_campaign ?? null,
    utm_content: b.utm_content ?? null,
    utm_term: b.utm_term ?? null,
    landing_path: b.path,
    referrer_host: b.referrerHost,
    device: deviceFromUserAgent(userAgent ?? ""),
  });
  if (error) {
    console.error("marketing visit insert failed:", error.message);
    return NextResponse.json({ error: "not saved" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
