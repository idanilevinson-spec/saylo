import "server-only";

// Records a silent AI JSON-parse failure to Sentry, if configured. These
// don't throw — the caller falls back to a hardcoded "something went
// wrong" result instead of a 500 — so without this they're invisible
// until a student notices their score or feedback looks broken and
// reports it. A no-op when NEXT_PUBLIC_SENTRY_DSN isn't set, same as
// every other Sentry hook in this app — see instrumentation.ts.
export async function reportAiParseFailure(feature: string, raw: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureMessage(`AI JSON parse failure: ${feature}`, {
    level: "warning",
    extra: { raw: raw.slice(0, 2000) },
  });
}
