// Client-side error monitoring (Next.js's native instrumentation-client
// convention, not the older sentry.client.config.ts pattern). A no-op if
// NEXT_PUBLIC_SENTRY_DSN isn't set, so this is safe with or without Sentry
// configured — see .env.local.example for how to turn it on.
//
// Loaded on demand: the DSN is inlined at build time, so without one the
// SDK never reaches the browser at all (it was ~60KB on every page), and
// with one it loads as its own chunk instead of holding up the first one.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  import("@sentry/nextjs").then((Sentry) =>
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
  );
}
