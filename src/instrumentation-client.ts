// Client-side error monitoring (Next.js's native instrumentation-client
// convention, not the older sentry.client.config.ts pattern). A no-op if
// NEXT_PUBLIC_SENTRY_DSN isn't set, so this is safe with or without Sentry
// configured — see .env.local.example for how to turn it on.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
