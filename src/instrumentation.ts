import type { Instrumentation } from "next";

// Server-side error monitoring via Next.js's native instrumentation hooks
// (register + onRequestError), not Sentry's older sentry.server.config.ts /
// sentry.edge.config.ts pattern. A no-op if NEXT_PUBLIC_SENTRY_DSN isn't
// set — see .env.local.example for how to turn it on.
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, request, context);
};
