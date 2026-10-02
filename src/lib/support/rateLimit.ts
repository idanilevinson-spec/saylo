import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Rolling-24h limits for the support chat. Every message costs a real AI
// call and the chat is open to visitors who aren't signed in, so the limit
// is counted per IP for everyone (stops one script from running up the
// bill) and, on top of that, per account for signed-in users.
//
// Generous enough that a real person with a real problem never hits them.
export const SUPPORT_LIMITS = {
  messagesPerIp: 60,
  messagesPerProfile: 80,
  requestsPerIp: 5,
  requestsPerProfile: 5,
  // Per conversation, so one runaway chat can't grow its history without end.
  userMessagesPerConversation: 30,
} as const;

type Kind = "message" | "request";

async function countSince(keyHash: string, kind: Kind): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("support_rate_events")
    .select("id", { count: "exact", head: true })
    .eq("key_hash", keyHash)
    .eq("kind", kind)
    .gte("created_at", since);
  return count ?? 0;
}

// Checks every key against its limit; records one event per key only when
// all of them are under it, so a rejected call doesn't eat into the quota.
export async function consumeRateLimit(keys: { hash: string; limit: number }[], kind: Kind): Promise<boolean> {
  const counts = await Promise.all(keys.map((k) => countSince(k.hash, kind)));
  if (counts.some((count, i) => count >= keys[i].limit)) return false;
  await supabaseAdmin.from("support_rate_events").insert(keys.map((k) => ({ key_hash: k.hash, kind })));
  return true;
}
