"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Volume2, X, CornerDownLeft, type LucideIcon } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { speak } from "@/lib/speech/browserTts";

// The shared pieces every vocabulary game is built from, so the games read
// as one set: the same top bar, the same answer buttons, the same word card
// after an answer. Visual language: the app's "Restrained/Operate" plates
// (bg-card, rounded-lg, primary top edge), with the On Air chyron face kept
// for scoreboard numerals only — a game show's score and clock, nothing else.

export type RoundResult = "correct" | "wrong" | null;

// ---------- Top bar ----------

interface GameHudProps {
  title: string;
  // One entry per round; null = not played yet. Drives the segmented track.
  results: RoundResult[];
  current: number;
  score?: number;
  scoreLabel?: string;
  scoreIcon?: LucideIcon;
  // Print the label under the number — for a score that isn't self-evident
  // (memory counts tries, where a bare "4" reads as points).
  showScoreLabel?: boolean;
  // Extra line under the title (a level name, an instruction).
  subtitle?: ReactNode;
  // Rendered at the end of the top row (match's level clock, for instance).
  aside?: ReactNode;
}

export function GameHud({ title, results, current, score, scoreLabel = "ניקוד", scoreIcon: ScoreIcon, showScoreLabel = false, subtitle, aside }: GameHudProps) {
  const done = results.filter((r) => r !== null).length;
  return (
    <header className="mb-5">
      <div className="flex items-center gap-3">
        <Link
          href="/games"
          aria-label="יציאה מהמשחק"
          className="game-press shrink-0 inline-flex w-10 h-10 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={20} aria-hidden="true" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold leading-tight truncate">{title}</h1>
          {subtitle && <div className="text-sm text-muted leading-snug">{subtitle}</div>}
        </div>
        {aside}
        {score !== undefined && (
          <div className="shrink-0 text-end" aria-live="polite" aria-atomic="true">
            <span className="sr-only">
              {scoreLabel}: {score}
            </span>
            <span aria-hidden="true" className="flex items-center justify-end gap-1.5">
              {ScoreIcon && <ScoreIcon size={16} className="text-accent-hover fill-current" />}
              <span key={score} className="game-pop chyron text-3xl text-foreground tabular-nums">
                {score}
              </span>
            </span>
            {showScoreLabel && (
              <span aria-hidden="true" className="block text-[11px] text-muted leading-none mt-0.5">
                {scoreLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className="mt-3 flex gap-[3px]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={results.length}
        aria-valuenow={done}
        aria-valuetext={`סיבוב ${Math.min(current + 1, results.length)} מתוך ${results.length}`}
      >
        {results.map((r, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-[2px] transition-colors duration-200 ${
              r === "correct" ? "bg-success" : r === "wrong" ? "bg-danger" : i === current ? "bg-primary" : "bg-card-border"
            }`}
          />
        ))}
      </div>
    </header>
  );
}

// ---------- The stage (question plate) ----------

export function GameStage({ children, className = "", stageKey }: { children: ReactNode; className?: string; stageKey?: string | number }) {
  return (
    <motion.section
      key={stageKey}
      initial={{ opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className={`relative overflow-hidden bg-card border border-card-border rounded-lg p-5 sm:p-7 ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
      {children}
    </motion.section>
  );
}

// ---------- Multiple-choice answers ----------

interface ChoiceGridProps {
  options: string[];
  correctIndex: number;
  selected: number | null;
  locked: boolean;
  onChoose: (index: number) => void;
  english?: boolean;
}

// Number keys 1–4 answer on a keyboard; on touch the numbers are just
// labels. Keyboard answers are instant on purpose (no press animation).
export function ChoiceGrid({ options, correctIndex, selected, locked, onChoose, english = true }: ChoiceGridProps) {
  const onChooseRef = useRef(onChoose);
  useEffect(() => {
    onChooseRef.current = onChoose;
  });

  useEffect(() => {
    if (locked) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault();
        onChooseRef.current(n - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, options.length]);

  return (
    // English answers: the whole grid reads left-to-right (1 2 / 3 4), and
    // each button keeps its number badge next to the word.
    <div dir={english ? "ltr" : undefined} className="grid sm:grid-cols-2 gap-2.5" role="group" aria-label="תשובות">
      {options.map((option, i) => {
        const isCorrect = i === correctIndex;
        const isSelected = selected === i;
        const showCorrect = locked && isCorrect;
        const showWrong = locked && isSelected && !isCorrect;
        const faded = locked && !showCorrect && !showWrong;
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onChoose(i)}
            aria-label={`${i + 1}. ${option}${showCorrect ? " — התשובה הנכונה" : showWrong ? " — לא נכון" : ""}`}
            className={`game-press game-choice group relative flex items-center gap-3 min-h-14 px-3.5 py-3 rounded-lg border text-start transition-[background-color,border-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${
              showCorrect
                ? "border-success bg-success/10"
                : showWrong
                  ? "game-shake border-danger bg-danger/10"
                  : faded
                    ? "border-card-border opacity-55"
                    : "border-card-border bg-background/40 hover:border-primary/50 hover:bg-primary/[0.04]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`shrink-0 inline-flex w-7 h-7 items-center justify-center rounded-md text-xs font-bold tabular-nums transition-colors ${
                showCorrect
                  ? "bg-success text-success-ink"
                  : showWrong
                    ? "bg-danger text-danger-ink"
                    : "bg-background-2 text-muted group-hover:text-foreground"
              }`}
            >
              {showCorrect ? <CheckCircle2 size={16} /> : showWrong ? <XCircle size={16} /> : i + 1}
            </span>
            {english ? (
              <EnglishText className="flex-1 font-medium text-[1.05rem] leading-snug">{option}</EnglishText>
            ) : (
              <span className="flex-1 font-medium leading-snug">{option}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Word card (after an answer) ----------

export interface WordInfo {
  headword: string;
  translationHe: string;
  exampleEn?: string | null;
  ipa?: string | null;
  partOfSpeech?: string | null;
}

const POS_HE: Record<string, string> = {
  noun: "שם עצם",
  verb: "פועל",
  adjective: "שם תואר",
  adverb: "תואר הפועל",
  preposition: "מילת יחס",
  pronoun: "כינוי גוף",
  conjunction: "מילת חיבור",
  phrase: "ביטוי",
  "phrasal verb": "פועל צירופי",
  idiom: "ניב",
  expression: "ביטוי",
  determiner: "מילת יידוע",
  "modal verb": "פועל עזר",
  number: "מספר",
  interjection: "מילת קריאה",
};

// The example with the word itself in bold, so the eye lands on it. A
// phrase is matched whole ("gets up", not just "gets"), with the first word
// allowed to inflect (get → gets/getting) and the rest matched as written.
function highlight(sentence: string, word: string): ReactNode {
  const words = word.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return sentence;
  const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = words.map((w, i) => escape(w) + (i === 0 ? "\\w*" : "")).join("\\s+");
  const re = new RegExp(`(${pattern})`, "i");
  const parts = sentence.split(re);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-foreground font-bold">{part}</strong> : part));
}

export function SpeakButton({ text, label, size = "md" }: { text: string; label?: string; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={() => speak(text, 0.85)}
      aria-label={label ?? `השמעת ${text}`}
      className={`game-press shrink-0 inline-flex items-center justify-center rounded-lg border border-card-border text-primary hover:border-primary/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
        size === "sm" ? "w-8 h-8" : "w-10 h-10"
      }`}
    >
      <Volume2 size={size === "sm" ? 15 : 18} aria-hidden="true" />
    </button>
  );
}

interface WordRevealProps {
  word: WordInfo;
  verdict: "correct" | "wrong" | "timeout";
  // Compact = verdict + word + translation only (fast games, right answers).
  compact?: boolean;
  // When set, a "next" button (and Enter) moves on — the learner reads at
  // their own pace instead of racing an auto-advance.
  onNext?: () => void;
  nextLabel?: string;
}

export function WordReveal({ word, verdict, compact = false, onNext, nextLabel = "הבא" }: WordRevealProps) {
  const nextRef = useRef<HTMLButtonElement>(null);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });

  useEffect(() => {
    if (!onNext) return;
    nextRef.current?.focus({ preventScroll: true });
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && document.activeElement?.tagName !== "BUTTON") {
        e.preventDefault();
        onNextRef.current?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Bound once per reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const good = verdict === "correct";
  const VerdictIcon = good ? CheckCircle2 : verdict === "timeout" ? Clock : XCircle;
  const verdictText = good ? "נכון!" : verdict === "timeout" ? "נגמר הזמן" : "לא בדיוק. זו המילה:";
  const pos = word.partOfSpeech ? (POS_HE[word.partOfSpeech.toLowerCase()] ?? word.partOfSpeech) : null;

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, transform: "translateY(6px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`mt-5 rounded-lg border p-4 ${good ? "border-success/35 bg-success/[0.06]" : "border-danger/35 bg-danger/[0.05]"}`}
    >
      <p className={`flex items-center gap-1.5 text-sm font-bold ${good ? "text-success" : "text-danger"}`}>
        <VerdictIcon size={17} aria-hidden="true" />
        {verdictText}
      </p>

      <div className="mt-2.5 flex items-center gap-3">
        <SpeakButton text={word.headword} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <EnglishText className="text-xl font-bold">{word.headword}</EnglishText>
            {!compact && word.ipa && (
              <EnglishText className="text-sm text-muted">/{word.ipa.replace(/^\/|\/$/g, "")}/</EnglishText>
            )}
            {!compact && pos && <span className="text-xs text-muted">{pos}</span>}
          </p>
          <p className="text-muted leading-snug">{word.translationHe}</p>
        </div>
      </div>

      {!compact && word.exampleEn && (
        <EnglishText as="p" className="mt-3 text-[0.95rem] text-muted leading-relaxed border-t border-card-border pt-3">
          {highlight(word.exampleEn, word.headword)}
        </EnglishText>
      )}

      {onNext && (
        <button
          ref={nextRef}
          type="button"
          onClick={onNext}
          className="game-press mt-4 w-full inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {nextLabel}
          <CornerDownLeft size={15} aria-hidden="true" className="opacity-70 hidden sm:inline" />
        </button>
      )}
    </motion.div>
  );
}

// ---------- Countdown ----------

// A per-question clock. The bar drains in one linear CSS animation over the
// whole duration (remount it per question with a key) and freezes the
// moment the learner answers; the seconds read as a scoreboard numeral.
export function CountdownBar({ timeLeft, total, paused, warnAt = 3 }: { timeLeft: number; total: number; paused: boolean; warnAt?: number }) {
  const warn = timeLeft <= warnAt;
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="relative flex-1 h-2 rounded-full bg-background-2 overflow-hidden">
        <div
          className={`game-drain absolute inset-0 origin-right rounded-full transition-colors duration-300 ${warn ? "bg-danger" : "bg-accent"}`}
          style={{ ["--game-clock" as string]: `${total}s`, animationPlayState: paused ? "paused" : "running" }}
        />
      </div>
      <span className={`chyron text-2xl w-7 text-center tabular-nums ${warn ? "text-danger" : "text-foreground"}`}>{timeLeft}</span>
    </div>
  );
}

// ---------- Spelling tiles ----------

// The masked word as letter tiles: given letters are printed, blanks fill
// in live from what the learner types at that position, so they see the
// word assemble. After the verdict every tile shows the real word; after a
// wrong answer the letters that were missing are marked in green — the
// part to remember.
export function LetterTiles({ hint, typed, word, verdict }: { hint: string; typed: string; word: string; verdict: "correct" | "wrong" | null }) {
  const chars = hint.split("");
  // A phone row fits ~8 full-size tiles; longer words get smaller ones so
  // the word stays on one line instead of breaking mid-word.
  const size = chars.length > 11 ? "w-6 h-9 text-base" : chars.length > 8 ? "w-7 h-10 text-lg sm:w-9 sm:h-11 sm:text-xl" : "w-9 h-11 text-xl sm:w-10 sm:h-12 sm:text-2xl";
  return (
    <div dir="ltr" lang="en" aria-hidden="true" className="flex flex-wrap justify-center gap-1 sm:gap-1.5 font-content select-none">
      {chars.map((c, i) => {
        if (c === " ") return <span key={i} className="w-3" />;
        const blank = c === "_";
        const shown = verdict ? word[i] : blank ? (typed[i] ?? "") : c;
        return (
          <span
            key={i}
            className={`inline-flex items-center justify-center ${size} rounded-md font-bold transition-colors duration-150 ${
              verdict === "correct"
                ? "bg-success/15 text-success"
                : verdict === "wrong" && blank
                  ? "bg-success/10 text-success border border-success/45"
                  : blank
                    ? `border-2 ${shown ? "border-primary text-primary" : "border-dashed border-card-border"}`
                    : "bg-background-2 text-muted"
            }`}
          >
            {shown}
          </span>
        );
      })}
    </div>
  );
}

// ---------- Question text ----------

// Exercise prompts come in both languages: most MCQ prompts are Hebrew
// ("מה המילה באנגלית עבור …?"), definitions are English. Rendering a Hebrew
// prompt as left-to-right English text throws its quotes and question mark
// to the wrong end, so the direction follows the text itself.
export function PromptText({ text, className = "" }: { text: string; className?: string }) {
  if (/[֐-׿]/.test(text)) {
    return (
      <p dir="rtl" className={className}>
        {text}
      </p>
    );
  }
  return (
    <EnglishText as="p" className={className}>
      {text}
    </EnglishText>
  );
}
