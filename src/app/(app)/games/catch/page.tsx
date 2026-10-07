"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeftRight, Hand, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound, playLevelUpSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import { awardXp } from "@/lib/gamification/xp";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import { GameHud, WordReveal, type RoundResult } from "@/components/games/GameKit";

const WAVE_SIZE = 5;
const WAVE_COUNT = 4;
const TOTAL_ROUNDS = WAVE_SIZE * WAVE_COUNT;
const START_FALL_SECONDS = 5;
const WAVE_SPEED_STEP = 0.5;
const ROUND_FALL_STEP = 0.15;
const MIN_FALL_SECONDS = 1.6;
const STREAK_BONUS_THRESHOLD = 3;
const STREAK_BONUS_XP = 3;
const POINTS_PER_CATCH = 10;
const ROUND_RESULT_DELAY = 1000;
const WAVE_CLEAR_DELAY = 1600;
const LANE_COUNT = 4;
const START_LANE = 1;
// Pressing ArrowDown speeds up the rest of the fall instead of slamming
// it straight to the bottom — noticeably quicker, still readable/steerable.
const SOFT_DROP_MULTIPLIER = 2.5;

type Phase = "loading" | "empty" | "playing" | "waveClear" | "finished";
type Result = "caught" | "missed" | null;

// Page is dir="rtl" and options render right-to-left: lane 0 sits at the
// physical right edge, lane LANE_COUNT-1 at the physical left edge — this
// converts a lane index into the falling word's `left` percentage so it
// visually sits above the matching option.
function lanePercent(lane: number): number {
  return ((LANE_COUNT - 1 - lane + 0.5) / LANE_COUNT) * 100;
}

// Owns the fall itself (top position, driven by hand via requestAnimationFrame
// rather than a Framer/CSS transition) so ArrowDown can speed up the
// remaining distance without ever retargeting a running animation — and so
// it can reset per round just by remounting via `key={round}` in the parent,
// the same pattern Speed Round's QuestionTimer uses, instead of imperatively
// resetting state from inside an effect body.
function FallingWord({
  headword,
  lane,
  fallSeconds,
  onLanded,
}: {
  headword: string;
  lane: number;
  fallSeconds: number;
  onLanded: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const boostRef = useRef(false);
  const lastTimeRef = useRef(0);
  const onLandedRef = useRef(onLanded);
  useEffect(() => {
    onLandedRef.current = onLanded;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        boostRef.current = true;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The fall is written straight to the element's transform every frame —
  // no React state per frame, so nothing re-renders 60 times a second and
  // the motion stays on the compositor (smooth in the iOS app's WebView).
  useEffect(() => {
    lastTimeRef.current = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dtSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const multiplier = boostRef.current ? SOFT_DROP_MULTIPLIER : 1;
      progressRef.current = Math.min(1, progressRef.current + (dtSeconds * multiplier) / fallSeconds);
      const el = wrapRef.current;
      if (el) {
        // Land with the whole card still inside the arena: the travel is
        // the arena height minus the card's own height, not a fixed share
        // of the arena (which let a tall card on a short phone arena sink
        // below the bottom edge).
        const arena = el.parentElement?.clientHeight ?? 0;
        const card = (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
        const travel = Math.max(0, arena - card - 8);
        el.style.transform = `translate3d(0, ${progressRef.current * travel}px, 0)`;
      }
      if (progressRef.current >= 1) {
        onLandedRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [fallSeconds]);

  return (
    <div ref={wrapRef} className="absolute inset-x-0 top-0 will-change-transform">
      <motion.div
        initial={{ left: `${lanePercent(START_LANE)}%` }}
        animate={{ left: `${lanePercent(lane)}%` }}
        transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
        className="absolute -translate-x-1/2 overflow-hidden px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-card border border-primary/40 shadow-[0_6px_18px_-6px_rgb(0_0_0/0.35)]"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <EnglishText className="text-2xl sm:text-3xl font-bold whitespace-nowrap">{headword}</EnglishText>
      </motion.div>
    </div>
  );
}

function WordCatchPage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading: authLoading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<DueReviewItem[]>([]);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [pickedOption, setPickedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState(START_LANE);

  const caughtRef = useRef(0);
  const roundResolvedRef = useRef(false);
  const xpAwardedRef = useRef(0);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);
  const laneRef = useRef(START_LANE);
  const [streakBonus, setStreakBonus] = useState(0);
  const [results, setResults] = useState<RoundResult[]>(() => Array.from({ length: TOTAL_ROUNDS }, () => null));

  const waveIndex = Math.floor(round / WAVE_SIZE);
  const roundInWave = round % WAVE_SIZE;
  const fallSeconds = Math.max(
    MIN_FALL_SECONDS,
    START_FALL_SECONDS - waveIndex * WAVE_SPEED_STEP - roundInWave * ROUND_FALL_STEP
  );

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, TOTAL_ROUNDS).then((data) => {
      if (data.length < 4) {
        setPhase("empty");
        return;
      }
      setItems(data);
      setOptions(buildOptions(data, 0));
      setLane(START_LANE);
      laneRef.current = START_LANE;
      setPhase("playing");
    });
  }, [profile]);

  function buildOptions(pool: DueReviewItem[], idx: number): string[] {
    const correct = pool[idx].translationHe;
    // Two different vocabulary items can share the same Hebrew translation
    // (synonyms) — dedupe so the 4 options never show the same text twice.
    const seen = new Set([correct]);
    const distractors: string[] = [];
    for (const p of shuffle(pool.filter((_, i) => i !== idx))) {
      if (distractors.length >= 3) break;
      if (seen.has(p.translationHe)) continue;
      seen.add(p.translationHe);
      distractors.push(p.translationHe);
    }
    return shuffle([correct, ...distractors]);
  }

  const resolveRound = useCallback(
    async (outcome: "caught" | "missed", picked: string | null) => {
      if (roundResolvedRef.current || !profile || items.length === 0) return;
      roundResolvedRef.current = true;
      setResult(outcome);
      setPickedOption(picked);

      const item = items[round % items.length];
      const isCorrect = outcome === "caught";
      setResults((r) => r.map((v, i) => (i === round ? (isCorrect ? "correct" : "wrong") : v)));
      if (isCorrect) {
        playCorrectSound();
        caughtRef.current += 1;
        streakRef.current += 1;
        scoreRef.current += POINTS_PER_CATCH * (waveIndex + 1);
        setScore(scoreRef.current);
        if (streakRef.current >= STREAK_BONUS_THRESHOLD) {
          await awardXp(profile.id, "vocab_game_catch_streak", STREAK_BONUS_XP);
          xpAwardedRef.current += STREAK_BONUS_XP;
          setStreakBonus((b) => b + STREAK_BONUS_XP);
        }
      } else {
        playIncorrectSound();
        streakRef.current = 0;
        setMissed((m) => [...m, { headword: item.headword, translationHe: item.translationHe }]);
      }
      const res = await recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_catch");
      xpAwardedRef.current += res.xpAwarded;

      function advanceTo(nextIdx: number) {
        roundResolvedRef.current = false;
        setResult(null);
        setPickedOption(null);
        setOptions(buildOptions(items, nextIdx % items.length));
        setLane(START_LANE);
        laneRef.current = START_LANE;
        setRound(nextIdx);
      }

      setTimeout(async () => {
        const nextIdx = round + 1;
        if (nextIdx >= TOTAL_ROUNDS) {
          playCompleteSound();
          setPhase("finished");
          await supabase.from("vocabulary_game_sessions").insert({
            profile_id: profile.id,
            game_type: "word_catch",
            total_questions: TOTAL_ROUNDS,
            correct_count: caughtRef.current,
            xp_awarded: xpAwardedRef.current,
          });
        } else if (nextIdx % WAVE_SIZE === 0) {
          playLevelUpSound();
          setPhase("waveClear");
          setTimeout(() => {
            advanceTo(nextIdx);
            setPhase("playing");
          }, WAVE_CLEAR_DELAY);
        } else {
          advanceTo(nextIdx);
        }
      }, ROUND_RESULT_DELAY);
    },
    [profile, items, round, waveIndex]
  );

  const resolveRoundRef = useRef(resolveRound);
  resolveRoundRef.current = resolveRound;

  function handlePick(option: string, pickedLane: number) {
    if (phase !== "playing" || roundResolvedRef.current || items.length === 0) return;
    const item = items[round % items.length];
    setLane(pickedLane);
    laneRef.current = pickedLane;
    resolveRoundRef.current(option === item.translationHe ? "caught" : "missed", option);
  }

  // The falling word lands wherever the player last steered it — this is
  // the sole way a round resolves without a manual click.
  function handleLanded() {
    if (roundResolvedRef.current || items.length === 0 || options.length === 0) return;
    const item = items[round % items.length];
    const chosen = options[laneRef.current];
    resolveRoundRef.current(chosen === item.translationHe ? "caught" : "missed", chosen);
  }

  useEffect(() => {
    if (phase !== "playing" || result) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setLane((l) => {
          const next = Math.max(0, l - 1);
          laneRef.current = next;
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLane((l) => {
          const next = Math.min(LANE_COUNT - 1, l + 1);
          laneRef.current = next;
          return next;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, result]);

  if (authLoading || phase === "loading") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Hand} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (phase === "finished") {
    const caught = TOTAL_ROUNDS - missed.length;
    const accuracy = Math.round((caught / TOTAL_ROUNDS) * 100);
    return (
      <GameResults
        title="סוף המשחק"
        score={`${score} נק׳`}
        percent={accuracy}
        detail={
          <>
            {caught} מתוך {TOTAL_ROUNDS} נתפסו ({accuracy}%)
            {streakBonus > 0 && <> · +{streakBonus} XP בונוס רצף</>}
          </>
        }
        gameType="word_catch"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  if (phase === "waveClear") {
    const clearedWave = Math.floor(round / WAVE_SIZE) + 1;
    const nextWave = clearedWave + 1;
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center" role="status">
        <motion.div
          initial={{ opacity: 0, transform: "scale(0.92)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="text-sm font-bold text-muted">גל {clearedWave} הושלם</p>
          <p className="mt-2 chyron text-7xl text-primary tabular-nums">{score}</p>
          <p className="mt-1 text-sm text-muted">נקודות עד עכשיו</p>
          <p className="mt-6 inline-flex items-center gap-1.5 text-lg font-bold text-accent-hover">
            <Zap size={18} aria-hidden="true" className="fill-current" />
            גל {nextWave}: המילים נופלות מהר יותר
          </p>
        </motion.div>
      </div>
    );
  }

  const item = items[round % items.length];

  return (
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10">
        <GameHud
          title="תפסו את המילה"
          subtitle={`גל ${waveIndex + 1} מתוך ${WAVE_COUNT}`}
          results={results}
          current={round}
          score={score}
          scoreLabel="נקודות"
          scoreIcon={Zap}
        />

        <div className="relative h-72 sm:h-96 rounded-lg border border-card-border bg-background-2 overflow-hidden">
          {/* Lane guides: where the word will land, so steering is legible. */}
          <div aria-hidden="true" className="absolute inset-0 grid grid-cols-4">
            {Array.from({ length: LANE_COUNT }, (_, i) => (
              <span
                key={i}
                className={`transition-colors duration-150 ${i < LANE_COUNT - 1 ? "border-e border-dashed border-card-border" : ""} ${
                  lane === i ? "bg-primary/[0.07]" : ""
                }`}
              />
            ))}
          </div>
          <FallingWord key={round} headword={item.headword} lane={lane} fallSeconds={fallSeconds} onLanded={handleLanded} />
          <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-1 bg-danger/50" />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {options.map((opt, i) => {
            const isPicked = pickedOption === opt;
            const isCorrectOpt = result && opt === item.translationHe;
            return (
              <button
                key={`${opt}-${i}`}
                // Keyboard-focusable: steering listens on `window`, so it
                // works whatever has focus, and a Tab+Enter user needs a
                // real way to pick without racing the fall.
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handlePick(opt, i);
                }}
                disabled={!!result}
                className={`game-press min-h-16 px-1.5 sm:px-3 py-3 rounded-lg border text-sm sm:text-lg font-bold leading-tight transition-[background-color,border-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  isCorrectOpt
                    ? "border-success bg-success/10 text-success"
                    : isPicked
                      ? "game-shake border-danger bg-danger/10 text-danger"
                      : lane === i && !result
                        ? "border-primary bg-primary/[0.06]"
                        : "border-card-border bg-card hover:border-primary/50 disabled:opacity-50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-muted pointer-coarse:hidden">
          <span className="inline-flex items-center gap-1 align-middle">
            <ArrowLeftRight size={13} aria-hidden="true" /> מזיזים את המילה
          </span>
          {" · "}
          <span className="inline-flex items-center gap-1 align-middle">
            <ArrowDown size={13} aria-hidden="true" /> מאיצים את הנפילה
          </span>
          {" · "}
          או לוחצים ישירות על התרגום
        </p>
        <p className="mt-3 text-center text-xs text-muted hidden pointer-coarse:block">
          מקישים על התרגום הנכון לפני שהמילה נוחתת
        </p>

        {result && <WordReveal word={item} verdict={result === "caught" ? "correct" : "wrong"} compact />}
      </div>
    </HeartsGate>
  );
}

export default withReplay(WordCatchPage);
