"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useRef, useState } from "react";
import { PenTool, Star } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { maskWord, checkSpelling } from "@/lib/games/spelling";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import { GameHud, GameStage, LetterTiles, SpeakButton, WordReveal, type RoundResult } from "@/components/games/GameKit";

const ROUND_SIZE = 10;

function SpellingChallengePage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const correctCountRef = useRef(0);
  const xpAwardedRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, ROUND_SIZE).then((fetched) => {
      setResults(fetched.map(() => null));
      setItems(fetched);
    });
  }, [profile]);

  // Auto-focus the input for every new word so the learner can keep
  // typing without having to click into the field each round.
  useEffect(() => {
    if (!locked) inputRef.current?.focus();
  }, [index, locked]);

  function handleSubmit() {
    if (!profile || !items || locked || !input.trim()) return;
    setLocked(true);
    const item = items[index];
    const isCorrect = checkSpelling(input, item.headword);
    setWasCorrect(isCorrect);
    setResults((r) => r.map((v, i) => (i === index ? (isCorrect ? "correct" : "wrong") : v)));
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
      setMissed((m) => [...m, { headword: item.headword, translationHe: item.translationHe }]);
    }
    recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_spelling")
      .then((res) => {
        xpAwardedRef.current += res.xpAwarded;
      })
      .catch(() => undefined);

    if (isCorrect) setTimeout(() => void advance(), 1000);
  }

  async function advance() {
    if (!profile || !items) return;
    if (index + 1 >= items.length) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "spelling",
        total_questions: items.length,
        correct_count: correctCountRef.current,
        xp_awarded: xpAwardedRef.current,
      });
      playCompleteSound();
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setInput("");
      setLocked(false);
      setWasCorrect(null);
    }
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={PenTool} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <GameResults
        title="אתגר האיות הסתיים"
        percent={Math.round((correctCount / items.length) * 100)}
        detail=<>{correctCount} מתוך {items.length} נכונות</>
        gameType="spelling"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  const item = items[index];
  const hint = maskWord(item.headword);

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud title="אתגר איות" results={results} current={index} score={correctCount} scoreLabel="מילים נכונות" scoreIcon={Star} />

        <GameStage stageKey={index} className="text-center">
          <p className="text-sm text-muted">איך כותבים באנגלית</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold">{item.translationHe}</p>

          <div className="mt-6">
            <LetterTiles hint={hint} typed={input} word={item.headword} verdict={wasCorrect === null ? null : wasCorrect ? "correct" : "wrong"} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="mt-6 flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              {...ENGLISH_WORD_INPUT}
              enterKeyHint="done"
              aria-label={`איך כותבים באנגלית ${item.translationHe}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={locked}
              maxLength={item.headword.length + 4}
              placeholder="Type the whole word"
              className="flex-1 min-w-0 min-h-12 px-4 rounded-lg border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70 placeholder:text-muted"
            />
            <SpeakButton text={item.headword} label="רמז קולי: השמעת המילה" />
          </form>

          {!locked && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="game-press mt-3 w-full min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              בדיקה
            </button>
          )}

          {wasCorrect !== null && (
            <div className="text-start">
              <WordReveal
                word={item}
                verdict={wasCorrect ? "correct" : "wrong"}
                compact={wasCorrect}
                onNext={wasCorrect ? undefined : () => void advance()}
                nextLabel={index + 1 >= items.length ? "לתוצאות" : "למילה הבאה"}
              />
            </div>
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}

export default withReplay(SpellingChallengePage);
