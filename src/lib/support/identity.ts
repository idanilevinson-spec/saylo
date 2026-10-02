import "server-only";
import { createHmac } from "node:crypto";

// Hashes for the support chat's ownership checks and rate limits. Raw IPs
// and browser tokens are never stored — only an HMAC of them, keyed with a
// server secret, so the stored value can't be reversed or matched against a
// list of IPs by anyone who only has the database.
//
// SUPPORT_HASH_SECRET is optional: without it the service-role key (already
// a server-only secret) is used, so the feature works with no new env var.
function secret(): string {
  const value = process.env.SUPPORT_HASH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Missing SUPPORT_HASH_SECRET (or SUPABASE_SERVICE_ROLE_KEY) for support hashing.");
  return value;
}

export function supportHash(kind: "owner" | "ip" | "profile", value: string): string {
  return createHmac("sha256", secret()).update(`${kind}:${value}`).digest("hex");
}

// Vercel puts the real client IP first in x-forwarded-for.
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// A conversation belongs to the signed-in profile when there is one, and
// otherwise to the random token the browser generated for this chat.
export function ownerKey(profileId: string | null, visitorToken: string): string {
  return supportHash("owner", profileId ? `profile:${profileId}` : `visitor:${visitorToken}`);
}

export const VISITOR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;
