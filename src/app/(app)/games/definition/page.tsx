"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenCheck, Star } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { supabase } from "@/lib/supabase/browserClient";
import { getDefinitionGameWords, type DefinitionGameItem } from "@/lib/games/definitionWords";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import { ChoiceGrid, GameHud, GameStage, WordReveal, type RoundResult } from "@/components/games/GameKit";

const ROUND_SIZE = 10;

function DefinitionGamePage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const [items, setItems] = useState<DefinitionGameItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const correctCountRef = useRef(0);
  const xpAwardedRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getDefinitionGameWords(profile.id, ROUND_SIZE).then((fetched) => {
      setResults(fetched.map(() => null));
      setItems(fetched);
    });
  }, [profile]);

  function submitAnswer(selectedIndex: number) {
    if (!profile || !items || locked) return;
    setLocked(true);
    setSelected(selectedIndex);
    const item = items[index];
    const isCorrect = selectedIndex === item.correctIndex;
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
    // Saved in the background; the verdict and the next word never wait on it.
    recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_definition")
      .then((res) => {
        xpAwardedRef.current += res.xpAwarded;
      })
      .catch(() => undefined);

    // A right answer moves on by itself; a wrong one waits on the word card.
    if (isCorrect) setTimeout(() => void advance(), 900);
  }

  async function advance() {
    if (!profile || !items) return;
    if (index + 1 >= items.length) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "definition",
        total_questions: items.length,
        correct_count: correctCountRef.current,
        xp_awarded: xpAwardedRef.current,
      });
      playCompleteSound();
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setLocked(false);
      setWasCorrect(null);
    }
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={BookOpenCheck} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">המשחק הזה עוד לא זמין</h1>
        <p className="mt-2 text-muted">הגדרות באנגלית מתווספות למילים בהדרגה. כדאי לחזור לבדוק בקרוב.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <GameResults
        title="סיבוב ההגדרות הסתיים"
        percent={Math.round((correctCount / items.length) * 100)}
        detail=<>{correctCount} מתוך {items.length} נכונות</>
        gameType="definition"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  const item = items[index];

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud title="זיהוי לפי הגדרה" results={results} current={index} score={correctCount} scoreLabel="תשובות נכונות" scoreIcon={Star} />

        <GameStage stageKey={index}>
          <p className="text-sm text-muted">איזו מילה מתאימה להגדרה?</p>
          <EnglishText as="blockquote" className="mt-2 text-xl sm:text-[1.4rem] font-semibold leading-relaxed">
            {item.definitionEn}
          </EnglishText>

          <div className="mt-5">
            <ChoiceGrid options={item.options} correctIndex={item.correctIndex} selected={selected} locked={locked} onChoose={submitAnswer} />
          </div>

          {wasCorrect !== null && (
            <WordReveal
              word={item}
              verdict={wasCorrect ? "correct" : "wrong"}
              compact={wasCorrect}
              onNext={wasCorrect ? undefined : () => void advance()}
              nextLabel={index + 1 >= items.length ? "לתוצאות" : "למילה הבאה"}
            />
          )}
        </GameStage>
      </div>
    </HeartsGate>
  );
}

export default withReplay(DefinitionGamePage);
