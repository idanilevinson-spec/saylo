import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

const WINDOW_DAYS = 7;
const TOP_N = 10;

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  xp: number;
  isMe: boolean;
}

// Reads across all profiles, which the RLS on profiles/xp_events
// deliberately doesn't allow the browser client to do (each user can only
// see their own row) — this route runs the aggregation server-side with
// the service-role client and returns only rank/name/xp, never email,
// age, or anything else from profiles.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const { data: events } = await supabaseAdmin
    .from("xp_events")
    .select("profile_id, amount")
    .gte("created_at", since.toISOString());

  const totals = new Map<string, number>();
  for (const e of events ?? []) {
    totals.set(e.profile_id, (totals.get(e.profile_id) ?? 0) + e.amount);
  }

  const ranked = [...totals.entries()]
    .map(([profileId, xp]) => ({ profileId, xp }))
    .sort((a, b) => b.xp - a.xp);

  const top = ranked.slice(0, TOP_N);
  const meRank = ranked.findIndex((r) => r.profileId === user.id);
  const meInTop = meRank >= 0 && meRank < TOP_N;

  const idsToName = new Set(top.map((r) => r.profileId));
  if (meRank >= 0) idsToName.add(user.id);

  const { data: profiles } =
    idsToName.size > 0
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", [...idsToName])
      : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const entries: LeaderboardEntry[] = top.map((r, i) => ({
    rank: i + 1,
    displayName: nameById.get(r.profileId) ?? "משתמש",
    xp: r.xp,
    isMe: r.profileId === user.id,
  }));

  const me: LeaderboardEntry | null =
    meRank >= 0 && !meInTop
      ? { rank: meRank + 1, displayName: nameById.get(user.id) ?? "אני", xp: ranked[meRank].xp, isMe: true }
      : null;

  return NextResponse.json({ entries, me, windowDays: WINDOW_DAYS });
}
