"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import SpeakButton from "@/components/SpeakButton";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import type { WordLookupResult } from "@/lib/ai/prompts/wordLookup";

// Tap any word in the teacher's message to see what it means there, hear
// it, and (when it is in Saylo's vocabulary) add it to the learner's
// reviews, so a conversation also grows their vocabulary.

const WORD_CHAR = /[A-Za-z'’-]/;

// The English word under a tap, and the sentence around it, read straight
// from the text the browser rendered: no per-word buttons in the DOM, so
// the message still reads and selects as plain text.
export function wordAtPoint(x: number, y: number): { word: string; sentence: string } | null {
  let node: Node | null = null;
  let offset = 0;
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };
  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    node = pos?.offsetNode ?? null;
    offset = pos?.offset ?? 0;
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    node = range?.startContainer ?? null;
    offset = range?.startOffset ?? 0;
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent ?? "";
  // A tap just after the last letter lands on the boundary; step back in.
  if (!WORD_CHAR.test(text[offset] ?? "") && WORD_CHAR.test(text[offset - 1] ?? "")) offset -= 1;
  if (!WORD_CHAR.test(text[offset] ?? "")) return null;
  let start = offset;
  let end = offset;
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start--;
  while (end < text.length && WORD_CHAR.test(text[end])) end++;
  const word = text.slice(start, end).replace(/^['’-]+|['’-]+$/g, "");
  if (!/^[A-Za-z]/.test(word)) return null;

  let s = start;
  while (s > 0 && !/[.!?\n]/.test(text[s - 1])) s--;
  let e = end;
  while (e < text.length && !/[.!?\n]/.test(text[e])) e++;
  const sentence = text.slice(s, Math.min(e + 1, text.length)).trim().slice(0, 600);
  return { word, sentence };
}

type LookupState =
  | { status: "loading"; word: string }
  | { status: "ready"; word: string; result: WordLookupResult; added: boolean; adding: boolean; addFailed?: boolean }
  | { status: "error"; word: string };

export function useWordLookup() {
  const { profile } = useAuth();
  const [state, setState] = useState<LookupState | null>(null);
  const seq = useRef(0);

  const lookup = useCallback(async (word: string, sentence: string) => {
    const id = ++seq.current;
    setState({ status: "loading", word });
    try {
      const res = await fetch("/api/ai/word-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, sentence }),
      });
      if (id !== seq.current) return;
      if (!res.ok) throw new Error("lookup failed");
      const result = (await res.json()) as WordLookupResult;
      if (id !== seq.current) return;
      setState({ status: "ready", word, result, added: result.inMyWords, adding: false });
    } catch {
      if (id === seq.current) setState({ status: "error", word });
    }
  }, []);

  const addToMyWords = useCallback(async () => {
    if (!profile || state?.status !== "ready" || !state.result.vocabularyItemId || state.added) return;
    const itemId = state.result.vocabularyItemId;
    setState({ ...state, adding: true });
    // A word already being reviewed keeps its progress: insert only.
    const add = () =>
      supabase
        .from("srs_items")
        .upsert({ profile_id: profile.id, vocabulary_item_id: itemId }, { onConflict: "profile_id,vocabulary_item_id", ignoreDuplicates: true });
    let { error } = await add();
    // A brand-new word is stored just after its lookup answers; if the tap
    // beat that write, give it a moment and try once more.
    if (error) {
      await new Promise((r) => setTimeout(r, 1500));
      ({ error } = await add());
    }
    setState((prev) =>
      prev?.status === "ready" && prev.result.vocabularyItemId === itemId
        ? { ...prev, adding: false, added: !error, addFailed: !!error }
        : prev,
    );
  }, [profile, state]);

  const close = useCallback(() => {
    seq.current++;
    setState(null);
  }, []);

  return { state, lookup, addToMyWords, close };
}

const POS_HE: Record<string, string> = {
  noun: "שם עצם",
  verb: "פועל",
  adjective: "שם תואר",
  adverb: "תואר הפועל",
  phrase: "ביטוי",
};

export function WordCard({
  state,
  onAdd,
  onClose,
}: {
  state: LookupState;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card px-3.5 py-2.5" aria-live="polite">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div dir="ltr" className="flex items-center justify-end gap-2">
            <EnglishText className="text-lg font-bold">
              {state.status === "ready" ? state.result.headword : state.word}
            </EnglishText>
            <SpeakButton text={state.status === "ready" ? state.result.headword : state.word} className="p-1" />
          </div>
          {state.status === "loading" && <p className="mt-0.5 text-sm text-muted">מחפשים את הפירוש...</p>}
          {state.status === "error" && <p className="mt-0.5 text-sm text-muted">לא הצלחנו למצוא פירוש למילה הזו.</p>}
          {state.status === "ready" && (
            <p className="mt-0.5">
              <span className="font-medium">{state.result.translationHe}</span>
              {state.result.partOfSpeech && POS_HE[state.result.partOfSpeech] && (
                <span className="text-sm text-muted"> · {POS_HE[state.result.partOfSpeech]}</span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירת התרגום"
          className="-m-1.5 shrink-0 rounded-md p-1.5 text-muted hover:bg-background-2 hover:text-foreground transition-colors"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      {state.status === "ready" &&
        state.result.vocabularyItemId &&
        (state.added ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-success">
            <Check size={15} aria-hidden="true" /> במילים שלכם לחזרה
          </p>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={state.adding}
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium hover:bg-background-2 transition-colors disabled:opacity-50"
          >
            <Plus size={15} aria-hidden="true" /> הוספה למילים שלי לחזרה
          </button>
        ))}
      {state.status === "ready" && state.addFailed && (
        <p className="mt-1 text-sm text-danger">לא הצלחנו להוסיף את המילה. נסו שוב בעוד רגע.</p>
      )}
    </div>
  );
}
