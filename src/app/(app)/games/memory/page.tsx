"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { GameHud, type RoundResult } from "@/components/games/GameKit";
import GameResults, { withReplay } from "@/components/games/GameResults";
import { getDailyReview } from "@/lib/srs/queue";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import IconBadge from "@/components/IconBadge";
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

function MemoryGamePage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading: authLoading } = useAuth();
  const [startedAt] = useState(() => Date.now());
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
    const pairs = cards
      .filter((c) => c.isEnglish)
      .map((c) => ({ headword: c.label, translationHe: cards.find((o) => !o.isEnglish && o.vocabularyItemId === c.vocabularyItemId)?.label ?? "" }));
    return (
      <GameResults
        title="כל הזוגות נמצאו"
        score={comparisons}
        detail={<>ניסיונות למצוא את כל {pairTotal} הזוגות. פחות ניסיונות = זיכרון טוב יותר.</>}
        startedAt={startedAt}
        missed={[]}
        recap={{ title: "המילים בסיבוב", words: pairs }}
        onReplay={onReplay}
      />
    );
  }

  // One segment per pair, filled as pairs are found.
  const pairIds = [...new Set(cards.map((c) => c.vocabularyItemId))];
  const results: RoundResult[] = pairIds.map((id) => (matchedVocabIds.has(id) ? "correct" : null));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <GameHud
        title="זיכרון"
        subtitle={`${matchedVocabIds.size} מתוך ${pairTotal} זוגות`}
        results={results}
        current={matchedVocabIds.size}
        score={comparisons}
        scoreLabel="ניסיונות"
        showScoreLabel
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((card) => {
          const isMatched = matchedVocabIds.has(card.vocabularyItemId);
          const isFlipped = isMatched || flipped.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card)}
              disabled={isMatched || locked}
              // backface-visibility only hides the back face visually — the
              // text node is still in the DOM either way, so without this a
              // screen reader can read every card's word before it's ever
              // flipped, which gives away the whole game.
              aria-label={isFlipped ? card.label : "כרטיס מוסתר, לחצו לחשיפה"}
              className="game-press relative h-24 sm:h-28 [perspective:700px] rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.32, ease: [0.77, 0, 0.175, 1] }}
                className="relative w-full h-full [transform-style:preserve-3d]"
              >
                {/* Back: a plate in the brand blue with the speech mark. */}
                <div
                  className="absolute inset-0 rounded-lg bg-primary flex items-center justify-center [backface-visibility:hidden] shadow-[inset_0_-3px_0_rgb(0_0_0/0.15)]"
                  aria-hidden="true"
                >
                  <MessageCircle size={26} strokeWidth={2.25} className="text-primary-ink/45" />
                </div>
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-lg border flex flex-col items-center justify-center gap-1 px-2 text-center font-bold leading-tight [backface-visibility:hidden] [transform:rotateY(180deg)] transition-colors duration-300 ${
                    isMatched ? "border-success/50 bg-success/10" : "border-card-border bg-card"
                  }`}
                >
                  {card.isEnglish ? (
                    <EnglishText className="text-base sm:text-lg">{card.label}</EnglishText>
                  ) : (
                    <span className="text-sm sm:text-base">{card.label}</span>
                  )}
                  <span className="text-[10px] font-medium text-muted">{card.isEnglish ? "English" : "עברית"}</span>
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">הופכים שני קלפים בכל פעם ומחפשים מילה והתרגום שלה</p>
    </div>
  );
}

export default withReplay(MemoryGamePage);
