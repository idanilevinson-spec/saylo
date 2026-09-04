"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hand, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound, playLevelUpSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import { awardXp } from "@/lib/gamification/xp";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

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
const FALL_TARGET_PCT = 88;
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
  const [topPct, setTopPct] = useState(0);
  const progressRef = useRef(0);
  const boostRef = useRef(false);
  const lastTimeRef = useRef(0);
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;

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

  useEffect(() => {
    lastTimeRef.current = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dtSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const multiplier = boostRef.current ? SOFT_DROP_MULTIPLIER : 1;
      progressRef.current = Math.min(1, progressRef.current + (dtSeconds * multiplier) / fallSeconds);
      setTopPct(progressRef.current * FALL_TARGET_PCT);
      if (progressRef.current >= 1) {
        onLandedRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [fallSeconds]);

  return (
    <div className="absolute inset-x-0" style={{ top: `${topPct}%` }}>
      <motion.div
        initial={{ left: `${lanePercent(START_LANE)}%` }}
        animate={{ left: `${lanePercent(lane)}%` }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute -translate-x-1/2 px-6 py-4 rounded-xl bg-card border border-primary/30 shadow-md"
      >
        <EnglishText className="text-3xl font-bold">{headword}</EnglishText>
      </motion.div>
    </div>
  );
}

export default function WordCatchPage() {
  const { profile, loading: authLoading } = useAuth();
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
    const accuracy = Math.round((caughtRef.current / TOTAL_ROUNDS) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">תפוס את המילה הושלם!</h1>
        <p className="mt-2 text-3xl font-bold text-accent-hover">{score} נקודות</p>
        <p className="mt-2 text-muted">
          {caughtRef.current} מתוך {TOTAL_ROUNDS} תפוסות ({accuracy}%)
          {streakBonus > 0 && <> · +{streakBonus} XP בונוס רצף</>}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/catch"
            className="px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            עוד סיבוב
          </MotionLink>
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games"
            className="px-6 py-3 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            חזרה למשחקים
          </MotionLink>
        </div>
      </div>
    );
  }

  if (phase === "waveClear") {
    const clearedWave = Math.floor(round / WAVE_SIZE) + 1;
    const nextWave = clearedWave + 1;
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <IconBadge icon={Zap} tone="accent" className="mx-auto" />
          <h1 className="mt-4 text-3xl font-bold">גל {clearedWave} הושלם!</h1>
          <p className="mt-2 text-muted">ניקוד: {score}</p>
          <p className="mt-4 text-lg font-bold text-accent-hover">גל {nextWave} מתחיל — קצב מהיר יותר!</p>
        </motion.div>
      </div>
    );
  }

  const item = items[round % items.length];

  return (
    <HeartsGate>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            גל {waveIndex + 1} מתוך {WAVE_COUNT} · מילה {roundInWave + 1} מתוך {WAVE_SIZE}
          </p>
          <p className="text-sm font-bold text-accent-hover">{score} נק&apos;</p>
        </div>

        <div className="relative h-96 rounded-2xl border border-card-border bg-background-2 overflow-hidden">
          <FallingWord key={round} headword={item.headword} lane={lane} fallSeconds={fallSeconds} onLanded={handleLanded} />
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-t from-danger/40 to-transparent"
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted">הזיזו את המילה הנופלת לתרגום הנכון עם החצים</p>

        <div className="mt-4 grid grid-cols-4 gap-4">
          {options.map((opt, i) => {
            const isPicked = pickedOption === opt;
            const isCorrectOpt = result && opt === item.translationHe;
            return (
              <motion.button
                key={`${opt}-${i}`}
                // Not part of the keyboard focus chain at all — this game
                // is steered entirely by arrow keys moving the falling
                // word, and a button that picks up focus from a mouse
                // click would otherwise let the browser's own arrow-key
                // focus movement hop between these options instead.
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  handlePick(opt, i);
                }}
                disabled={!!result}
                whileHover={!result ? { scale: 1.02 } : undefined}
                whileTap={!result ? { scale: 0.97 } : undefined}
                className={`px-3 py-5 rounded-xl border text-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  isCorrectOpt
                    ? "border-success bg-success/10 text-success"
                    : isPicked
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-card-border bg-card hover:border-primary/40 disabled:opacity-50"
                }`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-muted">
          חצים ⇄ להזזת המילה הנופלת · חץ ⇣ להאצת הנפילה · אפשר גם ללחוץ ישירות
        </p>

        {result === "missed" && (
          <p className="mt-4 text-center text-sm text-danger">
            <EnglishText>{item.headword}</EnglishText> = {item.translationHe}
          </p>
        )}
      </div>
    </HeartsGate>
  );
}
