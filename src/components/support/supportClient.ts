import type { SupportTopic } from "@/lib/support/topics";

// Browser-side plumbing for the support widget: what it keeps between page
// loads, and how it reads the chat route's event stream.

export interface ChatMessage {
  // Local id for React keys; serverId is the stored message (for ratings).
  id: string;
  role: "user" | "assistant";
  content: string;
  serverId?: string | null;
  rating?: 1 | -1 | null;
  status?: "streaming" | "done" | "error";
  // Set while a tool runs, e.g. "בודק את פרטי החשבון…".
  activity?: string | null;
  // The assistant opened the contact form under this answer.
  formTopic?: SupportTopic | null;
}

export interface StoredChat {
  conversationId: string | null;
  messages: ChatMessage[];
}

const CONSENT_KEY = "saylo-support-consent";
const TOKEN_KEY = "saylo-support-token";
const chatKey = (owner: string) => `saylo-support-chat:${owner}`;

// Storage can throw (private mode, blocked site data); the widget must keep
// working without it, just without remembering anything.
function safeGet(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    // Not remembered; nothing else to do.
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

export function readConsent(): boolean {
  if (typeof window === "undefined") return false;
  return safeGet(local, CONSENT_KEY) !== null;
}

export function saveConsent() {
  safeSet(local, CONSENT_KEY, new Date().toISOString());
}

// A random per-tab token that owns a signed-out visitor's conversation.
// Kept for the session only: closing the tab ends the chat's ownership.
export function visitorToken(): string {
  const existing = safeGet(session, TOKEN_KEY);
  if (existing) return existing;
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  safeSet(session, TOKEN_KEY, token);
  return token;
}

export function readChat(owner: string): StoredChat {
  const empty: StoredChat = { conversationId: null, messages: [] };
  if (typeof window === "undefined") return empty;
  const raw = safeGet(session, chatKey(owner));
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as StoredChat;
    // An answer that was still streaming when the page unloaded will never
    // finish; show it as interrupted rather than forever "typing".
    return {
      conversationId: parsed.conversationId ?? null,
      messages: (parsed.messages ?? []).map((m) =>
        m.status === "streaming" ? { ...m, status: "error", activity: null } : m
      ),
    };
  } catch {
    return empty;
  }
}

export function saveChat(owner: string, chat: StoredChat | null) {
  safeSet(session, chatKey(owner), chat ? JSON.stringify(chat) : null);
}

export type ChatEvent =
  | { type: "conversation"; id: string }
  | { type: "text"; delta: string }
  | { type: "status"; label: string }
  | { type: "callback_form"; topic: SupportTopic }
  | { type: "replace"; text: string }
  | { type: "done"; messageId: string | null }
  | { type: "error"; code: string };

// Reads the newline-delimited JSON stream, calling onEvent per line as it
// arrives. A line split across two network chunks is held until complete.
export async function readEventStream(body: ReadableStream<Uint8Array>, onEvent: (event: ChatEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as ChatEvent);
    }
  }
  const rest = buffer.trim();
  if (rest) onEvent(JSON.parse(rest) as ChatEvent);
}

export const OPEN_SUPPORT_EVENT = "saylo:open-support";

// Lets any page open the widget ("talk to us" on /support, an error screen…).
export function openSupportChat(options: { form?: boolean } = {}) {
  window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_EVENT, { detail: options }));
}
