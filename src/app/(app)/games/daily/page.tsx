"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";
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
import EnglishText from "@/components/EnglishText";
import { GameScorePill, GameFeedback } from "@/components/games/GameMoments";
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

  async function advance(isCorrect: boolean) {
    correctCountRef.current += isCorrect ? 1 : 0;
    if (!isCorrect && items) {
      const missedItem = items[index];
      setMissed((m) => [...m, { headword: missedItem.headword, translationHe: missedItem.translationHe }]);
    }
    setCorrectCount(correctCountRef.current);
    setTimeout(() => {
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
    }, 1100);
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
    void advance(attempt.isCorrect);
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
    void advance(isCorrect);
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
        onReplay={onReplay}
      />
    );
  }

  const item = items[index];
  const mode = modes[index];
  const mcqContent = mode === "mcq" ? (item.exercise.content as unknown as McqContent) : null;

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="sr-only">האתגר היומי</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">
            שאלה {index + 1} מתוך {items.length}
          </span>
          <GameScorePill value={correctCount} icon={Sparkles} />
        </div>
        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-6">
          <div className="h-full bg-accent transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-lg p-6 sm:p-8"
        >
          {mode === "mcq" && mcqContent ? (
            <div>
              <EnglishText as="p" className="font-medium text-lg">
                {mcqContent.prompt}
              </EnglishText>
              <div className="mt-4 space-y-2">
                {mcqContent.options.map((option, i) => {
                  const isCorrectOption = i === mcqContent.correctIndex;
                  const isSelected = selected === i;
                  let stateClass = "border-card-border hover:border-primary/40";
                  if (locked && isCorrectOption) stateClass = "border-success bg-success/10";
                  else if (locked && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
                  else if (isSelected) stateClass = "border-primary bg-primary/5";
                  return (
                    <button
                      key={i}
                      disabled={locked}
                      onClick={() => submitMcq(i)}
                      className={`w-full flex items-center justify-between gap-2 text-right px-4 py-3 rounded-lg border transition-[color,background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default active:scale-[0.98] ${stateClass}`}
                    >
                      <EnglishText>{option}</EnglishText>
                      {locked && isCorrectOption && <CheckCircle2 size={18} className="text-success shrink-0" />}
                      {locked && isSelected && !isCorrectOption && <XCircle size={18} className="text-danger shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted">השלימו את המילה באנגלית עבור</p>
              <p className="mt-1 text-2xl font-bold">{item.translationHe}</p>
              <p dir="ltr" className="mt-6 font-content text-3xl tracking-widest text-muted select-none">
                {maskWord(item.headword)}
              </p>
              <input
                ref={inputRef}
                type="text"
                {...ENGLISH_WORD_INPUT}
                aria-label={`השלימו את המילה עבור ${item.translationHe}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSpelling()}
                disabled={locked}
                placeholder="Type the word..."
                className="mt-6 w-full px-4 py-3 rounded-lg border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
              />
              {!locked && (
                <button
                  onClick={submitSpelling}
                  disabled={!input.trim()}
                  className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[color,background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-[0.98]"
                >
                  בדיקה
                </button>
              )}
            </div>
          )}

          {wasCorrect !== null && (
            <GameFeedback correct={wasCorrect} centered>
              {wasCorrect
                ? "כל הכבוד!"
                : mode === "spelling"
                  ? `לא בדיוק — המילה היא "${item.headword}"`
                  : `לא בדיוק — התשובה הנכונה: "${mcqContent?.options[mcqContent.correctIndex]}"`}
            </GameFeedback>
          )}
        </motion.div>
      </div>
    </HeartsGate>
  );
}

export default withReplay(DailyChallengePage);
