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

// A .p8 key pasted into a one-line environment variable often arrives with
// literal backslash-n sequences instead of line breaks, which
// createPrivateKey rejects. Accept both forms.
function privateKeyPem(): string {
  return process.env.APNS_KEY!.trim().replace(/\\n/g, "\n");
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

  const header = { alg: "ES256", kid: process.env.APNS_KEY_ID!.trim() };
  const payload = { iss: process.env.APNS_TEAM_ID!.trim(), iat: now };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const key = crypto.createPrivateKey(privateKeyPem());
  const signature = crypto.sign("sha256", Buffer.from(signingInput), { key, dsaEncoding: "ieee-p1363" });
  const jwt = `${signingInput}.${base64url(signature)}`;

  cachedToken = { jwt, issuedAt: now };
  return jwt;
}

// Apple's reasons that mean this token will never work again for this app:
// the app was removed (410 Unregistered), or the token belongs to another
// environment or app (BadDeviceToken, DeviceTokenNotForTopic). The caller
// deletes those; the device registers a fresh one next time.
const DEAD_TOKEN_REASONS = new Set(["Unregistered", "BadDeviceToken", "DeviceTokenNotForTopic"]);

export type ApnsResult = {
  ok: boolean;
  expired?: boolean;
  // Why it failed, for the admin's test screen: "not_configured", "bad_key",
  // "network", or Apple's own reason (for example "BadDeviceToken").
  reason?: string;
  status?: number;
};

export async function sendApnsPush(
  deviceToken: string,
  payload: { title: string; body: string; url?: string }
): Promise<ApnsResult> {
  if (!isConfigured()) return { ok: false, reason: "not_configured" };

  let authorization: string;
  try {
    authorization = `bearer ${getProviderToken()}`;
  } catch {
    return { ok: false, reason: "bad_key" };
  }

  const body = JSON.stringify({
    aps: { alert: { title: payload.title, body: payload.body }, sound: "default" },
    url: payload.url,
  });

  return new Promise((resolve) => {
    let settled = false;
    const done = (r: ApnsResult) => {
      if (settled) return;
      settled = true;
      client.close();
      resolve(r);
    };
    const client = http2.connect(`https://${APNS_HOST}`);
    client.on("error", () => done({ ok: false, reason: "network" }));
    client.setTimeout(10_000, () => done({ ok: false, reason: "network" }));

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization,
      "apns-topic": BUNDLE_ID,
      "apns-push-type": "alert",
      "content-type": "application/json",
    });

    let status = 0;
    let text = "";
    req.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      text += chunk;
    });
    req.on("end", () => {
      if (status === 200) return done({ ok: true, status });
      let reason = `http_${status}`;
      try {
        reason = (JSON.parse(text) as { reason?: string }).reason ?? reason;
      } catch {
        // Apple sends an empty body on some failures; the status says enough.
      }
      // A rejected provider token is cached; drop it so the next try signs a new one.
      if (reason === "ExpiredProviderToken" || reason === "InvalidProviderToken") cachedToken = null;
      done({ ok: false, status, reason, expired: status === 410 || DEAD_TOKEN_REASONS.has(reason) });
    });
    req.on("error", () => done({ ok: false, reason: "network" }));

    req.end(body);
  });
}
