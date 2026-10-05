import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildQuickAnswer, type AccountStatus } from "./quickAnswers";
import { OPENS_CONTACT_FORM, QUICK_REPLIES, suggestionsFor, type QuickReplyId } from "./quickReplies";
import { PRICING_PLANS, TRIAL_DAYS } from "@/lib/subscriptions/plans";
import { DAILY_CONVERSATION_LIMIT } from "@/lib/legal/siteInfo";

const anon = { signedIn: false, isNativeApp: false, account: null };

// Loosely typed on purpose: tests describe only the fields that matter.
function account(overrides: { subscription?: Record<string, unknown>; [key: string]: unknown } = {}): AccountStatus {
  const base = {
    now: "2026-10-05T10:00:00Z",
    account_created_at: "2026-09-01T10:00:00Z",
    age_band: "adult",
    parental_consent_status: "not_required",
    ai_consent_given: true,
    placement_test_completed: true,
    placement_level: "B1",
    subscription: {
      status: "active",
      plan: "annual",
      billing_provider: "stripe",
      trial_ends_at: null,
      current_period_end: "2027-09-01T10:00:00Z",
      cancellation_scheduled: false,
      has_premium_features_now: true,
      has_ai_teacher_conversation_now: true,
    },
    hearts: "unlimited (subscription or trial active)",
    streak: null,
    fair_use_last_24h: {
      ai_teacher_conversations_started: 1,
      ai_teacher_conversations_limit: DAILY_CONVERSATION_LIMIT,
      writing_submissions: 0,
      writing_submissions_limit: 15,
    },
    notifications: null,
  };
  return { ...base, ...overrides, subscription: { ...base.subscription, ...overrides.subscription } } as unknown as AccountStatus;
}

// The rule every assistant reply follows: no singular-gendered address.
// ("את" is left out: it is also the direct-object marker, as in "כוללים את".)
const GENDERED = /(^|\s)(אתה|שים|שימי|נסה|נסי|המשך|המשיכי|לחץ|לחצי)(\s|[.,!?]|$)/;

describe("quick replies", () => {
  const answerable = (Object.keys(QUICK_REPLIES) as QuickReplyId[]).filter((id) => id !== OPENS_CONTACT_FORM) as Exclude<
    QuickReplyId,
    "talk_to_person"
  >[];

  it("answers every suggested question, for visitors and signed-in users, without gendered address", () => {
    for (const id of answerable) {
      for (const ctx of [anon, { signedIn: true, isNativeApp: true, account: account() }]) {
        const text = buildQuickAnswer(id, ctx);
        expect(text.length, id).toBeGreaterThan(20);
        expect(text, id).not.toMatch(GENDERED);
      }
    }
  });

  it("only suggests ids that exist", () => {
    for (const path of ["/pricing", "/profile", "/speaking", "/dashboard"]) {
      for (const signedIn of [true, false]) {
        for (const id of suggestionsFor(path, signedIn)) expect(QUICK_REPLIES[id]).toBeTruthy();
      }
    }
  });

  it("states the site's real prices and trial length", () => {
    const plans = buildQuickAnswer("plans_difference", anon);
    for (const p of PRICING_PLANS) expect(plans).toContain(`${p.label}: ₪${p.totalPrice}`);
    expect(buildQuickAnswer("trial", anon)).toContain(`${TRIAL_DAYS} ימי ניסיון`);
  });

  it("asks visitors to sign in for account questions", () => {
    for (const id of ["my_subscription", "no_hearts", "teacher_unavailable"] as const) {
      expect(buildQuickAnswer(id, anon)).toContain("/login");
    }
  });

  it("describes each subscription state from the account", () => {
    const signed = (a: AccountStatus) => ({ signedIn: true, isNativeApp: false, account: a });
    expect(buildQuickAnswer("my_subscription", signed(account()))).toContain("פעיל");
    expect(buildQuickAnswer("my_subscription", signed(account({ subscription: { cancellation_scheduled: true } })))).toContain(
      "החידוש שלו בוטל"
    );
    expect(
      buildQuickAnswer(
        "my_subscription",
        signed(account({ subscription: { status: "trialing", trial_ends_at: "2026-10-07T10:00:00Z", has_ai_teacher_conversation_now: false } }))
      )
    ).toContain("תקופת הניסיון");
    expect(
      buildQuickAnswer("my_subscription", signed({ ...account(), subscription: { status: "none", has_premium_features_now: false, has_ai_teacher_conversation_now: false } } as unknown as AccountStatus))
    ).toContain("אין בחשבון מנוי פעיל");
  });

  it("explains hearts and the AI teacher from the real reason", () => {
    const signed = (a: AccountStatus) => ({ signedIn: true, isNativeApp: false, account: a });
    const free = account({
      subscription: { status: "expired", has_premium_features_now: false, has_ai_teacher_conversation_now: false },
      hearts: { current: 2, max: 5 } as AccountStatus["hearts"],
    });
    expect(buildQuickAnswer("no_hearts", signed(free))).toContain("2 מתוך 5");
    expect(buildQuickAnswer("teacher_unavailable", signed(free))).toContain("מנוי בתשלום");
    expect(buildQuickAnswer("teacher_unavailable", signed(account({ age_band: "teen", parental_consent_status: "pending" })))).toContain(
      "אישור של הורה"
    );
    expect(
      buildQuickAnswer(
        "teacher_unavailable",
        signed(account({ fair_use_last_24h: { ai_teacher_conversations_started: 5, ai_teacher_conversations_limit: 5, writing_submissions: 0, writing_submissions_limit: 15 } }))
      )
    ).toContain("המגבלה היומית");
  });
});
