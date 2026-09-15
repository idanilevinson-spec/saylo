import "server-only";
import crypto from "node:crypto";
import http2 from "node:http2";

// Native push for the iOS app, parallel to webpush.ts but talking to Apple
// Push Notification service directly over HTTP/2 instead of going through a
// library — the obvious npm package for this (`apn`) pulls in an old,
// vulnerable jsonwebtoken + node-forge (several high/critical CVEs) as
// transitive deps, and everything it does beyond "sign a JWT, POST over
// HTTP/2" is unnecessary here. Node's own crypto + http2 modules cover both
// with no extra dependency.
//
// TestFlight and App Store builds both use Apple's *production* APNs
// endpoint — only a local Xcode debug build would need the sandbox one, and
// this app is never built that way (Codemagic only), so there's no
// environment toggle to configure.

const APNS_HOST = "api.push.apple.com";
const BUNDLE_ID = "com.saylolearn.app";

let cachedToken: { jwt: string; issuedAt: number } | null = null;

function isConfigured(): boolean {
  return !!(process.env.APNS_KEY && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID);
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// APNs provider tokens are valid up to an hour; Apple asks providers not to
// generate a fresh one more than once every ~20 minutes, so this caches and
// reuses one until it's within 5 minutes of that self-imposed limit.
function getProviderToken(): string {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now - cachedToken.issuedAt < 15 * 60) return cachedToken.jwt;

  const header = { alg: "ES256", kid: process.env.APNS_KEY_ID };
  const payload = { iss: process.env.APNS_TEAM_ID, iat: now };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const key = crypto.createPrivateKey(process.env.APNS_KEY!);
  const signature = crypto.sign("sha256", Buffer.from(signingInput), { key, dsaEncoding: "ieee-p1363" });
  const jwt = `${signingInput}.${base64url(signature)}`;

  cachedToken = { jwt, issuedAt: now };
  return jwt;
}

export async function sendApnsPush(
  deviceToken: string,
  payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; expired?: boolean }> {
  if (!isConfigured()) return { ok: false };

  const body = JSON.stringify({
    aps: { alert: { title: payload.title, body: payload.body }, sound: "default" },
    url: payload.url,
  });

  return new Promise((resolve) => {
    const client = http2.connect(`https://${APNS_HOST}`);
    client.on("error", () => resolve({ ok: false }));

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${getProviderToken()}`,
      "apns-topic": BUNDLE_ID,
      "apns-push-type": "alert",
      "content-type": "application/json",
    });

    let status = 0;
    req.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    req.on("end", () => {
      client.close();
      // 410 means the device token is no longer registered (app removed,
      // token rotated) — the caller should delete it so future jobs stop
      // retrying it. Every other non-200 is a transient/config failure.
      resolve({ ok: status === 200, expired: status === 410 });
    });
    req.on("error", () => {
      client.close();
      resolve({ ok: false });
    });

    req.setEncoding("utf8");
    req.end(body);
  });
}
