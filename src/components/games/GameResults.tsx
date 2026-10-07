"use client";

import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Trophy, Volume2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { speak } from "@/lib/speech/browserTts";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import type { VocabularyGameType } from "@/types/database";
import { GameCompletionScore } from "./GameMoments";
import type { RoundResult } from "./GameKit";

export interface MissedWord {
  headword: string;
  translationHe: string;
}

// "Play again" can't be a link to the game's own URL: the page is keyed by
// pathname (PageTransition), so navigating to the same path keeps the
// finished screen on display. Instead every game is wrapped in a key that
// the results screen bumps, which remounts the game with fresh state.
export function withReplay<P extends object>(Game: ComponentType<P & { onReplay: () => void }>) {
  function Replayable(props: P) {
    const [round, setRound] = useState(0);
    return <Game key={round} {...props} onReplay={() => setRound((r) => r + 1)} />;
  }
  return Replayable;
}

// The best accuracy this learner had in this game before the round that
// just ended — sessions saved at or after `startedAt` are this round's own.
function usePreviousBest(gameType: VocabularyGameType | null, startedAt: number): number | null | undefined {
  const { profile } = useAuth();
  const [best, setBest] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!profile || !gameType) return;
    supabase
      .from("vocabulary_game_sessions")
      .select("correct_count, total_questions")
      .eq("profile_id", profile.id)
      .eq("game_type", gameType)
      .lt("created_at", new Date(startedAt).toISOString())
      .then(({ data }) => {
        const rates = (data ?? [])
          .filter((r) => r.total_questions > 0)
          .map((r) => Math.round((r.correct_count / r.total_questions) * 100));
        setBest(rates.length ? Math.max(...rates) : null);
      });
  }, [profile, gameType, startedAt]);

  return best;
}

interface GameResultsProps {
  title: string;
  // Accuracy drives the personal-best comparison, and the big number unless
  // the game has its own score (catch's points, memory's moves).
  percent?: number;
  score?: React.ReactNode;
  detail: React.ReactNode;
  // Personal best is only compared for percent-scored games.
  gameType?: VocabularyGameType;
  startedAt: number;
  missed: MissedWord[];
  // For games with no wrong answers to list (memory): show these words
  // under this heading instead of the missed-words recap.
  recap?: { title: string; words: MissedWord[] };
  // The round, answer by answer — the same segments the top bar showed.
  results?: RoundResult[];
  onReplay: () => void;
}

export default function GameResults({ title, percent, score, detail, gameType, startedAt, missed, recap, results, onReplay }: GameResultsProps) {
  const previousBest = usePreviousBest(percent !== undefined && gameType ? gameType : null, startedAt);
  const isNewBest = percent !== undefined && previousBest !== undefined && previousBest !== null && percent > previousBest;
  const words = recap?.words ?? missed;
  const unique = words.filter((w, i) => words.findIndex((m) => m.headword === w.headword) === i);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <section className="relative overflow-hidden bg-card border border-card-border rounded-lg p-6 sm:p-8 text-center">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <h1 className="text-2xl font-bold">{title}</h1>
        <GameCompletionScore>{score ?? `${percent}%`}</GameCompletionScore>
        <p className="mt-2 text-muted tabular-nums">{detail}</p>

        {results && results.length > 0 && (
          <div className="mt-4 flex justify-center gap-[3px]" aria-hidden="true">
            {results.map((r, i) => (
              <span
                key={i}
                className={`h-2 w-full max-w-6 rounded-[2px] ${r === "correct" ? "bg-success" : r === "wrong" ? "bg-danger" : "bg-card-border"}`}
              />
            ))}
          </div>
        )}

        {percent !== undefined && previousBest !== undefined && (
          <p className="mt-3 text-sm min-h-5" aria-live="polite">
            {isNewBest ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 text-accent-hover font-bold">
                <Trophy size={14} aria-hidden="true" /> שיא אישי חדש במשחק הזה
              </span>
            ) : previousBest === null ? (
              <span className="text-muted">הסיבוב הראשון שלכם במשחק הזה. מכאן יש שיא לשבור.</span>
            ) : (
              <span className="text-muted tabular-nums">השיא שלכם במשחק הזה: {previousBest}%</span>
            )}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onReplay}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <RotateCcw size={16} aria-hidden="true" /> עוד סיבוב
          </motion.button>
          <MotionLink
            whileTap={{ scale: 0.97 }}
            href="/games"
            className="px-6 py-3 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            לכל המשחקים
          </MotionLink>
        </div>
      </section>

      <section aria-labelledby="missed-words-title" className="mt-4 bg-card border border-card-border rounded-lg p-5">
        <h2 id="missed-words-title" className="font-bold">
          {recap ? recap.title : unique.length ? "מילים לחזור עליהן" : "בלי טעויות בסיבוב הזה"}
        </h2>
        {unique.length > 0 ? (
          <>
            {!recap && (
              <p className="mt-0.5 text-sm text-muted">הן יחזרו אליכם בחזרה החכמה, אבל שווה להקשיב להן עוד פעם עכשיו.</p>
            )}
            <ul className="mt-3 divide-y divide-card-border">
              {unique.map((w) => (
                <li key={w.headword} className="flex items-center gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => speak(w.headword, 0.85)}
                    aria-label={`השמעת ${w.headword}`}
                    className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-lg border border-card-border text-primary hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <Volume2 size={16} aria-hidden="true" />
                  </button>
                  <EnglishText className="font-bold">{w.headword}</EnglishText>
                  <span className="ms-auto text-muted">{w.translationHe}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-0.5 text-sm text-muted">כל המילים בסיבוב נענו נכון.</p>
        )}
      </section>
    </div>
  );
}
