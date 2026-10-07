"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { startAttempt } from "@/lib/exercises/recordAttempt";
import { runSerially } from "@/lib/gamification/answerTail";
import { awardXp } from "@/lib/gamification/xp";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import { PromptText, ChoiceGrid, CountdownBar, GameHud, GameStage, WordReveal, type RoundResult } from "@/components/games/GameKit";
import type { McqContent } from "@/types/exercises";

const QUESTION_SECONDS = 8;
const FAST_ANSWER_THRESHOLD_MS = 3000;
const SPEED_BONUS_XP = 5;
const ROUND_SIZE = 10;

// Owns its own countdown so switching questions (via the `key={index}`
// the parent gives this) remounts a fresh timer through useState's own
// initial value instead of imperatively resetting existing state from
// an effect body, which React's compiler flags as an anti-pattern.
function QuestionTimer({ onTimeout, locked }: { onTimeout: () => void; locked: boolean }) {
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  useEffect(() => {
    if (locked) return;
    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [locked]);

  useEffect(() => {
    if (timeLeft === 0 && !locked) onTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  return <CountdownBar timeLeft={timeLeft} total={QUESTION_SECONDS} paused={locked} />;
}

function SpeedRoundPage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const [items, setItems] = useState<DueReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [fastAnswer, setFastAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const questionStartRef = useRef<number>(0);
  const correctCountRef = useRef(0);
  const bonusXpRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, ROUND_SIZE).then((fetched) => {
      questionStartRef.current = Date.now();
      setResults(fetched.map(() => null));
      setItems(fetched);
    });
  }, [profile]);

  function submitAnswer(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    setTimedOut(selectedIndex === -1);

    const elapsed = Date.now() - questionStartRef.current;
    const item = items[index];
    // Graded locally: in a game built around pace, the verdict and the next
    // question can't wait on the network. Saving runs in the background, in
    // order (the bonus goes through the same queue so XP updates never overlap).
    const attempt = startAttempt(profile.id, item.exercise, { selectedIndex });
    attempt.done.catch(() => undefined);
    setWasCorrect(attempt.isCorrect);
    setResults((r) => r.map((v, i) => (i === index ? (attempt.isCorrect ? "correct" : "wrong") : v)));
    setFastAnswer(attempt.isCorrect && elapsed < FAST_ANSWER_THRESHOLD_MS);

    if (attempt.isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      if (elapsed < FAST_ANSWER_THRESHOLD_MS) {
        runSerially(() => awardXp(profile.id, "vocab_game_speed_bonus", SPEED_BONUS_XP)).catch(() => undefined);
        bonusXpRef.current += SPEED_BONUS_XP;
        setBonusXp(bonusXpRef.current);
      }
    } else {
      playIncorrectSound();
      setMissed((m) => [...m, { headword: item.headword, translationHe: item.translationHe }]);
    }

    // A right answer moves on almost at once — the game is about pace. A
    // wrong one stops on the word card until the learner taps "next": the
    // clock is per question, so reading costs nothing.
    if (attempt.isCorrect) setTimeout(() => void advance(), 450);
  }

  async function advance() {
    if (!profile || !items) return;
    if (index + 1 >= items.length) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "speed_round",
        total_questions: items.length,
        correct_count: correctCountRef.current,
        xp_awarded: bonusXpRef.current,
      });
      playCompleteSound();
      setFinished(true);
    } else {
      questionStartRef.current = Date.now();
      setIndex((i) => i + 1);
      setSelected(null);
      setLocked(false);
      setWasCorrect(null);
      setTimedOut(false);
      setFastAnswer(false);
    }
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Zap} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <GameResults
        title="סיבוב המהירות הסתיים"
        percent={Math.round((correctCount / items.length) * 100)}
        detail=<>{correctCount} מתוך {items.length} נכונות{bonusXp > 0 && <> · +{bonusXp} XP בונוס מהירות</>}</>
        gameType="speed_round"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  const item = items[index];
  const content = item.exercise.content as unknown as McqContent;

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud title="סיבוב מהירות" results={results} current={index} score={correctCount} scoreLabel="תשובות נכונות" scoreIcon={Zap} />
        <QuestionTimer key={`timer-${index}`} locked={locked} onTimeout={() => submitAnswer(-1)} />

        <GameStage stageKey={index} className="mt-4">
          <PromptText text={content.prompt} className="text-xl sm:text-2xl font-bold leading-snug" />
          {fastAnswer && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-accent-hover">
              <Zap size={14} aria-hidden="true" className="fill-current" /> +{SPEED_BONUS_XP} XP על מהירות
            </p>
          )}

          <div className="mt-5">
            <ChoiceGrid
              options={content.options}
              correctIndex={content.correctIndex}
              selected={selected}
              locked={locked}
              onChoose={submitAnswer}
            />
          </div>

          {wasCorrect !== null && (
            <WordReveal
              word={item}
              verdict={wasCorrect ? "correct" : timedOut ? "timeout" : "wrong"}
              compact={wasCorrect}
              onNext={wasCorrect ? undefined : () => void advance()}
              nextLabel={index + 1 >= items.length ? "לתוצאות" : "לשאלה הבאה"}
            />
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}

export default withReplay(SpeedRoundPage);
