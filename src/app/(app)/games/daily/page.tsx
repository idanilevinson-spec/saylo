"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { startAttempt } from "@/lib/exercises/recordAttempt";
import { runSerially } from "@/lib/gamification/answerTail";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { maskWord, checkSpelling } from "@/lib/games/spelling";
import { awardXp } from "@/lib/gamification/xp";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import { PromptText, ChoiceGrid, GameHud, GameStage, LetterTiles, SpeakButton, WordReveal, type RoundResult } from "@/components/games/GameKit";
import type { McqContent } from "@/types/exercises";

const ROUND_SIZE = 10;
const COMPLETION_BONUS_XP = 20;

type Mode = "mcq" | "spelling";

// Same word pool as Speed Round / Spelling, but each question's mode is
// chosen with a per-word deterministic pick so the round feels varied
// without reshuffling on every re-render.
function modeFor(vocabularyItemId: string): Mode {
  let hash = 0;
  for (let i = 0; i < vocabularyItemId.length; i++) hash = (hash * 31 + vocabularyItemId.charCodeAt(i)) | 0;
  return Math.abs(hash) % 2 === 0 ? "mcq" : "spelling";
}

function DailyChallengePage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const correctCountRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      // Since local midnight, not UTC midnight (which is 02:00/03:00 in
      // Israel), and limit(1) rather than maybeSingle(): with two sessions
      // already today maybeSingle() errors, returns no row, and the
      // completion bonus would be paid again.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [reviewItems, { data: todaySessions }] = await Promise.all([
        getDailyReview(profile.id, ROUND_SIZE),
        supabase
          .from("vocabulary_game_sessions")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("game_type", "daily_challenge")
          .gte("created_at", todayStart.toISOString())
          .limit(1),
      ]);
      setResults(reviewItems.map(() => null));
      setItems(reviewItems);
      setAlreadyDoneToday((todaySessions ?? []).length > 0);
    })();
  }, [profile]);

  const modes = useMemo(() => (items ? items.map((it) => modeFor(it.vocabularyItemId)) : []), [items]);

  // Auto-focus the spelling input for every new round of that type, same
  // as Spelling Challenge — otherwise the learner has to click in every
  // single time this mode comes up.
  useEffect(() => {
    if (!locked && modes[index] === "spelling") inputRef.current?.focus();
  }, [index, locked, modes]);

  async function finishRound(finalCorrect: number) {
    if (!profile || !items) return;
    await supabase.from("vocabulary_game_sessions").insert({
      profile_id: profile.id,
      game_type: "daily_challenge",
      total_questions: items.length,
      correct_count: finalCorrect,
      xp_awarded: alreadyDoneToday ? 0 : COMPLETION_BONUS_XP,
    });
    if (!alreadyDoneToday) {
      await runSerially(() => awardXp(profile.id, "vocab_game_daily_bonus", COMPLETION_BONUS_XP));
    }
    playCompleteSound();
    setFinished(true);
  }

  // Records the verdict; a right answer moves on by itself, a wrong one
  // waits on the word card until the learner taps "next".
  function settle(isCorrect: boolean) {
    correctCountRef.current += isCorrect ? 1 : 0;
    setCorrectCount(correctCountRef.current);
    setResults((r) => r.map((v, i) => (i === index ? (isCorrect ? "correct" : "wrong") : v)));
    if (!isCorrect && items) {
      const missedItem = items[index];
      setMissed((m) => [...m, { headword: missedItem.headword, translationHe: missedItem.translationHe }]);
    }
    if (isCorrect) setTimeout(next, 900);
  }

  function next() {
    if (!items) return;
    if (index + 1 >= items.length) {
      void finishRound(correctCountRef.current);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setInput("");
      setLocked(false);
      setWasCorrect(null);
    }
  }

  function submitMcq(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    const item = items[index];
    // Verdict is instant (graded locally); the attempt saves in the background.
    const attempt = startAttempt(profile.id, item.exercise, { selectedIndex });
    attempt.done.catch(() => undefined);
    setWasCorrect(attempt.isCorrect);
    if (attempt.isCorrect) playCorrectSound();
    else playIncorrectSound();
    settle(attempt.isCorrect);
  }

  function submitSpelling() {
    if (!profile || !items || locked || !input.trim()) return;
    setLocked(true);
    const item = items[index];
    const isCorrect = checkSpelling(input, item.headword);
    setWasCorrect(isCorrect);
    if (isCorrect) playCorrectSound();
    else playIncorrectSound();
    recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_daily").catch(() => undefined);
    settle(isCorrect);
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">בונים את האתגר שלכם...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Sparkles} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים לאתגר</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <GameResults
        title="האתגר היומי הושלם"
        percent={Math.round((correctCount / items.length) * 100)}
        detail={
          <>
            {correctCount} מתוך {items.length} נכונות
            {!alreadyDoneToday && <> · +{COMPLETION_BONUS_XP} XP בונוס על האתגר היומי</>}
          </>
        }
        gameType="daily_challenge"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  const item = items[index];
  const mode = modes[index];
  const mcqContent = mode === "mcq" ? (item.exercise.content as unknown as McqContent) : null;

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title="האתגר היומי"
          subtitle={alreadyDoneToday ? "כבר השלמתם היום. הסיבוב הזה לתרגול" : `השלמה מזכה ב-${COMPLETION_BONUS_XP} XP`}
          results={results}
          current={index}
          score={correctCount}
          scoreLabel="תשובות נכונות"
          scoreIcon={Sparkles}
        />

        <GameStage stageKey={index} className={mode === "spelling" ? "text-center" : ""}>
          {mode === "mcq" && mcqContent ? (
            <>
              <PromptText text={mcqContent.prompt} className="text-xl sm:text-2xl font-bold leading-snug" />
              <div className="mt-5">
                <ChoiceGrid
                  options={mcqContent.options}
                  correctIndex={mcqContent.correctIndex}
                  selected={selected}
                  locked={locked}
                  onChoose={submitMcq}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">איך כותבים באנגלית</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">{item.translationHe}</p>
              <div className="mt-6">
                <LetterTiles
                  hint={maskWord(item.headword)}
                  typed={input}
                  word={item.headword}
                  verdict={wasCorrect === null ? null : wasCorrect ? "correct" : "wrong"}
                />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSpelling();
                }}
                className="mt-6 flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  {...ENGLISH_WORD_INPUT}
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
                  onClick={submitSpelling}
                  disabled={!input.trim()}
                  className="game-press mt-3 w-full min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  בדיקה
                </button>
              )}
            </>
          )}

          {wasCorrect !== null && (
            <div className="text-start">
              <WordReveal
                word={item}
                verdict={wasCorrect ? "correct" : "wrong"}
                compact={wasCorrect}
                onNext={wasCorrect ? undefined : next}
                nextLabel={index + 1 >= items.length ? "לתוצאות" : "לשאלה הבאה"}
              />
            </div>
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}

export default withReplay(DailyChallengePage);
