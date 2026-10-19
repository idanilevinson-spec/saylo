"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import { isUserPaidSubscriber } from "@/lib/subscriptions/subscriptionService";
import {
  TRIAL_TEACHER_CONVERSATIONS,
  TRIAL_TEACHER_MESSAGES,
  trialTeacherConversationIds,
} from "@/lib/subscriptions/teacherTrial";

// The free trial's taste of the teacher, on screen: how much of it is left,
// and, once it's used, the invitation to subscribe. The routes enforce the
// limits; this only explains them.

export type TeacherAccess =
  | { mode: "loading" }
  | { mode: "paid" }
  | { mode: "trial"; conversationIds: string[] }
  | { mode: "none" };

export function useTeacherAccess(): TeacherAccess {
  const { profile } = useAuth();
  const [access, setAccess] = useState<TeacherAccess>({ mode: "loading" });
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      const paid = await isUserPaidSubscriber(profile.id);
      if (paid) return { mode: "paid" } as const;
      const ids = await trialTeacherConversationIds(supabase, profile.id);
      return ids ? ({ mode: "trial", conversationIds: ids } as const) : ({ mode: "none" } as const);
    })().then((a) => {
      if (!cancelled) setAccess(a);
    });
    return () => {
      cancelled = true;
    };
  }, [profile]);
  return access;
}

export const trialConversationsLeft = (access: TeacherAccess) =>
  access.mode === "trial" ? Math.max(0, TRIAL_TEACHER_CONVERSATIONS - access.conversationIds.length) : 0;

// Under the heading of the teacher pages, for a trial learner.
export function TrialTeacherStrip({ access }: { access: TeacherAccess }) {
  if (access.mode !== "trial") return null;
  const left = trialConversationsLeft(access);
  if (left === 0) return <TrialTeacherUpsell />;
  return (
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
      <Sparkles size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
      <span>
        בתקופת הניסיון אפשר לנסות את המורה ב-{TRIAL_TEACHER_CONVERSATIONS} שיחות, עד {TRIAL_TEACHER_MESSAGES} הודעות בכל שיחה,
        כולל הסיכום בסוף. {left === 1 ? "נשארה שיחה אחת." : `נשארו ${left} שיחות.`}
      </span>
    </p>
  );
}

// Inside a trial conversation: which one it is and how many messages remain.
export function TrialConversationNote({ index, userMessages }: { index: number; userMessages: number }) {
  const left = Math.max(0, TRIAL_TEACHER_MESSAGES - userMessages);
  return (
    <p className="mb-2 text-center text-xs text-muted">
      שיחת ניסיון {index + 1} מתוך {TRIAL_TEACHER_CONVERSATIONS} ·{" "}
      {left === 0 ? "ההודעות לשיחה הזו נגמרו" : left === 1 ? "נשארה הודעה אחת" : `נשארו ${left} הודעות`}
    </p>
  );
}

export function TrialTeacherUpsell({ conversationEnded = false }: { conversationEnded?: boolean }) {
  return (
    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
      <p className="font-bold">
        {conversationEnded ? "ההודעות בשיחת הניסיון הזו נגמרו" : "שיחות הניסיון עם המורה נוצלו"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {conversationEnded ? "אפשר לסיים את השיחה ולקבל את הסיכום שלה. " : ""}
        במנוי אפשר לדבר עם המורה בלי הגבלה, בכתב ובקול, עם תיקונים, זיכרון משיחה לשיחה וסיכום בסוף כל שיחה.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-ink hover:bg-primary-hover transition-colors"
      >
        לצפייה במסלולים
      </Link>
    </div>
  );
}
