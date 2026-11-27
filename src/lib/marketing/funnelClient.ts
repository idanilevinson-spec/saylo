"use client";

import { Capacitor } from "@capacitor/core";
import type { FunnelStep } from "./funnel";

// Sends one anonymous funnel step (see lib/marketing/funnel.ts). Each page
// load gets a random id that lives only in memory, so the steps of one visit
// can be counted together (opened the trial lesson → finished it → signed
// up) without a cookie, IP or account. A new tab or a reload is a new visit.
// Each step is sent once per visit. The iOS app isn't counted: this is about
// people deciding on the website.

function newFlowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return Math.random().toString(36).slice(2, 18);
}

const flow = typeof window === "undefined" ? "" : newFlowId();
let source = "direct";
const sent = new Set<FunnelStep>();

// Set once by MarketingVisitBeacon from the first page of the visit, so
// later steps (after moving inside the site) still say where it came from.
export function rememberSource(value: string) {
  source = value;
}

export function trackStep(step: FunnelStep, detail?: string) {
  if (typeof window === "undefined" || sent.has(step)) return;
  if (Capacitor.isNativePlatform()) return;
  sent.add(step);
  try {
    void fetch("/api/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow, step, source, detail: detail ?? null }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // A lost count is not worth bothering the visitor about.
  }
}
