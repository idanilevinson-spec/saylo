"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import VoiceConversationPanel from "@/components/VoiceConversationPanel";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { ConversationMessage, ConversationScore } from "@/types/database";

export default function SpeakingChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [score, setScore] = useState<ConversationScore | null>(null);
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
          className="mt-6 bg-card border border-card-border rounded-2xl p-6"
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

        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href="/speaking"
          className="mt-6 block text-center px-5 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          לשיחה נוספת
        </MotionLink>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <MotionLink whileTap={{ scale: 0.97 }} href="/speaking" className="text-sm text-primary">
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
            disabled={ending || !messages?.some((m) => m.role === "user")}
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
              className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  m.role === "user" ? "bg-primary text-primary-ink" : "bg-card border border-card-border"
                }`}
              >
                <EnglishText as="p" className="text-left leading-relaxed">
                  {m.content}
                </EnglishText>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {voiceMode ? (
        <div className="pt-2 border-t border-card-border">
          <VoiceConversationPanel onSend={sendMessage} onExit={() => setVoiceMode(false)} />
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
            className="flex-1 px-4 py-2.5 rounded-xl border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
          />
          <motion.button
            whileHover={input.trim() && !sending ? { scale: 1.05 } : undefined}
            whileTap={input.trim() && !sending ? { scale: 0.95 } : undefined}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
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
      className={`rounded-2xl p-4 text-center ${highlight ? "bg-primary text-primary-ink" : "bg-card border border-card-border"}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs mt-1 ${highlight ? "opacity-90" : "text-muted"}`}>{label}</p>
    </motion.div>
  );
}

function FeedbackList({ title, items, english }: { title: string; items: string[]; english?: boolean }) {
  return (
    <div className="mt-4 bg-card border border-card-border rounded-2xl p-6">
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
