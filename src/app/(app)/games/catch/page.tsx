"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hand, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

const ROUND_COUNT = 10;
const START_FALL_SECONDS = 5;
const FALL_STEP = 0.25;
const MIN_FALL_SECONDS = 2.2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "loading" | "empty" | "playing" | "finished";
type Result = "caught" | "missed" | null;

export default function WordCatchPage() {
  const { profile, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<DueReviewItem[]>([]);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [pickedOption, setPickedOption] = useState<string | null>(null);

  const caughtRef = useRef(0);
  const roundResolvedRef = useRef(false);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, ROUND_COUNT).then((data) => {
      if (data.length < 4) {
        setPhase("empty");
        return;
      }
      setItems(data);
      setOptions(buildOptions(data, 0));
      setPhase("playing");
    });
  }, [profile]);

  function buildOptions(pool: DueReviewItem[], idx: number): string[] {
    const correct = pool[idx].translationHe;
    const distractors = shuffle(pool.filter((_, i) => i !== idx))
      .slice(0, 3)
      .map((i) => i.translationHe);
    return shuffle([correct, ...distractors]);
  }

  const resolveRound = useCallback(
    async (outcome: "caught" | "missed", picked: string | null) => {
      if (roundResolvedRef.current || !profile) return;
      roundResolvedRef.current = true;
      setResult(outcome);
      setPickedOption(picked);

      const item = items[round];
      const isCorrect = outcome === "caught";
      if (isCorrect) {
        playCorrectSound();
        caughtRef.current += 1;
      } else {
        playIncorrectSound();
      }
      await recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_catch");

      setTimeout(async () => {
        if (round + 1 >= items.length) {
          playCompleteSound();
          setPhase("finished");
          await supabase.from("vocabulary_game_sessions").insert({
            profile_id: profile.id,
            game_type: "word_catch",
            total_questions: items.length,
            correct_count: caughtRef.current,
            xp_awarded: 0,
          });
        } else {
          const nextIdx = round + 1;
          roundResolvedRef.current = false;
          setResult(null);
          setPickedOption(null);
          setOptions(buildOptions(items, nextIdx));
          setRound(nextIdx);
        }
      }, 1000);
    },
    [profile, items, round]
  );

  const resolveRoundRef = useRef(resolveRound);
  resolveRoundRef.current = resolveRound;

  function handlePick(option: string) {
    if (phase !== "playing" || roundResolvedRef.current) return;
    const item = items[round];
    resolveRoundRef.current(option === item.translationHe ? "caught" : "missed", option);
  }

  function handleLanded() {
    resolveRoundRef.current("missed", null);
  }

  const fallSeconds = Math.max(MIN_FALL_SECONDS, START_FALL_SECONDS - round * FALL_STEP);

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
    const accuracy = Math.round((caughtRef.current / items.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">תפוס את המילה הושלם!</h1>
        <p className="mt-2 text-muted">
          {caughtRef.current} מתוך {items.length} תפוסות ({accuracy}%)
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

  const item = items[round];

  return (
    <HeartsGate>
      <div className="max-w-xl mx-auto px-4 py-10">
        <p className="text-sm text-muted mb-4">
          מילה {round + 1} מתוך {items.length}
        </p>

        <div className="relative h-56 rounded-2xl border border-card-border bg-background-2 overflow-hidden">
          <motion.div
            key={round}
            initial={{ top: "0%" }}
            animate={{ top: "88%" }}
            transition={{ duration: fallSeconds, ease: "linear" }}
            onAnimationComplete={handleLanded}
            className="absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-card border border-primary/30 shadow-md"
          >
            <EnglishText className="text-lg font-bold">{item.headword}</EnglishText>
          </motion.div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-t from-danger/40 to-transparent"
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted">תפסו את התרגום הנכון לפני שהיא נוחתת</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const isPicked = pickedOption === opt;
            const isCorrectOpt = result && opt === item.translationHe;
            return (
              <motion.button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={!!result}
                whileHover={!result ? { scale: 1.02 } : undefined}
                whileTap={!result ? { scale: 0.97 } : undefined}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
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

        {result === "missed" && (
          <p className="mt-4 text-center text-sm text-danger">
            <EnglishText>{item.headword}</EnglishText> = {item.translationHe}
          </p>
        )}
      </div>
    </HeartsGate>
  );
}
