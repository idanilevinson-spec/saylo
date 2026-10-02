import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { createClient } from "@/lib/supabase/serverClient";
import { hasAiConsent } from "@/lib/ai/consent";
import { isPaidActive, isPremiumActive } from "@/lib/subscriptions/entitlements";
import { regenerateHearts } from "@/lib/subscriptions/hearts";
import { DAILY_CONVERSATION_LIMIT, DAILY_WRITING_LIMIT } from "@/lib/legal/siteInfo";
import { SUPPORT_TOPICS } from "./topics";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The assistant's two tools. Both are deliberately read-only or UI-only:
// it can look at the signed-in user's account and it can open a form, but it
// can't change anything. Anything that changes an account (cancel, refund,
// delete) stays a button the person presses themselves, or a request a human
// handles — a support bot that can act is a support bot that can be talked
// into acting.

export const GET_ACCOUNT_STATUS = "get_account_status";
export const OFFER_CALLBACK_FORM = "offer_callback_form";

export const SUPPORT_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: GET_ACCOUNT_STATUS,
    description:
      "Read the signed-in person's own account status: subscription (status, plan, billing provider, trial end, renewal or end date, whether cancellation is scheduled), hearts, streak and freezes, whether the placement test is done, AI-consent and parental-consent status, today's AI-teacher and writing usage against the fair-use limits, and which emails/reminders are on. Use it when the answer depends on this person's own account. Only available when the person is signed in. Takes no input.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
    strict: true,
  },
  {
    name: OFFER_CALLBACK_FORM,
    description:
      "Show the person a short form, right in the chat, where they can leave their name and an email or phone number so someone from the Saylo team gets back to them. Use it when only a person can resolve the issue, when the person asks for a human or a callback, or when you couldn't answer from the knowledge base. The form itself collects contact details; never ask for them in the chat.",
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: [...SUPPORT_TOPICS],
          description:
            "billing = payments, subscription, refunds; technical = bugs, something not working; account = sign-in, email, deletion; content = a mistake in learning content; privacy = personal data requests; school = teachers, schools, bulk purchase; other.",
        },
        summary: {
          type: "string",
          description:
            "For the team member who will handle this, in Hebrew, 1–3 sentences: what the person needs and what was already tried in the chat. No contact details.",
        },
      },
      required: ["topic", "summary"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export const CallbackFormInput = z.object({
  topic: z.enum(SUPPORT_TOPICS),
  summary: z.string().trim().min(1).max(600),
});

// What the model sees. Field names are self-explanatory on purpose — no
// separate documentation for it to keep in mind. No email, name or other
// identifying detail is included: it doesn't need them to answer.
export async function readAccountStatus(supabase: SupabaseServerClient, user: { id: string; user_metadata?: Record<string, unknown> | null }) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ data: profile }, { data: sub }, { data: hearts }, { data: streak }, { data: placement }, conversations, writing] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "age_band, parental_consent_status, email_reminders_enabled, push_reminders_enabled, weekly_report_enabled, monthly_report_enabled, created_at"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("status, billing_provider, trial_ends_at, current_period_end, cancel_at_period_end, subscription_plans(code)")
        .eq("profile_id", user.id)
        .maybeSingle(),
      supabase.from("hearts").select("current_hearts, max_hearts, last_regen_at").eq("profile_id", user.id).maybeSingle(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, last_active_date, freeze_count")
        .eq("profile_id", user.id)
        .maybeSingle(),
      supabase
        .from("placement_tests")
        .select("completed_at, result_cefr_overall")
        .eq("profile_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("conversations").select("id", { count: "exact", head: true }).eq("profile_id", user.id).gte("created_at", since),
      supabase
        .from("writing_submissions")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .gte("created_at", since),
    ]);

  const now = new Date();
  const premium = sub ? isPremiumActive(sub, now) : false;
  const paid = sub ? isPaidActive(sub, now) : false;
  const plan = (sub?.subscription_plans as unknown as { code: string } | null)?.code ?? null;
  const currentHearts =
    hearts && !premium
      ? regenerateHearts(
          { current: hearts.current_hearts, max: hearts.max_hearts, lastRegenAt: new Date(hearts.last_regen_at) },
          now
        ).current
      : null;

  return {
    now: now.toISOString(),
    account_created_at: profile?.created_at ?? null,
    age_band: profile?.age_band ?? null,
    parental_consent_status: profile?.parental_consent_status ?? null,
    ai_consent_given: hasAiConsent(user),
    placement_test_completed: !!placement,
    placement_level: placement?.result_cefr_overall ?? null,
    subscription: sub
      ? {
          status: sub.status,
          plan,
          billing_provider: sub.billing_provider,
          trial_ends_at: sub.trial_ends_at,
          current_period_end: sub.current_period_end,
          cancellation_scheduled: sub.cancel_at_period_end,
          has_premium_features_now: premium,
          has_ai_teacher_conversation_now: paid,
        }
      : { status: "none", has_premium_features_now: false, has_ai_teacher_conversation_now: false },
    hearts: premium ? "unlimited (subscription or trial active)" : currentHearts === null ? null : { current: currentHearts, max: hearts!.max_hearts },
    streak: streak
      ? {
          current: streak.current_streak,
          longest: streak.longest_streak,
          last_active_date: streak.last_active_date,
          freezes_available: streak.freeze_count,
        }
      : null,
    fair_use_last_24h: {
      ai_teacher_conversations_started: conversations.count ?? 0,
      ai_teacher_conversations_limit: DAILY_CONVERSATION_LIMIT,
      writing_submissions: writing.count ?? 0,
      writing_submissions_limit: DAILY_WRITING_LIMIT,
    },
    notifications: profile
      ? {
          email_reminders: profile.email_reminders_enabled,
          push_reminders: profile.push_reminders_enabled,
          weekly_report_email: profile.weekly_report_enabled,
          monthly_report_email: profile.monthly_report_enabled,
        }
      : null,
  };
}
