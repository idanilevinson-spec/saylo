"use client";

import { useCallback, useState } from "react";
import { Lightbulb } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import type { ReplyIdea } from "@/lib/ai/prompts/replyIdeas";

// "What do I say?" help: three possible answers to the teacher's last
// message, short to rich, each with its meaning in Hebrew. Asked for on
// demand only, once per teacher turn; a new turn clears the old ideas.

export function useReplyIdeas(conversationId: string, turnKey: string | null) {
  // Everything is tagged with the turn it belongs to; anything from an
  // older turn simply reads as empty, and a late answer for it is dropped.
  const [entry, setEntry] = useState<{ key: string; ideas: ReplyIdea[] | null; loading: boolean; failed: boolean } | null>(null);
  const current = entry && entry.key === turnKey ? entry : null;
  const ideas = current?.ideas ?? null;
  const loading = !!current?.loading;

  const request = useCallback(async () => {
    if (!turnKey || loading || ideas) return;
    const key = turnKey;
    setEntry({ key, ideas: null, loading: true, failed: false });
    const settle = (next: ReplyIdea[] | null) =>
      setEntry((prev) => (prev?.key === key ? { key, ideas: next, loading: false, failed: !next } : prev));
    try {
      const res = await fetch("/api/ai/conversation-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = res.ok ? ((await res.json()) as { ideas: ReplyIdea[] }) : null;
      settle(data?.ideas.length ? data.ideas : null);
    } catch {
      settle(null);
    }
  }, [conversationId, turnKey, loading, ideas]);

  const dismiss = useCallback(() => setEntry(null), []);

  return { ideas, loading, failed: !!current?.failed, request, dismiss, available: !!turnKey };
}

export function ReplyIdeasButton({
  onClick,
  loading,
  disabled,
  compact,
  className = "",
}: {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  // Keeps the label fixed so a row of buttons doesn't reflow while loading.
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-1.5 rounded-lg border border-card-border text-sm font-medium hover:bg-background-2 transition-colors disabled:opacity-40 ${className}`}
    >
      <Lightbulb size={15} aria-hidden="true" className={loading ? "animate-pulse" : undefined} />
      {loading && !compact ? "חושבים על רעיונות..." : "רעיון לתשובה"}
    </button>
  );
}

export function ReplyIdeasList({
  ideas,
  onPick,
  hint,
}: {
  ideas: ReplyIdea[];
  // In the chat a tap puts the answer in the box to edit and send. On a
  // call there is nothing to tap into: the learner reads one out loud.
  onPick?: (en: string) => void;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card px-3.5 py-2.5">
      <p className="text-xs font-bold text-muted">{hint}</p>
      <ul className="mt-1.5 space-y-1.5">
        {ideas.map((idea, i) => {
          const body = (
            <>
              <EnglishText as="p" className="font-medium">
                {idea.en}
              </EnglishText>
              <p className="text-xs text-muted">{idea.he}</p>
            </>
          );
          return (
            <li key={i}>
              {onPick ? (
                <button
                  type="button"
                  onClick={() => onPick(idea.en)}
                  className="w-full rounded-md px-2.5 py-1.5 text-start hover:bg-background-2 active:bg-background-2 transition-colors"
                >
                  {body}
                </button>
              ) : (
                <div className="px-2.5 py-1">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
