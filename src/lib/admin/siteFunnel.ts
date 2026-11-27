import type { FunnelStep } from "@/lib/marketing/funnel";

// The site funnel on the admin analytics screen: anonymous steps from
// funnel_events (migration 061), each counted once per visit.

export interface SiteFunnelRow {
  step: FunnelStep;
  source: string;
  detail: string | null;
  device: string;
}

export interface SiteFunnelSummary {
  steps: { step: FunnelStep; label: string; count: number }[];
  sources: { source: string; visits: number; trialStarts: number; signupViews: number }[];
  signupMethods: { method: string; count: number }[];
  signupErrors: { reason: string; count: number }[];
  topLandings: { path: string; count: number }[];
}

// The main path in order; the side steps (terms box, errors) are listed
// apart so the bars stay a funnel.
const MAIN_STEPS: [FunnelStep, string][] = [
  ["visit", "נכנסו לאתר"],
  ["try_view", "ראו את שיעור הניסיון"],
  ["try_start", "ענו על שאלה ראשונה"],
  ["try_finish", "סיימו את שיעור הניסיון"],
  ["try_signup_click", "לחצו \"ליצור חשבון\" בסוף השיעור"],
  ["signup_view", "ראו את טופס ההרשמה"],
  ["signup_terms_blocked", "נעצרו כי לא סימנו את התנאים"],
  ["signup_submit", "שלחו הרשמה"],
  ["signup_email_sent", "חיכו למייל אישור"],
  ["signup_done", "חשבון נפתח מיד (אימייל)"],
];

function countBy<T>(rows: T[], key: (r: T) => string | null): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

const sorted = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

export function summarizeSiteFunnel(rows: SiteFunnelRow[]): SiteFunnelSummary {
  const byStep = countBy(rows, (r) => r.step);
  const bySource = (step: FunnelStep) => countBy(rows.filter((r) => r.step === step), (r) => r.source);
  const visits = bySource("visit");
  const trialStarts = bySource("try_start");
  const signupViews = bySource("signup_view");
  const sources = new Set([...visits.keys(), ...trialStarts.keys(), ...signupViews.keys()]);

  return {
    steps: MAIN_STEPS.map(([step, label]) => ({ step, label, count: byStep.get(step) ?? 0 })),
    sources: [...sources]
      .map((source) => ({
        source,
        visits: visits.get(source) ?? 0,
        trialStarts: trialStarts.get(source) ?? 0,
        signupViews: signupViews.get(source) ?? 0,
      }))
      .sort((a, b) => b.visits - a.visits),
    signupMethods: sorted(countBy(rows.filter((r) => r.step === "signup_submit"), (r) => r.detail)).map(
      ([method, count]) => ({ method, count }),
    ),
    signupErrors: sorted(countBy(rows.filter((r) => r.step === "signup_error"), (r) => r.detail)).map(
      ([reason, count]) => ({ reason, count }),
    ),
    topLandings: sorted(countBy(rows.filter((r) => r.step === "visit"), (r) => r.detail))
      .slice(0, 8)
      .map(([path, count]) => ({ path, count })),
  };
}
