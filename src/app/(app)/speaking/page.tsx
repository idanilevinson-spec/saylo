"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import PremiumGate from "@/components/PremiumGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { requiresParentalConsent } from "@/lib/auth/consentGate";
import type { ConversationScenario } from "@/types/database";

export default function SpeakingPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ConversationScenario[] | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    supabase
      .from("conversation_scenarios")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setScenarios(data ?? []));
  }, []);

  if (authLoading || !profile) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (requiresParentalConsent(profile)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-6">דיבור עם AI</h1>
        <ConsentRequestForm status={profile.parental_consent_status} />
      </div>
    );
  }

  async function startConversation(scenarioId: string | null) {
    if (!profile || starting) return;
    setStarting(true);
    const { data } = await supabase
      .from("conversations")
      .insert({ profile_id: profile.id, scenario_id: scenarioId })
      .select()
      .single();
    if (data) router.push(`/speaking/chat/${data.id}`);
    setStarting(false);
  }

  return (
    <PremiumGate featureName="דיבור עם AI">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold">דיבור עם AI</h1>
          <p className="mt-2 text-muted">תרגלו שיחה אמיתית באנגלית — בחרו תרחיש או פתחו שיחה חופשית</p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startConversation(null)}
          disabled={starting}
          className="mt-8 w-full text-right bg-primary/5 border border-primary/20 rounded-2xl p-5 hover:border-primary/40 transition-[border-color] disabled:opacity-60"
        >
          <span className="text-2xl">💬</span>
          <h2 className="mt-2 font-bold">שיחה חופשית</h2>
          <p className="text-sm text-muted mt-1">דברו על מה שבא לכם עם המורה ה-AI</p>
        </motion.button>

        <h2 className="mt-8 text-lg font-bold text-muted">תרחישים</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {(scenarios ?? []).map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startConversation(s.id)}
              disabled={starting}
              className="text-right bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-[box-shadow,border-color] disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{s.title_he}</h3>
                <CefrBadge level={s.cefr_level} />
              </div>
              <EnglishText as="p" className="mt-1 text-sm text-muted">
                {s.title_en}
              </EnglishText>
            </motion.button>
          ))}
        </div>
      </div>
    </PremiumGate>
  );
}
