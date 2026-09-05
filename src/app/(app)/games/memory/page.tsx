"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getDailyReview } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

const PAIR_COUNT = 6;
const COMPARE_DELAY = 700;

interface Card {
  id: string;
  vocabularyItemId: string;
  label: string;
  isEnglish: boolean;
}

type Phase = "loading" | "empty" | "playing" | "finished";

export default function MemoryGamePage() {
  const { profile, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedVocabIds, setMatchedVocabIds] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState(false);
  const [pairTotal, setPairTotal] = useState(PAIR_COUNT);
  const [comparisons, setComparisons] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  // comparisonsRef mirrors the state above for the async setTimeout
  // callback below, which needs the *authoritative* just-incremented
  // total for the final Supabase insert — state read inside that
  // closure could still be one tick stale, a ref can't be. matchesRef
  // has no display counterpart (never shown mid-game), so it stays a
  // plain ref.
  const comparisonsRef = useRef(0);
  const matchesRef = useRef(0);
  const xpAwardedRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDailyReview(profile.id, PAIR_COUNT).then((items) => {
      if (items.length < 3) {
        setPhase("empty");
        return;
      }
      const deck: Card[] = items.flatMap((it) => [
        { id: `${it.vocabularyItemId}-en`, vocabularyItemId: it.vocabularyItemId, label: it.headword, isEnglish: true },
        { id: `${it.vocabularyItemId}-he`, vocabularyItemId: it.vocabularyItemId, label: it.translationHe, isEnglish: false },
      ]);
      setCards(shuffle(deck));
      setPairTotal(items.length);
      setPhase("playing");
    });
  }, [profile]);

  function handleFlip(card: Card) {
    if (locked || phase !== "playing") return;
    if (flipped.includes(card.id) || matchedVocabIds.has(card.vocabularyItemId)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      const [firstId, secondId] = next;
      const first = cards.find((c) => c.id === firstId);
      const second = cards.find((c) => c.id === secondId);
      comparisonsRef.current += 1;
      setComparisons(comparisonsRef.current);

      setTimeout(async () => {
        const isMatch = !!first && !!second && first.vocabularyItemId === second.vocabularyItemId;
        if (isMatch && first) {
          playCorrectSound();
          matchesRef.current += 1;
          const nextMatched = new Set(matchedVocabIds);
          nextMatched.add(first.vocabularyItemId);
          setMatchedVocabIds(nextMatched);
          setAnnouncement(`זוג נמצא! ${first.label} = ${second?.label}`);
          if (profile) {
            try {
              const res = await recordGameAnswer(profile.id, first.vocabularyItemId, true, "vocab_game_memory");
              xpAwardedRef.current += res.xpAwarded;
            } catch (err) {
              console.error("recordGameAnswer failed", err);
            }
          }

          if (nextMatched.size === pairTotal) {
            playCompleteSound();
            setPhase("finished");
            if (profile) {
              await supabase.from("vocabulary_game_sessions").insert({
                profile_id: profile.id,
                game_type: "memory",
                total_questions: comparisonsRef.current,
                correct_count: matchesRef.current,
                xp_awarded: xpAwardedRef.current,
              });
            }
          }
        } else {
          // A mismatch here is just normal memory-game exploration (you
          // couldn't have known what was under the other card) — flip
          // back without spending a heart, unlike a real wrong answer.
          playIncorrectSound();
          setAnnouncement("לא זוג, מנסים שוב");
        }
        setFlipped([]);
        setLocked(false);
      }, COMPARE_DELAY);
    }
  }

  if (authLoading || phase === "loading") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Brain} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">משחק הזיכרון הושלם!</h1>
        <p className="mt-2 text-muted">
          מצאתם את כל {pairTotal} הזוגות ב-<EnglishText as="span">{comparisons}</EnglishText> ניסיונות
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/memory"
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="sr-only">משחק הזיכרון</h1>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <p className="text-sm text-muted mb-4 text-center">
        {matchedVocabIds.size} מתוך {pairTotal} זוגות · {comparisons} ניסיונות
      </p>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => {
          const isMatched = matchedVocabIds.has(card.vocabularyItemId);
          const isFlipped = isMatched || flipped.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card)}
              disabled={isMatched || locked}
              // backface-visibility only hides the back face visually — the
              // text node is still in the DOM either way, so without this a
              // screen reader can read every card's word before it's ever
              // flipped, which gives away the whole game.
              aria-label={isFlipped ? card.label : "כרטיס מוסתר, לחצו לחשיפה"}
              className="relative h-28 [perspective:600px]"
              whileTap={!isFlipped ? { scale: 0.96 } : undefined}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                className="relative w-full h-full [transform-style:preserve-3d]"
              >
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center [backface-visibility:hidden]"
                  aria-hidden="true"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white/70" />
                </div>
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-xl border flex items-center justify-center px-2 text-center text-sm font-bold [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? "border-success/40 bg-success/10" : "border-card-border bg-card"
                  }`}
                >
                  {card.isEnglish ? <EnglishText>{card.label}</EnglishText> : card.label}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
