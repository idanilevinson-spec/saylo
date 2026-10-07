"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles, PartyPopper } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  getLearnPool,
  buildLearnQuestion,
  masteryTier,
  type LearnItem,
  type LearnQuestion,
  type MasteryTier,
} from "@/lib/games/learn";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { checkSpelling } from "@/lib/games/spelling";
import { supabase } from "@/lib/supabase/browserClient";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import GameResults, { withReplay } from "@/components/games/GameResults";
import { ChoiceGrid, GameHud, GameStage, SpeakButton, WordReveal, type RoundResult } from "@/components/games/GameKit";

const POOL_SIZE = 12;
// Mastering a word needs repetitions to reach 4 (new -> learning -> familiar
// x2 -> mastered), so a perfect run through the whole pool needs at least
// POOL_SIZE * 4 correct answers before this cap could ever matter — any
// lower and the cap would fire before a flawless session could even finish,
// let alone a realistic one with a few mistakes along the way.
const SAFETY_CAP = POOL_SIZE * 6;

type Phase = "loading" | "empty" | "playing" | "wordMastered" | "finished";

const TIER_LABEL: Record<MasteryTier, string> = {
  new: "חדש",
  learning: "בלמידה",
  familiar: "מוכר",
  mastered: "בשליטה",
};

const TIER_CLASS: Record<MasteryTier, string> = {
  new: "bg-background-2 text-muted",
  learning: "bg-primary/10 text-primary",
  familiar: "bg-accent/15 text-accent-hover",
  mastered: "bg-success/15 text-success",
};

// useSearchParams() (for the ?topic= deep link from the vocabulary topic
// page) needs a Suspense boundary on this route since it has no dynamic
// segment of its own, so Next tries to statically prerender it.
export default function LearnModePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>}>
      <ReplayableLearn />
    </Suspense>
  );
}

// The one mode across all of Saylo's vocabulary games where the learner
// can actually see their own SRS mastery state (every other game just
// uses it silently) — a genuine improvement, not just parity with the
// arcade games it otherwise follows the shape of.
const ReplayableLearn = withReplay(LearnModePageInner);

function LearnModePageInner({ onReplay }: { onReplay: () => void }) {
  const { profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const topicSlug = searchParams.get("topic") ?? undefined;

  const [phase, setPhase] = useState<Phase>("loading");
  const [fullPool, setFullPool] = useState<LearnItem[]>([]);
  const [queue, setQueue] = useState<LearnItem[]>([]);
  const [masteredWords, setMasteredWords] = useState<LearnItem[]>([]);
  const [question, setQuestion] = useState<LearnQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(() => Date.now());
  // Set once a wrong answer is saved: "next" runs it. Right answers move on
  // by themselves.
  const [nextAction, setNextAction] = useState<(() => void) | null>(null);
  // Bumped per question, so the same word asked twice in a row still
  // remounts its stage.
  const [turn, setTurn] = useState(0);

  const correctCountRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const xpAwardedRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      let topicId: string | undefined;
      if (topicSlug) {
        const { data: topic } = await supabase.from("topics").select("id").eq("slug", topicSlug).maybeSingle();
        topicId = topic?.id;
      }
      const pool = await getLearnPool(profile.id, topicId, POOL_SIZE);
      if (pool.length < 4) {
        setPhase("empty");
        return;
      }
      setFullPool(pool);
      setQueue(pool);
      setQuestion(buildLearnQuestion(pool[0], pool));
      setPhase("playing");
    })();
  }, [profile, topicSlug]);

  useEffect(() => {
    if (phase === "playing" && question?.type === "recall" && !locked) inputRef.current?.focus();
  }, [phase, question, locked]);

  function advanceTo(nextQueue: LearnItem[]) {
    if (nextQueue.length === 0 || totalAnsweredRef.current >= SAFETY_CAP) {
      finishSession();
      return;
    }
    setQueue(nextQueue);
    setQuestion(buildLearnQuestion(nextQueue[0], fullPool));
    setTurn((t) => t + 1);
    setSelected(null);
    setInput("");
    setLocked(false);
    setWasCorrect(null);
    setNextAction(null);
  }

  async function finishSession() {
    playCompleteSound();
    setPhase("finished");
    if (profile) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "learn",
        total_questions: totalAnsweredRef.current,
        correct_count: correctCountRef.current,
        xp_awarded: xpAwardedRef.current,
      });
    }
  }

  async function submitAnswer(isCorrect: boolean) {
    if (!profile || !question || locked) return;
    setLocked(true);
    setWasCorrect(isCorrect);
    totalAnsweredRef.current += 1;
    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      playIncorrectSound();
    }

    const item = question.item;
    const res = await recordGameAnswer(
      profile.id,
      item.vocabularyItemId,
      isCorrect,
      question.type === "mcq" ? "vocab_learn_mcq" : "vocab_learn_recall"
    );
    xpAwardedRef.current += res.xpAwarded;
    const newTier = masteryTier(res.repetitions);

    const proceed = () => {
      const restOfQueue = queue.slice(1);
      if (newTier === "mastered") {
        setMasteredWords((prev) => [...prev, { ...item, repetitions: res.repetitions }]);
        setPhase("wordMastered");
        setTimeout(() => {
          setPhase("playing");
          advanceTo(restOfQueue);
        }, 1100);
      } else {
        const updatedItem = { ...item, repetitions: res.repetitions };
        advanceTo([...restOfQueue, updatedItem]);
      }
    };
    if (isCorrect) setTimeout(proceed, 900);
    else setNextAction(() => proceed);
  }

  function submitMcq(index: number) {
    if (question?.type !== "mcq") return;
    setSelected(index);
    submitAnswer(index === question.correctIndex);
  }

  function submitRecall() {
    if (question?.type !== "recall" || !input.trim()) return;
    submitAnswer(checkSpelling(input, question.item.headword));
  }

  if (authLoading || phase === "loading") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">בונים לכם סבב למידה...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={GraduationCap} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למידה</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <GameResults
        title="סבב הלמידה הסתיים"
        score={`${masteredWords.length}/${fullPool.length}`}
        detail={<>מילים שהגיעו לשליטה מלאה בסבב · {correctCount} תשובות נכונות</>}
        startedAt={startedAt}
        missed={[]}
        recap={{ title: masteredWords.length ? "מילים בשליטה" : "המילים בסבב", words: masteredWords.length ? masteredWords : fullPool }}
        onReplay={onReplay}
      />
    );
  }

  const total = fullPool.length;
  const remaining = total - masteredWords.length;
  const masteredIds = new Set(masteredWords.map((w) => w.vocabularyItemId));
  const results: RoundResult[] = fullPool.map((w) => (masteredIds.has(w.vocabularyItemId) ? "correct" : null));
  const tier = question ? masteryTier(question.item.repetitions) : "new";

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud
          title="למידה"
          subtitle={`${masteredWords.length} מתוך ${total} מילים בשליטה · ${remaining} נשארו`}
          results={results}
          current={masteredWords.length}
          score={correctCount}
          scoreLabel="תשובות נכונות"
          scoreIcon={Sparkles}
        />

        <div className="relative">
          <AnimatePresence>
            {phase === "wordMastered" && (
              <motion.div
                role="status"
                initial={{ opacity: 0, transform: "scale(0.96)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/95 rounded-lg"
              >
                <p className="flex items-center gap-2 text-xl font-bold text-success">
                  <PartyPopper size={20} className="shrink-0" aria-hidden="true" />
                  מילה בשליטה מלאה
                </p>
                {question && <EnglishText className="chyron text-5xl text-foreground normal-case">{question.item.headword}</EnglishText>}
              </motion.div>
            )}
          </AnimatePresence>

          {question && (
            <GameStage stageKey={turn}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  {question.type === "mcq" ? "איזו מילה באנגלית מתאימה?" : "איך כותבים באנגלית?"}
                </p>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${TIER_CLASS[tier]}`}>{TIER_LABEL[tier]}</span>
              </div>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">{question.item.translationHe}</p>

              {question.type === "mcq" ? (
                <div className="mt-5">
                  <ChoiceGrid
                    options={question.options}
                    correctIndex={question.correctIndex}
                    selected={selected}
                    locked={locked}
                    onChoose={submitMcq}
                  />
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitRecall();
                  }}
                  className="mt-5"
                >
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      {...ENGLISH_WORD_INPUT}
                      aria-label={`איך כותבים באנגלית ${question.item.translationHe}`}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={locked}
                      placeholder="Type the word"
                      className="flex-1 min-w-0 min-h-12 px-4 rounded-lg border border-card-border bg-background text-center font-content text-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70 placeholder:text-muted"
                    />
                    <SpeakButton text={question.item.headword} label="רמז קולי: השמעת המילה" />
                  </div>
                  {!locked && (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="game-press mt-3 w-full min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                    >
                      בדיקה
                    </button>
                  )}
                </form>
              )}

              {wasCorrect !== null && (
                <WordReveal
                  word={question.item}
                  verdict={wasCorrect ? "correct" : "wrong"}
                  compact={wasCorrect}
                  onNext={!wasCorrect && nextAction ? nextAction : undefined}
                  nextLabel="המשך"
                />
              )}
            </GameStage>
          )}
        </div>
      </div>
    </HeartsGate>
  );
}
