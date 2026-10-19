"use client";

import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Phone } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MixedText from "@/components/MixedText";
import MotionLink from "@/components/MotionLink";
import PremiumGate from "@/components/PremiumGate";
import ParentalConsentGuard from "@/components/ParentalConsentGuard";
import AiConsentGate from "@/components/AiConsentGate";
import VoiceConversationPanel from "@/components/VoiceConversationPanel";
import SayloAvatar from "@/components/SayloAvatar";
import ChatMessageText from "@/components/speaking/ChatMessageText";
import CorrectionCard from "@/components/speaking/CorrectionCard";
import CorrectionsPractice from "@/components/speaking/CorrectionsPractice";
import { ReplyIdeasButton, ReplyIdeasList, useReplyIdeas } from "@/components/speaking/ReplyIdeas";
import { WordCard, useWordLookup } from "@/components/speaking/WordLookup";
import ConversationPhrases from "@/components/speaking/ConversationPhrases";
import type { UsefulPhrase } from "@/lib/ai/prompts/usefulPhrases";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { tidyStreaming } from "@/lib/ai/conversationFix";
import { DAILY_LIMIT_ERROR } from "@/lib/ai/dailyLimit";
import { MAX_MESSAGE_CHARS } from "@/lib/ai/conversationHistory";
import { loadVoicePref, type VoicePref } from "@/lib/speech/voicePref";
import type { ConversationMessage, ConversationScore } from "@/types/database";

import { EASE_OUT } from "@/lib/motion/easing";

const TAP_HINT_KEY = "saylo.wordTapHintSeen";
// One shared empty list, so the phrases section's effect doesn't rerun on
// every render of an older summary that has none.
const NO_PHRASES: UsefulPhrase[] = [];
export default function SpeakingChatPage() {
  return (
    <PremiumGate featureName="שיחה עם מורה AI" requirePaid>
      <ParentalConsentGuard title="שיחה עם מורה AI">
        <AiConsentGate declineHref="/speaking">
          <SpeakingChatInner />
        </AiConsentGate>
      </ParentalConsentGuard>
    </PremiumGate>
  );
}

function SpeakingChatInner() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const searchParams = useSearchParams();
  const startInVoiceMode = searchParams.get("mode") === "voice";
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[] | null>(null);
  // A conversation starter picked on /speaking arrives pre-filled; the
  // learner sends (or edits) it themselves.
  const [input, setInput] = useState(() => searchParams.get("starter") ?? "");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [voiceMode, setVoiceMode] = useState(startInVoiceMode);
  const [score, setScore] = useState<ConversationScore | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [teacherGender] = useState<VoicePref>(() => loadVoicePref());
  const [sendError, setSendError] = useState(false);
  // Today's cap on teacher replies was reached (lib/ai/dailyLimit).
  const [limitReached, setLimitReached] = useState(false);
  // The bubble a reply streamed into keeps its key once the stored message
  // replaces it, so it isn't animated in a second time.
  const [streamKey, setStreamKey] = useState<{ id: string; key: string } | null>(null);
  // A conversation that was already ended (opened again from history or
  // the back button) can't take new messages: show it closed, with its
  // summary when there is one, instead of an input that silently fails.
  const [closed, setClosed] = useState(false);
  // The teacher opens an empty conversation (unless the learner arrived
  // with a starter to send). Asked once; until it lands, a "the teacher is
  // starting" line shows, and the learner can still type first.
  const [openerDone, setOpenerDone] = useState(false);
  const openerAskedRef = useRef(false);
  const awaitingOpener =
    messages !== null && messages.length === 0 && !closed && !searchParams.get("starter") && !openerDone;
  useEffect(() => {
    if (!awaitingOpener || openerAskedRef.current) return;
    openerAskedRef.current = true;
    fetch("/api/ai/conversation-opener", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, voiceMode: startInVoiceMode }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data: { opener: string | null } | null) => {
        if (!data?.opener) return;
        const { data: rows } = await supabase
          .from("conversation_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at");
        if (rows) setMessages(rows);
      })
      .catch(() => {})
      .finally(() => setOpenerDone(true));
  }, [awaitingOpener, conversationId, startInVoiceMode]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Reply ideas belong to the teacher's latest turn (or to the empty
  // conversation, for an opener); never while the learner's message is
  // still on its way.
  const lastMessage = messages?.[messages.length - 1];
  const ideasTurn =
    messages === null || sending || closed
      ? null
      : !lastMessage
        ? "start"
        : lastMessage.role === "assistant"
          ? lastMessage.id
          : null;
  const replyIdeas = useReplyIdeas(conversationId, ideasTurn);
  const wordLookup = useWordLookup();
  const hasTeacherMessage = !!messages?.some((m) => m.role === "assistant");
  // The "tap a word" hint shows until the learner has tapped one once.
  const [tapHintSeen, setTapHintSeen] = useState(() => {
    try {
      return localStorage.getItem(TAP_HINT_KEY) === "1";
    } catch {
      return false;
    }
  });
  const lookUpWord = (word: string, sentence: string) => {
    wordLookup.lookup(word, sentence);
    if (tapHintSeen) return;
    setTapHintSeen(true);
    try {
      localStorage.setItem(TAP_HINT_KEY, "1");
    } catch {
      // Private mode: the hint just shows again next time.
    }
  };

  useEffect(() => {
    supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at")
      .then(({ data }) => setMessages(data ?? []));
    supabase
      .from("conversations")
      .select("status")
      .eq("id", conversationId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data || data.status === "active") return;
        setClosed(true);
        const { data: saved } = await supabase
          .from("conversation_scores")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (saved) setScore(saved as ConversationScore);
      });
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim() || !profile) return null;

      const tempId = `temp-${Date.now()}`;
      setSendError(false);
      setMessages((prev) => [
        ...(prev ?? []),
        { id: tempId, conversation_id: conversationId, role: "user", content: text, created_at: new Date().toISOString() },
      ]);

      const streamId = `stream-${Date.now()}`;
      try {
        const res = await fetch("/api/ai/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // In the chat the reply streams in as it is written; a call needs
          // it whole, to read it aloud.
          body: JSON.stringify({ conversationId, message: text, voiceMode, stream: !voiceMode }),
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: null }));
          if (error === "conversation already completed") setClosed(true);
          if (error === DAILY_LIMIT_ERROR) setLimitReached(true);
          throw new Error("failed");
        }
        let reply = "";
        if (res.body && (res.headers.get("content-type") ?? "").startsWith("text/plain")) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let raw = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            raw += decoder.decode(value, { stream: true });
            reply = tidyStreaming(raw);
            const bubble: ConversationMessage = {
              id: streamId,
              conversation_id: conversationId,
              role: "assistant",
              content: reply,
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...(prev ?? []).filter((m) => m.id !== streamId), bubble]);
          }
        } else {
          ({ reply } = await res.json());
        }
        // The stored reply (with its correction card) replaces the streamed
        // one, keeping the streamed bubble's key so it doesn't animate in twice.
        const { data } = await supabase
          .from("conversation_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at");
        const last = data?.[data.length - 1];
        if (last?.role === "assistant") setStreamKey({ id: last.id, key: streamId });
        setMessages(data ?? []);
        if (!reply || last?.role !== "assistant") {
          // The message went through but no reply came back.
          setSendError(true);
          return null;
        }
        return reply;
      } catch {
        // Take the unsent message back out so the screen doesn't pretend
        // it went through.
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== tempId));
        setSendError(true);
        return null;
      }
    },
    [conversationId, profile, voiceMode]
  );

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const reply = await sendMessage(text);
    // Give the text back so nothing typed is lost.
    if (reply === null) setInput(text);
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3, ease: EASE_OUT }}
          className="mt-6 bg-card border border-card-border rounded-lg p-6"
        >
          <p className="leading-relaxed">
            <MixedText>{score.feedback.generalSuggestionsHe}</MixedText>
          </p>
        </motion.div>

        {/* The corrections the teacher made during the call, as a short
            rewrite drill: the moment the fix actually sticks. */}
        <CorrectionsPractice
          fixes={(messages ?? []).flatMap((m) => (m.role === "assistant" && m.correction ? [m.correction] : []))}
        />

        {score.feedback.grammarMistakes.length > 0 && (
          <FeedbackList title="טעויות דקדוק שכדאי לשים לב אליהן" items={score.feedback.grammarMistakes} />
        )}
        {score.feedback.overusedWords.length > 0 && (
          <FeedbackList title="מילים שחזרו יותר מדי" items={score.feedback.overusedWords} english />
        )}
        <ConversationPhrases conversationId={conversationId} phrases={score.feedback.usefulPhrases ?? NO_PHRASES} />

        {/* Older summaries, saved before the phrases above existed, keep
            their plain word list. */}
        {!score.feedback.usefulPhrases?.length && score.feedback.suggestedVocabulary.length > 0 && (
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
                  transition={{ duration: 0.25, ease: EASE_OUT }}
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
                          <ChatMessageText text={m.content} />
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
  const lastUserIndex = messages ? messages.map((m) => m.role).lastIndexOf("user") : -1;
  const lastUser = lastUserIndex >= 0 ? messages![lastUserIndex] : null;
  const lastUserFix = lastUserIndex >= 0 ? (messages![lastUserIndex + 1]?.correction ?? null) : null;

  return (
    // The page layout keeps room under every page for the floating help and
    // accessibility buttons (main's pb-20 / sm:pb-28); the chat stops above
    // it, so the page itself never scrolls and those buttons never cover
    // the send button.
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col h-[calc(100dvh-var(--navbar-h,6rem)-env(safe-area-inset-bottom)-5rem)] sm:h-[calc(100dvh-var(--navbar-h,6rem)-env(safe-area-inset-bottom)-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <MotionLink
          whileTap={{ scale: 0.97 }}
          href={startInVoiceMode ? "/speaking/voice" : "/speaking"}
          className="text-sm text-primary"
        >
          ← לתרחישים
        </MotionLink>
        <div className="flex items-center gap-2">
          {!voiceMode && !closed && (
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
            disabled={ending || !hasUserMessage || closed}
            className="text-sm px-4 py-2 rounded-lg border border-card-border hover:bg-background-2 transition-colors disabled:opacity-40"
          >
            {ending ? "מנתח..." : "סיימו שיחה"}
          </motion.button>
        </div>
      </div>

      {/* On a call the panel shows the latest exchange as captions, so the
          scrolling transcript would only push the teacher off the screen. */}
      <div className={`flex-1 overflow-y-auto space-y-3 pb-4 ${voiceMode ? "hidden" : ""}`}>
        {messages === null && <p className="text-center text-muted">טוען...</p>}
        <AnimatePresence initial={false}>
          {messages?.map((m, i) => (
            <motion.div
              key={streamKey?.id === m.id ? streamKey.key : m.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className={`flex items-end gap-2 ${m.role === "user" ? "justify-start" : "justify-end"}`}
            >
              {m.role === "user" ? (
                <div className="flex max-w-[80%] flex-col items-start">
                  <div className="px-4 py-2.5 rounded-lg bg-primary text-primary-ink">
                    <ChatMessageText text={m.content} />
                  </div>
                  {/* The teacher's reply right after this message carries its correction. */}
                  {messages[i + 1]?.role === "assistant" && messages[i + 1].correction && (
                    <CorrectionCard fix={messages[i + 1].correction!} />
                  )}
                </div>
              ) : (
                <>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-lg bg-card border border-card-border">
                    <ChatMessageText text={m.content} onTapWord={lookUpWord} />
                  </div>
                  <SayloAvatar expression="idle" gender={teacherGender} size={28} className="shrink-0" />
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && !voiceMode && messages?.[messages.length - 1]?.role === "user" && (
          <div className="flex items-end justify-end gap-2" aria-live="polite">
            <p className="px-4 py-2.5 rounded-lg bg-card border border-card-border text-sm text-muted animate-pulse">
              {teacherGender === "female" ? "המורה כותבת..." : "המורה כותב..."}
            </p>
            <SayloAvatar expression="thinking" gender={teacherGender} size={28} className="shrink-0" />
          </div>
        )}
        {awaitingOpener && (
          <div className="flex items-end justify-end gap-2" aria-live="polite">
            <p className="px-4 py-2.5 rounded-lg bg-card border border-card-border text-sm text-muted animate-pulse">
              {teacherGender === "female" ? "המורה מתחילה את השיחה..." : "המורה מתחיל את השיחה..."}
            </p>
            <SayloAvatar expression="thinking" gender={teacherGender} size={28} className="shrink-0" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && !closed && (
        <p role="alert" className="pb-2 text-center text-sm text-danger">
          {limitReached
            ? "הגעתם למכסה היומית של שיחות עם המורה. אפשר להמשיך מחר."
            : "ההודעה לא נשלחה. בדקו את החיבור ונסו שוב."}
        </p>
      )}

      {closed ? (
        <div className="border-t border-card-border pt-4 text-center">
          <p className="text-sm text-muted">השיחה הזו כבר הסתיימה.</p>
          <MotionLink
            whileTap={{ scale: 0.97 }}
            href={startInVoiceMode ? "/speaking/voice" : "/speaking"}
            className="mt-3 inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
          >
            לשיחה חדשה
          </MotionLink>
        </div>
      ) : voiceMode ? (
        <div className="flex-1 min-h-0">
          <VoiceConversationPanel
            onSend={sendMessage}
            onExit={() => setVoiceMode(false)}
            onEnd={handleEnd}
            ending={ending}
            canEnd={hasUserMessage}
            lastUserText={lastUser?.content ?? null}
            lastFix={lastUserFix}
            openingLine={!hasUserMessage && messages?.[0]?.role === "assistant" ? messages[0].content : null}
            conversationId={conversationId}
          />
        </div>
      ) : (
        <div className="pt-2 border-t border-card-border">
          {wordLookup.state ? (
            <div className="mb-2">
              <WordCard state={wordLookup.state} onAdd={wordLookup.addToMyWords} onClose={wordLookup.close} />
            </div>
          ) : (
            hasTeacherMessage &&
            !tapHintSeen &&
            !replyIdeas.ideas && <p className="mb-1.5 text-xs text-muted">הקישו על מילה בהודעה של המורה כדי לראות מה היא אומרת.</p>
          )}
          {replyIdeas.ideas && (
            <div className="mb-2 max-h-56 overflow-y-auto">
              <ReplyIdeasList
                ideas={replyIdeas.ideas}
                hint="הקישו על רעיון כדי להתחיל ממנו, ושנו אותו כך שיתאים לכם"
                onClose={replyIdeas.dismiss}
                onPick={(en) => {
                  setInput(en);
                  replyIdeas.dismiss();
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}
          {replyIdeas.failed && <p className="mb-2 text-center text-sm text-muted">לא הצלחנו להביא רעיונות כרגע. נסו שוב.</p>}
          {replyIdeas.available && !replyIdeas.ideas && (
            <ReplyIdeasButton onClick={replyIdeas.request} loading={replyIdeas.loading} className="mb-2 px-3 py-1.5" />
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              {...ENGLISH_TEXT_INPUT}
              // Hebrew is welcome too ("איך אומרים...?"), so the field follows
              // whatever is typed instead of being fixed left to right.
              dir="auto"
              lang={undefined}
              enterKeyHint="send"
            maxLength={MAX_MESSAGE_CHARS}
              aria-label="הקלידו הודעה באנגלית, או שאלה בעברית"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
              placeholder="באנגלית, או שאלה בעברית"
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
      transition={{ duration: 0.35, delay, type: "spring", bounce: 0.2 }}
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
            {english ? <EnglishText>{item}</EnglishText> : <MixedText>{item}</MixedText>}
          </li>
        ))}
      </ul>
    </div>
  );
}
