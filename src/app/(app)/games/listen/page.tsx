"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Ear, Headphones, Star, Volume2, Snail, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import GameResults, { withReplay, type MissedWord } from "@/components/games/GameResults";
import { supabase } from "@/lib/supabase/browserClient";
import { getListeningGameWords, type ListeningItem } from "@/lib/games/listeningWords";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { speak, speechSupported } from "@/lib/speech/browserTts";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import { ChoiceGrid, GameHud, GameStage, WordReveal, type RoundResult } from "@/components/games/GameKit";

const ROUND_SIZE = 10;
const METER = [36, 62, 88, 70, 100, 54, 80, 44, 68, 30];

const noopSubscribe = () => () => {};

const PROMPT: Record<ListeningItem["mode"], string> = {
  meaning: "מה פירוש המילה ששמעתם?",
  spelling: "איך כותבים את המילה ששמעתם?",
};

function ListenGamePage({ onReplay }: { onReplay: () => void }) {
  const { profile, loading } = useAuth();
  const [startedAt] = useState(() => Date.now());
  // Read on the client only; the server render assumes speech is there so
  // the page doesn't flash "no sound" before hydrating.
  const supported = useSyncExternalStore(noopSubscribe, speechSupported, () => true);
  const [items, setItems] = useState<ListeningItem[] | null>(null);
  // The first sound must come from a tap (iOS won't speak before one), so
  // the round opens on a "turn the sound on" screen.
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [missed, setMissed] = useState<MissedWord[]>([]);
  const correctCountRef = useRef(0);
  const xpAwardedRef = useRef(0);

  useEffect(() => {
    if (!profile) return;
    getListeningGameWords(profile.id, ROUND_SIZE).then((fetched) => {
      setResults(fetched.map(() => null));
      setItems(fetched);
    });
  }, [profile]);

  function play(rate = 0.9) {
    if (!items) return;
    setPlaying(true);
    speak(items[index].headword, rate, () => setPlaying(false));
  }
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });

  // Each new word plays by itself once the round has started.
  useEffect(() => {
    if (!started || finished) return;
    const t = setTimeout(() => playRef.current(), 250);
    return () => clearTimeout(t);
  }, [started, index, finished]);

  // Space replays the word (R too, for anyone holding a key elsewhere).
  useEffect(() => {
    if (!started || finished) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "BUTTON")) return;
      if (e.key === " " || e.key.toLowerCase() === "r") {
        e.preventDefault();
        playRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, finished]);

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
    recordGameAnswer(profile.id, item.vocabularyItemId, isCorrect, "vocab_game_listening")
      .then((res) => {
        xpAwardedRef.current += res.xpAwarded;
      })
      .catch(() => undefined);

    if (isCorrect) setTimeout(() => void advance(), 1000);
  }

  async function advance() {
    if (!profile || !items) return;
    if (index + 1 >= items.length) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "listening",
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

  if (!supported) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Headphones} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין כאן השמעת קול</h1>
        <p className="mt-2 text-muted">הדפדפן הזה לא תומך בהקראה. אפשר לנסות בדפדפן אחר או באפליקציה.</p>
      </div>
    );
  }

  if (loading || items === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Headphones} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">עוד אין מספיק מילים</h1>
        <p className="mt-2 text-muted">אחרי כמה תרגולים באוצר המילים יהיו כאן מילים לשמוע.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <GameResults
        title="סיבוב ההאזנה הסתיים"
        percent={Math.round((correctCount / items.length) * 100)}
        detail=<>{correctCount} מתוך {items.length} נכונות</>
        gameType="listening"
        startedAt={startedAt}
        missed={missed}
        results={results}
        onReplay={onReplay}
      />
    );
  }

  if (!started) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <span className="mx-auto inline-flex w-16 h-16 items-center justify-center rounded-lg bg-primary text-primary-ink">
          <Ear size={30} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-black tracking-tight">שמעו ובחרו</h1>
        <p className="mt-2 text-muted leading-relaxed">
          {ROUND_SIZE} מילים, בלי לראות אותן. פעם בוחרים מה המילה אומרת, ופעם איך כותבים אותה. אפשר לשמוע שוב, וגם לאט.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="game-press mt-7 inline-flex items-center justify-center gap-2 min-h-13 px-7 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Volume2 size={18} aria-hidden="true" /> להפעיל קול ולהתחיל
        </button>
        <p className="mt-3 text-xs text-muted">כדאי עם אוזניות או עם הרמקול פתוח</p>
      </div>
    );
  }

  const item = items[index];

  return (
    <HeartsGate>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        <GameHud title="שמעו ובחרו" results={results} current={index} score={correctCount} scoreLabel="תשובות נכונות" scoreIcon={Star} />

        <GameStage stageKey={index}>
          <p className="text-sm text-muted">{PROMPT[item.mode]}</p>

          {/* The speaker: the word itself is hidden until the answer. */}
          <div className="mt-3 flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => play()}
              aria-label="להשמיע שוב את המילה"
              className="game-press relative flex-1 flex items-center justify-center gap-5 min-h-28 overflow-hidden rounded-lg bg-primary text-primary-ink transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <Volume2 size={30} aria-hidden="true" className="shrink-0" />
              <span className="flex h-12 items-center gap-1" aria-hidden="true">
                {METER.map((h, i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full bg-primary-ink/85 ${playing ? "studio-bar" : ""}`}
                    style={{ height: playing ? `${h}%` : "18%", animationDelay: `${i * 80}ms`, transition: "height 200ms ease-out" }}
                  />
                ))}
              </span>
              {locked && (
                <span dir="ltr" lang="en" className="absolute bottom-2 inset-x-0 text-center text-sm font-bold">
                  {item.headword}
                </span>
              )}
            </button>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => play()}
                className="game-press flex-1 inline-flex items-center gap-1.5 px-3 rounded-lg border border-card-border text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <RotateCcw size={15} aria-hidden="true" /> שוב
              </button>
              <button
                type="button"
                onClick={() => play(0.55)}
                className="game-press flex-1 inline-flex items-center gap-1.5 px-3 rounded-lg border border-card-border text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Snail size={15} aria-hidden="true" /> לאט
              </button>
            </div>
          </div>

          <div className="mt-5">
            <ChoiceGrid
              options={item.options}
              correctIndex={item.correctIndex}
              selected={selected}
              locked={locked}
              onChoose={submitAnswer}
              english={item.mode === "spelling"}
            />
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

          {!locked && <p className="mt-4 hidden pointer-fine:block text-xs text-muted">רווח משמיע שוב · 1–4 לבחירה</p>}
        </GameStage>
      </div>
    </HeartsGate>
  );
}

export default withReplay(ListenGamePage);
