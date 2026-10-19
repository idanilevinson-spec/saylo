"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Phone,
  Coffee,
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Scale,
  Clapperboard,
} from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import PremiumGate from "@/components/PremiumGate";
import AiConsentGate from "@/components/AiConsentGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { requiresParentalConsent } from "@/lib/auth/consentGate";
import type { CefrLevel, ConversationScenario, ConversationTopicCategory } from "@/types/database";
import { shelveByLevel } from "@/lib/content/levelOrder";

import { TrialTeacherStrip, trialConversationsLeft, useTeacherAccess } from "@/components/speaking/TrialTeacher";
import { EASE_OUT } from "@/lib/motion/easing";
const CATEGORIES: Record<
  ConversationTopicCategory,
  { label: string; icon: ComponentType<LucideProps>; blurb: string }
> = {
  daily_life: { label: "יום-יום", icon: Coffee, blurb: "שיחות מהחיים היומיומיים" },
  social: { label: "חברתי", icon: Users, blurb: "היכרויות ושיחות חולין" },
  travel: { label: "נסיעות", icon: Plane, blurb: "מהמלון ועד שדה התעופה" },
  work_professional: { label: "עבודה", icon: Briefcase, blurb: "ראיונות, פגישות ומקום העבודה" },
  academic: { label: "לימודים", icon: GraduationCap, blurb: "אוניברסיטה, מרצים ועבודות" },
  health_wellbeing: { label: "בריאות ורווחה", icon: HeartPulse, blurb: "מרופא ועד הרגלים בריאים" },
  serious_topics: { label: "נושאים רציניים", icon: Scale, blurb: "שיחות עומק ואקטואליה" },
  entertainment_culture: { label: "בידור ותרבות", icon: Clapperboard, blurb: "סרטים, מוזיקה וספורט" },
};

const CATEGORY_ORDER: ConversationTopicCategory[] = [
  "daily_life",
  "social",
  "travel",
  "work_professional",
  "academic",
  "health_wellbeing",
  "serious_topics",
  "entertainment_culture",
];

export default function VoiceConversationHubPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ConversationScenario[] | null>(null);
  const [starting, setStarting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  // Trial learners get a taste of the teacher (lib/subscriptions/teacherTrial).
  const teacherAccess = useTeacherAccess();

  // Within each topic, scenarios at the learner's level come first, then
  // one step around it, then the rest: a C2 learner no longer scrolls past
  // "ordering at a restaurant" (A1) to reach their own level. Speaking
  // level if there is one, else vocabulary.
  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("conversation_scenarios").select("*").eq("status", "published").order("category").order("sort_order"),
      supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", profile.id).in("skill", ["speaking", "vocabulary"]),
    ]).then(([{ data }, { data: levels }]) => {
      const level = (levels?.find((l) => l.skill === "speaking")?.cefr_level ??
        levels?.find((l) => l.skill === "vocabulary")?.cefr_level ??
        null) as CefrLevel | null;
      const shelves = shelveByLevel(data ?? [], level, (s) => s.cefr_level);
      setScenarios([...shelves.atLevel, ...shelves.near, ...shelves.rest.flatMap((r) => r.items)]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  if (authLoading || !profile) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (requiresParentalConsent(profile)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center">שיחה קולית עם המורה</h1>
        <ConsentRequestForm status={profile.parental_consent_status} />
      </div>
    );
  }

  async function startConversation(scenarioId: string | null) {
    if (!profile || starting) return;
    if (teacherAccess.mode === "trial" && trialConversationsLeft(teacherAccess) === 0) return;
    setStarting(true);
    setLimitReached(false);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ profile_id: profile.id, scenario_id: scenarioId })
      .select()
      .single();
    if (data) {
      router.push(`/speaking/chat/${data.id}?mode=voice`);
    } else if (error?.message.includes("daily_conversation_limit_reached")) {
      setLimitReached(true);
    }
    setStarting(false);
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: (scenarios ?? []).filter((s) => s.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <PremiumGate featureName="שיחה קולית עם המורה">
      <AiConsentGate declineHref="/speaking">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold">שיחה קולית עם המורה</h1>
            <p className="mt-2 text-muted">
              שיחה קולית עם המורה, כמו בטלפון. בחרו נושא, או פתחו שיחה חופשית על מה שבא לכם.
            </p>
          </div>

          <TrialTeacherStrip access={teacherAccess} />

          {limitReached && (
            <div className="mt-6 p-4 rounded-lg bg-danger-ink text-danger text-sm">
              הגעתם למגבלת 5 שיחות ליום. אפשר להתחיל שיחה חדשה בעוד עד 24 שעות, והשיחות הקודמות עדיין זמינות לצפייה.
            </div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1, ease: EASE_OUT }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startConversation(null)}
            disabled={starting}
            className="mt-8 w-full text-right bg-primary/5 border border-primary/20 rounded-lg p-5 hover:border-primary/40 transition-[border-color] disabled:opacity-60"
          >
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary-hover">
              <Phone size={20} />
            </span>
            <h2 className="mt-2 font-bold">שיחת חולין חופשית</h2>
            <p className="text-sm text-muted mt-1">בלי נושא קבוע. מדברים על מה שבא לכם</p>
          </motion.button>

          {scenarios === null && <p className="mt-10 text-center text-muted">טוען נושאים...</p>}

          {byCategory.map((group, groupIndex) => {
            const meta = CATEGORIES[group.category];
            return (
              <div key={group.category} className="mt-10">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary/10 text-primary-hover">
                    <meta.icon size={16} />
                  </span>
                  <div>
                    <h2 className="font-bold">{meta.label}</h2>
                    <p className="text-xs text-muted">{meta.blurb}</p>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {group.items.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.03 * Math.min(i, 6) + groupIndex * 0.02, ease: EASE_OUT }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startConversation(s.id)}
                      disabled={starting}
                      className="text-right bg-card border border-card-border rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-[box-shadow,border-color] disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm">{s.title_he}</h3>
                        <CefrBadge level={s.cefr_level} />
                      </div>
                      <EnglishText as="p" className="mt-1 text-xs text-muted">
                        {s.title_en}
                      </EnglishText>
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AiConsentGate>
    </PremiumGate>
  );
}
