"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Phone } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import PremiumGate from "@/components/PremiumGate";
import VoiceConversationPanel from "@/components/VoiceConversationPanel";
import SayloAvatar from "@/components/SayloAvatar";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { loadVoicePref, type VoicePref } from "@/lib/speech/voicePref";
import type { ConversationMessage, ConversationScore } from "@/types/database";

export default function SpeakingChatPage() {
  return (
    <PremiumGate featureName="שיחה עם מורה AI" requirePaid>
      <SpeakingChatInner />
    </PremiumGate>
  );
}

function SpeakingChatInner() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const searchParams = useSearchParams();
  const startInVoiceMode = searchParams.get("mode") === "voice";
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [voiceMode, setVoiceMode] = useState(startInVoiceMode);
  const [score, setScore] = useState<ConversationScore | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [teacherGender] = useState<VoicePref>(() => loadVoicePref());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at")
      .then(({ data }) => setMessages(data ?? []));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim() || !profile) return null;

      setMessages((prev) => [
        ...(prev ?? []),
        { id: `temp-${Date.now()}`, conversation_id: conversationId, role: "user", content: text, created_at: new Date().toISOString() },
      ]);

      try {
        const res = await fetch("/api/ai/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message: text }),
        });
        if (!res.ok) throw new Error("failed");
        const { reply } = await res.json();
        const { data } = await supabase
          .from("conversation_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at");
        setMessages(data ?? []);
        return reply as string;
      } catch {
        return null;
      }
    },
    [conversationId, profile]
  );

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await sendMessage(text);
    setSending(false);
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    try {
      const res = await fetch("/api/ai/conversation-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
      }
    } finally {
      setEnding(false);
    }
  }

  if (score) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-center"
        >
          סיכום השיחה
        </motion.h1>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ScoreTile label="ציון כללי" value={score.overall_score} highlight delay={0} />
          <ScoreTile label="שטף (Fluency)" value={score.fluency_score} delay={0.08} />
          <ScoreTile label="דקדוק" value={score.grammar_score} delay={0.16} />
          <ScoreTile label="אוצר מילים" value={score.vocabulary_score} delay={0.24} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 bg-card border border-card-border rounded-lg p-6"
        >
          <p className="leading-relaxed">{score.feedback.generalSuggestionsHe}</p>
        </motion.div>

        {score.feedback.grammarMistakes.length > 0 && (
          <FeedbackList title="טעויות דקדוק שכדאי לשים לב אליהן" items={score.feedback.grammarMistakes} />
        )}
        {score.feedback.overusedWords.length > 0 && (
          <FeedbackList title="מילים שחזרו יותר מדי" items={score.feedback.overusedWords} english />
        )}
        {score.feedback.suggestedVocabulary.length > 0 && (
          <FeedbackList title="מילים שהיה כדאי להשתמש בהן" items={score.feedback.suggestedVocabulary} english />
        )}

        {/* Every turn — including a voice call's — was already being
            transcribed and saved as it happened (the same recognized-speech
            text that drove the AI's replies), just never shown back. This
            is what makes that transcript actually usable: a full read-through
            to see your own mistakes in context, or a screen worth screenshotting
            when the conversation went well. */}
        {messages && messages.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="flex items-center gap-1 text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
            >
              {showTranscript ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showTranscript ? "הסתירו את תמלול השיחה" : "הציגו את תמלול השיחה המלאה"}
            </button>

            <AnimatePresence initial={false}>
              {showTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-card border border-card-border rounded-lg p-5 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[85%] px-4 py-2.5 rounded-lg ${
                            m.role === "user" ? "bg-primary text-primary-ink" : "bg-background-2"
                          }`}
                        >
                          <p className={`text-xs mb-0.5 ${m.role === "user" ? "opacity-80" : "text-muted"}`}>
                            {m.role === "user" ? "אתם" : "מורה AI"}
                          </p>
                          <EnglishText as="p" className="text-left leading-relaxed">
                            {m.content}
                          </EnglishText>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href="/speaking"
          className="mt-6 block text-center px-5 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          לשיחה נוספת
        </MotionLink>
      </div>
    );
  }

  const hasUserMessage = !!messages?.some((m) => m.role === "user");

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <MotionLink
          whileTap={{ scale: 0.97 }}
          href={startInVoiceMode ? "/speaking/voice" : "/speaking"}
          className="text-sm text-primary"
        >
          ← לתרחישים
        </MotionLink>
        <div className="flex items-center gap-2">
          {!voiceMode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVoiceMode(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              <Phone size={15} /> שיחה קולית
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleEnd}
            disabled={ending || !hasUserMessage}
            className="text-sm px-4 py-2 rounded-lg border border-card-border hover:bg-background-2 transition-colors disabled:opacity-40"
          >
            {ending ? "מנתח..." : "סיימו שיחה"}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages === null && <p className="text-center text-muted">טוען...</p>}
        <AnimatePresence initial={false}>
          {messages?.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${m.role === "user" ? "justify-start" : "justify-end"}`}
            >
              {m.role === "user" ? (
                <div className="max-w-[80%] px-4 py-2.5 rounded-lg bg-primary text-primary-ink">
                  <EnglishText as="p" className="text-left leading-relaxed">
                    {m.content}
                  </EnglishText>
                </div>
              ) : (
                <>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-lg bg-card border border-card-border">
                    <EnglishText as="p" className="text-left leading-relaxed">
                      {m.content}
                    </EnglishText>
                  </div>
                  <SayloAvatar expression="idle" gender={teacherGender} size={28} className="shrink-0" />
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {voiceMode ? (
        <div className="pt-2 border-t border-card-border">
          <VoiceConversationPanel
            onSend={sendMessage}
            onExit={() => setVoiceMode(false)}
            onEnd={handleEnd}
            ending={ending}
            canEnd={hasUserMessage}
          />
        </div>
      ) : (
        <div className="flex gap-2 pt-2 border-t border-card-border">
          <input
            type="text"
            dir="ltr"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={sending}
            placeholder="Type in English..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
          />
          <motion.button
            whileHover={input.trim() && !sending ? { scale: 1.05 } : undefined}
            whileTap={input.trim() && !sending ? { scale: 0.95 } : undefined}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
          >
            שליחה
          </motion.button>
        </div>
      )}
    </div>
  );
}

function ScoreTile({
  label,
  value,
  highlight,
  delay = 0,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, type: "spring", bounce: 0.4 }}
      className={`rounded-lg p-4 text-center ${highlight ? "bg-primary text-primary-ink" : "bg-card border border-card-border"}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs mt-1 ${highlight ? "opacity-90" : "text-muted"}`}>{label}</p>
    </motion.div>
  );
}

function FeedbackList({ title, items, english }: { title: string; items: string[]; english?: boolean }) {
  return (
    <div className="mt-4 bg-card border border-card-border rounded-lg p-6">
      <p className="font-bold">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm">
            {english ? <EnglishText>{item}</EnglishText> : item}
          </li>
        ))}
      </ul>
    </div>
  );
}
