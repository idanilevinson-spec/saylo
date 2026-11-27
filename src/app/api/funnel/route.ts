import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/serverClient";
import { deviceFromUserAgent, isBot } from "@/lib/marketing/visit";
import { cleanDetail, FUNNEL_STEPS } from "@/lib/marketing/funnel";

// Stores one anonymous funnel step (lib/marketing/funnelClient): the step,
// a random per-visit id that lives only in the visitor's page memory, where
// the visit came from, the device type and the time. No IP, cookie value or
// user id is kept (migration 061). Steps from admin and test accounts are
// dropped so the owner's own checks don't count.

const Body = z.object({
  flow: z.string().regex(/^[a-z0-9]{8,32}$/i),
  step: z.enum(FUNNEL_STEPS),
  source: z.string().trim().min(1).max(40).regex(/^[a-z0-9_.\-]+$/i),
  detail: z.unknown().optional(),
});

async function isStaffSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) return false;
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin, is_test_account")
      .eq("id", userId)
      .maybeSingle();
    return Boolean(profile?.is_admin || profile?.is_test_account);
  } catch {
    return false;
  }
}

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
  if (await isStaffSession()) return new NextResponse(null, { status: 204 });

  const b = parsed.data;
  // One row per step per visit: a repeat (double send, second round of the
  // trial lesson) is ignored by the unique index.
  const { error } = await supabaseAdmin.from("funnel_events").upsert(
    {
      flow: b.flow,
      step: b.step,
      source: b.source.toLowerCase(),
      detail: cleanDetail(b.detail),
      device: deviceFromUserAgent(userAgent ?? ""),
    },
    { onConflict: "flow,step", ignoreDuplicates: true },
  );
  if (error) {
    console.error("funnel step insert failed:", error.message);
    return NextResponse.json({ error: "not saved" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
