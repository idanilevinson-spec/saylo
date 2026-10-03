"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import { Capacitor } from "@capacitor/core";
import { LifeBuoy, X, ArrowUp, Square, RotateCcw, ThumbsUp, ThumbsDown, UserRound, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { SUPPORT_MAX_MESSAGE_LENGTH, type SupportTopic } from "@/lib/support/topics";
import SupportCallbackForm from "./SupportCallbackForm";
import {
  OPEN_SUPPORT_EVENT,
  readChat,
  readConsent,
  readEventStream,
  saveChat,
  saveConsent,
  visitorToken,
  type ChatMessage,
} from "./supportClient";

// Pages where the floating button would get in the way rather than help:
// the owner's own back-office.
const HIDDEN_PREFIXES = ["/admin"];

const ERROR_TEXT: Record<string, string> = {
  rate_limited: "הגעתם למספר ההודעות המרבי להיום. אפשר להשאיר פרטים ונחזור אליכם, או לכתוב לנו במייל.",
  conversation_limit: "השיחה הזו ארוכה מדי. אפשר להתחיל שיחה חדשה, או להשאיר פרטים ונחזור אליכם.",
  busy: "העוזר עמוס כרגע. נסו שוב בעוד רגע, או השאירו פרטים ונחזור אליכם.",
  offline: "אין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.",
  failed: "משהו השתבש בתשובה. נסו שוב, או השאירו פרטים ונחזור אליכם.",
};

// Starting points that match where the person is, so the first tap is
// already a real question. Plain wording a person would actually type.
function suggestionsFor(pathname: string, signedIn: boolean): string[] {
  if (pathname.startsWith("/pricing")) {
    return ["מה ההבדל בין המסלולים?", "אפשר לבטל מתי שרוצים?", "מה כלול בתקופת הניסיון?"];
  }
  if (pathname.startsWith("/profile")) {
    return ["איך מבטלים את המנוי?", "איך מכבים את המיילים?", "איך מוחקים את החשבון?"];
  }
  if (pathname.startsWith("/speaking")) {
    return ["למה השיחה עם המורה לא זמינה לי?", "המיקרופון לא עובד", "יש מגבלה על מספר השיחות?"];
  }
  if (!signedIn) {
    return ["מה זה Saylo?", "כמה זה עולה?", "זה מתאים גם לילדים?"];
  }
  return ["מה מצב המנוי שלי?", "למה אין לי לבבות?", "אפשר לדבר עם מישהו מהצוות?"];
}

function localId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function SupportChat() {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  if (loading || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  // Keyed by account: signing in or out starts a fresh chat, since the
  // server ties each conversation to one owner.
  const userId = session?.user.id ?? null;
  return <SupportChatPanel key={userId ?? "visitor"} userId={userId} userEmail={session?.user.email ?? ""} pathname={pathname} />;
}

interface PanelProps {
  userId: string | null;
  userEmail: string;
  pathname: string;
}

function SupportChatPanel({ userId, userEmail, pathname }: PanelProps) {
  const owner = userId ?? "visitor";
  const [open, setOpen] = useState(false);
  const [consented, setConsented] = useState(readConsent);
  const [chat, setChat] = useState(() => readChat(owner));
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The form opened by hand ("לדבר עם אדם"), not by the assistant.
  const [manualForm, setManualForm] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef(true);

  const { messages, conversationId } = chat;

  useEffect(() => {
    saveChat(owner, chat.messages.length ? chat : null);
  }, [owner, chat]);

  // Other parts of the site can open the widget (the /support page's
  // "talk to us" button), optionally straight to the contact form.
  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<{ form?: boolean }>).detail;
      setOpen(true);
      if (detail?.form) setManualForm(true);
    }
    window.addEventListener(OPEN_SUPPORT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SUPPORT_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Escape closes from anywhere inside the panel; on phones the panel is
  // full-screen, so the page behind it must not scroll underneath.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const small = window.matchMedia("(max-width: 639px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (small) document.body.style.overflow = "hidden";
    // On a phone, focusing the input opens the keyboard over half the
    // screen before the person has seen the suggestions; let them tap in.
    const focusTimer = small ? undefined : window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, close]);

  // iOS (Safari and the app's WebView alike) shrinks only the *visual*
  // viewport when the keyboard opens; a full-screen fixed panel keeps the
  // full height, so its header and messages slide up off-screen and the
  // input floats over nothing. On phones, pin the panel to the visual
  // viewport instead: its height and offset follow the keyboard. Written
  // straight to the element (not state) because it fires on every frame of
  // the keyboard animation.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!open || !viewport || !window.matchMedia("(max-width: 639px)").matches) return;
    function fit() {
      const panel = panelRef.current;
      if (!panel || !viewport) return;
      panel.style.height = `${viewport.height}px`;
      panel.style.transform = `translateY(${viewport.offsetTop}px)`;
      // With the keyboard up, the home-indicator inset sits under the
      // keyboard, so padding for it would leave a gap above the keys.
      const keyboardOpen = window.innerHeight - viewport.height > 120;
      panel.style.paddingBottom = keyboardOpen ? "0px" : "env(safe-area-inset-bottom)";
      const list = listRef.current;
      if (list && stickToBottomRef.current) list.scrollTop = list.scrollHeight;
    }
    fit();
    viewport.addEventListener("resize", fit);
    viewport.addEventListener("scroll", fit);
    return () => {
      viewport.removeEventListener("resize", fit);
      viewport.removeEventListener("scroll", fit);
    };
  }, [open]);

  // Follow the answer as it streams, unless the person scrolled up to
  // re-read something — then leave them where they are.
  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottomRef.current) list.scrollTop = list.scrollHeight;
  }, [messages, manualForm, error]);

  function onScroll() {
    const list = listRef.current;
    if (!list) return;
    stickToBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
  }

  function updateLast(update: (m: ChatMessage) => ChatMessage) {
    setChat((c) => {
      const next = [...c.messages];
      next[next.length - 1] = update(next[next.length - 1]);
      return { ...c, messages: next };
    });
  }

  async function send(text: string) {
    const message = text.trim().slice(0, SUPPORT_MAX_MESSAGE_LENGTH);
    if (!message || streaming) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("offline");
      return;
    }

    setError(null);
    setInput("");
    setStreaming(true);
    stickToBottomRef.current = true;
    setChat((c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: localId(), role: "user", content: message },
        { id: localId(), role: "assistant", content: "", status: "streaming" },
      ],
    }));

    const controller = new AbortController();
    abortRef.current = controller;
    let failure: string | null = null;
    let finalText = "";

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          visitorToken: visitorToken(),
          message,
          pagePath: pathname,
          isNativeApp: Capacitor.isNativePlatform(),
          consent: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        failure = data.error && ERROR_TEXT[data.error] ? data.error : "failed";
      } else {
        await readEventStream(res.body, (event) => {
          switch (event.type) {
            case "conversation":
              setChat((c) => ({ ...c, conversationId: event.id }));
              break;
            case "text":
              finalText += event.delta;
              updateLast((m) => ({ ...m, content: m.content + event.delta, activity: null }));
              break;
            case "status":
              updateLast((m) => ({ ...m, activity: event.label }));
              break;
            case "callback_form":
              updateLast((m) => ({ ...m, formTopic: event.topic }));
              break;
            case "replace":
              finalText = event.text;
              updateLast((m) => ({ ...m, content: event.text }));
              break;
            case "done":
              updateLast((m) => ({ ...m, status: "done", activity: null, serverId: event.messageId }));
              break;
            case "error":
              failure = event.code in ERROR_TEXT ? event.code : "failed";
              break;
          }
        });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateLast((m) => ({ ...m, status: "done", activity: null }));
      } else {
        failure = navigator.onLine ? "failed" : "offline";
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }

    if (failure) {
      setError(failure);
      // A failed answer with nothing in it is just noise; drop it. A partial
      // one stays, marked as cut off.
      setChat((c) => {
        const last = c.messages[c.messages.length - 1];
        if (last?.role === "assistant" && !last.content) return { ...c, messages: c.messages.slice(0, -1) };
        return { ...c, messages: [...c.messages.slice(0, -1), { ...last, status: "error", activity: null }] };
      });
    } else if (finalText) {
      // Streaming text is not announced token by token (that would flood a
      // screen reader); the finished answer is announced once.
      setAnnouncement(finalText);
    }
  }

  function retry() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    // Remove the question being retried so it isn't shown twice.
    setChat((c) => {
      const index = c.messages.lastIndexOf(lastUser);
      return { ...c, messages: c.messages.slice(0, index) };
    });
    void send(lastUser.content);
  }

  function newChat() {
    abortRef.current?.abort();
    setChat({ conversationId: null, messages: [] });
    setError(null);
    setManualForm(false);
    inputRef.current?.focus();
  }

  async function rate(message: ChatMessage, rating: 1 | -1) {
    if (!message.serverId) return;
    const next = message.rating === rating ? null : rating;
    setChat((c) => ({ ...c, messages: c.messages.map((m) => (m.id === message.id ? { ...m, rating: next } : m)) }));
    await fetch("/api/support/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: message.serverId, visitorToken: visitorToken(), rating: next }),
    }).catch(() => undefined);
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const formProps = {
    conversationId,
    visitorToken: typeof window === "undefined" ? "" : visitorToken(),
    initialMessage: lastUserMessage,
    defaultEmail: userEmail,
    pagePath: pathname,
  };
  const formAlreadyShown = messages.some((m) => m.formTopic);

  const markdownComponents: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith("/")) {
        return (
          <Link
            href={href}
            onClick={() => {
              // On a phone the panel covers the page the link opens.
              if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
            }}
            className="text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary"
          >
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
    ul: ({ children }) => <ul className="mt-2 list-disc ps-5 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mt-2 list-decimal ps-5 space-y-1">{children}</ol>,
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="support-panel"
        aria-haspopup="dialog"
        className={`fixed bottom-4 end-20 z-[58] h-12 ps-3.5 pe-4 rounded-lg bg-card text-foreground border border-card-border shadow-lg flex items-center gap-2 text-sm font-medium hover:border-primary/60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          open ? "max-sm:hidden" : ""
        }`}
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        {open ? <X size={18} aria-hidden="true" /> : <LifeBuoy size={18} className="text-primary" aria-hidden="true" />}
        <span>{open ? "סגירה" : "עזרה"}</span>
      </button>

      {open && (
        <section
          ref={panelRef}
          id="support-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="support-title"
          // z-[61]: above the accessibility button (z-60), which otherwise
          // sits on top of the send button on a full-screen phone panel.
          className="fixed z-[61] inset-x-0 top-0 h-[100dvh] sm:inset-auto sm:top-auto sm:bottom-20 sm:end-4 sm:w-[25rem] sm:h-[min(40rem,calc(100dvh-7rem))] flex flex-col bg-card sm:border sm:border-card-border sm:rounded-lg shadow-2xl overflow-hidden"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary sm:rounded-t-lg" />

          <header className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-card-border">
            <div className="min-w-0 flex-1">
              <h2 id="support-title" className="font-bold leading-tight">
                עזרה ותמיכה
              </h2>
              <p className="text-xs text-muted mt-0.5">עוזר אוטומטי, וצוות אמיתי כשצריך</p>
            </div>
            {consented && (
              <button
                type="button"
                onClick={() => setManualForm(true)}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-background-2 transition-colors"
              >
                <UserRound size={14} aria-hidden="true" />
                לדבר עם אדם
              </button>
            )}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={newChat}
                aria-label="שיחה חדשה"
                title="שיחה חדשה"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-background-2 transition-colors"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="סגירת חלון העזרה"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-background-2 transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          {!consented ? (
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary shrink-0" aria-hidden="true" />
                <h3 className="font-bold">לפני שמתחילים</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                <li>
                  העוזר הוא מערכת AI אוטומטית, שמופעלת על ידי <strong>Anthropic</strong>. ההודעות שתכתבו כאן נשלחות אליה כדי
                  לענות.
                </li>
                {userId && (
                  <li>כדי לענות על שאלות על החשבון, העוזר יכול לבדוק את מצב המנוי והתרגול שלכם. לא נשלחים אליו האימייל או הכינוי.</li>
                )}
                <li>השיחה נשמרת אצלנו עד 90 יום, כדי לטפל בפניות ולשפר את התשובות.</li>
                <li>אל תכתבו כאן סיסמה, מספר כרטיס אשראי או מספר תעודת זהות.</li>
                <li>תשובות אוטומטיות עלולות לטעות. בכל שלב אפשר לבקש שמישהו מהצוות יחזור אליכם.</li>
              </ul>
              <p className="mt-3 text-xs text-muted">
                פרטים ב
                <Link href="/privacy#support" className="text-primary hover:underline">
                  מדיניות הפרטיות
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={() => {
                  saveConsent();
                  setConsented(true);
                  window.setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="mt-5 w-full py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
              >
                הבנתי, אפשר להתחיל
              </button>
              <button
                type="button"
                onClick={() => {
                  setConsented(true);
                  setManualForm(true);
                }}
                className="mt-2 w-full py-2 text-sm text-muted hover:text-foreground"
              >
                מעדיפים בלי AI? השאירו פרטים ונחזור אליכם
              </button>
            </div>
          ) : (
            <>
              <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                {messages.length === 0 && !manualForm && (
                  <div>
                    <p className="text-sm leading-relaxed">
                      שלום. אפשר לשאול כאן על המנוי, החשבון, תקלות או כל דבר אחר ב-Saylo.
                    </p>
                    <div className="mt-3 flex flex-col items-start gap-1.5">
                      {suggestionsFor(pathname, !!userId).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="text-start text-sm px-3 py-1.5 rounded-lg border border-card-border hover:border-primary/60 hover:bg-background-2 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, index) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex justify-start">
                      <p className="max-w-[85%] px-3 py-2 rounded-lg bg-primary text-primary-ink text-sm leading-relaxed whitespace-pre-wrap break-words [unicode-bidi:plaintext]">
                        <span className="sr-only">אתם: </span>
                        {m.content}
                      </p>
                    </div>
                  ) : (
                    <div key={m.id} className="text-sm leading-relaxed">
                      <span className="sr-only">העוזר: </span>
                      {m.content ? (
                        <div className="break-words [unicode-bidi:plaintext]">
                          <ReactMarkdown components={markdownComponents} skipHtml allowedElements={["p", "a", "strong", "em", "ul", "ol", "li", "br", "code"]} unwrapDisallowed>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      ) : null}
                      {m.status === "streaming" && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                          {m.activity ?? (m.content ? "כותב…" : "חושב…")}
                        </p>
                      )}
                      {m.status === "error" && m.content && <p className="mt-1 text-xs text-muted">(התשובה נקטעה)</p>}
                      {m.formTopic && (
                        <SupportCallbackForm {...formProps} initialTopic={m.formTopic} />
                      )}
                      {m.status === "done" && m.serverId && m.content && (
                        <div className="mt-1.5 flex items-center gap-0.5 text-muted">
                          <span className="sr-only">האם התשובה עזרה?</span>
                          <button
                            type="button"
                            onClick={() => rate(m, 1)}
                            aria-label="התשובה עזרה"
                            aria-pressed={m.rating === 1}
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-background-2 hover:text-foreground transition-colors ${m.rating === 1 ? "text-success" : ""}`}
                          >
                            <ThumbsUp size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rate(m, -1)}
                            aria-label="התשובה לא עזרה"
                            aria-pressed={m.rating === -1}
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-background-2 hover:text-foreground transition-colors ${m.rating === -1 ? "text-danger" : ""}`}
                          >
                            <ThumbsDown size={13} aria-hidden="true" />
                          </button>
                          {m.rating === -1 && index === messages.length - 1 && !formAlreadyShown && !manualForm && (
                            <button
                              type="button"
                              onClick={() => setManualForm(true)}
                              className="ms-2 text-xs text-primary hover:underline"
                            >
                              להשאיר פרטים ושנחזור אליכם?
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {error && (
                  <div role="alert" className="rounded-lg border border-card-border bg-background p-3 text-sm">
                    <p>{ERROR_TEXT[error] ?? ERROR_TEXT.failed}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {error === "conversation_limit" ? (
                        <button type="button" onClick={newChat} className="text-primary hover:underline">
                          שיחה חדשה
                        </button>
                      ) : error !== "rate_limited" ? (
                        <button type="button" onClick={retry} className="text-primary hover:underline">
                          לנסות שוב
                        </button>
                      ) : null}
                      <button type="button" onClick={() => setManualForm(true)} className="text-primary hover:underline">
                        להשאיר פרטים
                      </button>
                    </div>
                  </div>
                )}

                {manualForm && (
                  <SupportCallbackForm
                    {...formProps}
                    initialTopic={"other" satisfies SupportTopic}
                    onCancel={() => setManualForm(false)}
                  />
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="border-t border-card-border p-3"
              >
                <div className="flex items-end gap-2">
                  <label htmlFor="support-input" className="sr-only">
                    ההודעה שלכם
                  </label>
                  <textarea
                    id="support-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, SUPPORT_MAX_MESSAGE_LENGTH))}
                    onKeyDown={(e) => {
                      // Enter sends, Shift+Enter is a new line — except while
                      // composing with an IME, where Enter confirms a word.
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void send(input);
                      }
                    }}
                    rows={1}
                    placeholder="כתבו שאלה…"
                    className="flex-1 max-h-32 min-h-10 px-3 py-2 rounded-lg border border-card-border bg-background text-base sm:text-sm resize-none [field-sizing:content] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 [unicode-bidi:plaintext]"
                  />
                  {streaming ? (
                    <button
                      type="button"
                      onClick={() => abortRef.current?.abort()}
                      aria-label="עצירת התשובה"
                      className="shrink-0 w-10 h-10 rounded-lg border border-card-border flex items-center justify-center hover:bg-background-2 transition-colors"
                    >
                      <Square size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="שליחה"
                      className="shrink-0 w-10 h-10 rounded-lg bg-primary text-primary-ink flex items-center justify-center hover:bg-primary-hover disabled:opacity-40 transition-colors"
                    >
                      <ArrowUp size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
                {input.length > SUPPORT_MAX_MESSAGE_LENGTH - 150 && (
                  <p className="mt-1 text-xs text-muted" aria-live="polite">
                    {SUPPORT_MAX_MESSAGE_LENGTH - input.length} תווים נותרו
                  </p>
                )}
              </form>
            </>
          )}

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </section>
      )}
    </>
  );
}
