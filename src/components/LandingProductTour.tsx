"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  Headphones,
  Link2,
  PenTool,
  MessageCircle,
  Play,
  Snail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { speak } from "@/lib/speech/browserTts";

// "See it from the inside": the actual kinds of practice, each a small
// working exercise inside a phone, so a visitor tries the product instead
// of reading about it. All content here is sample content written for
// this page; nothing is saved and nothing needs an account.

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type TabId = "reading" | "listening" | "vocabulary" | "spelling" | "teacher";

const TABS: { id: TabId; icon: LucideIcon; title: string; body: string }[] = [
  { id: "reading", icon: BookOpenText, title: "קריאה", body: "טקסטים מקוריים בכל רמה. נוגעים במילה ורואים תרגום, ובסוף שאלות הבנה." },
  { id: "listening", icon: Headphones, title: "האזנה", body: "שומעים שיחה, מאטים אותה, ומציגים את הטקסט רק כשצריך." },
  { id: "vocabulary", icon: Link2, title: "אוצר מילים", body: "מחברים כל מילה לפירוש שלה. מילה שטעיתם בה חוזרת אליכם בחזרה החכמה." },
  { id: "spelling", icon: PenTool, title: "איות", body: "בונים את המילה אות אחר אות, כדי לזכור אותה גם בכתיבה." },
  { id: "teacher", icon: MessageCircle, title: "מורה AI", body: "מדברים חופשי. המורה מתקן תוך כדי שיחה, בלי לעצור אותה." },
];

export default function LandingProductTour() {
  const [tab, setTab] = useState<TabId>("reading");
  const [touched, setTouched] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);

  // On phones the tabs are one sideways row: keep the active one in view,
  // but only while the row itself is on screen, so the page never jumps.
  useEffect(() => {
    const list = tablistRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !active) return;
    const r = list.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) return;
    active.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [tab]);

  // Until the visitor picks a tab, the tour walks through them on its own.
  useEffect(() => {
    if (touched) return;
    const t = setTimeout(() => {
      const i = TABS.findIndex((x) => x.id === tab);
      setTab(TABS[(i + 1) % TABS.length].id);
    }, 7000);
    return () => clearTimeout(t);
  }, [tab, touched]);

  return (
    <section aria-labelledby="tour-title" className="relative overflow-hidden bg-background-2 px-4 py-20 sm:py-24">
      <div className="max-w-6xl mx-auto grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        {/* min-w-0: the tab row scrolls sideways on phones instead of
            stretching the column past the screen. */}
        <div className="min-w-0">
          <h2 id="tour-title" className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
            ככה זה נראה מבפנים
          </h2>
          <p className="mt-3 max-w-lg text-lg text-muted leading-relaxed">
            לא צילומי מסך: אלה התרגילים עצמם. בחרו סוג תרגול ונסו אותו כאן, בתוך הטלפון.
          </p>

          <div ref={tablistRef} role="tablist" aria-label="סוגי תרגול" className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-1 lg:px-0 xl:grid-cols-2">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  id={`tour-tab-${t.id}`}
                  aria-selected={active}
                  aria-controls="tour-panel"
                  onClick={() => {
                    setTouched(true);
                    setTab(t.id);
                  }}
                  className={`game-press relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-lg border p-2.5 pe-4 text-start lg:shrink lg:items-start lg:gap-3 lg:p-4 transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                    active ? "border-primary bg-card shadow-[0_14px_30px_-20px_rgb(0_0_0/0.45)]" : "border-transparent hover:bg-card/70"
                  }`}
                >
                  <span
                    className={`inline-flex w-9 h-9 lg:w-10 lg:h-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                      active ? "bg-primary text-primary-ink" : "bg-card text-primary"
                    }`}
                  >
                    <t.icon size={19} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{t.title}</span>
                    <span className="mt-0.5 hidden text-sm text-muted leading-snug lg:block">{t.body}</span>
                  </span>
                  {/* While the tour plays by itself, the active tab shows its timer. */}
                  {active && !touched && (
                    <motion.span
                      key={tab}
                      aria-hidden="true"
                      className="absolute bottom-0 start-0 h-0.5 bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 7, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Phone>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              id="tour-panel"
              role="tabpanel"
              aria-labelledby={`tour-tab-${tab}`}
              initial={{ opacity: 0, transform: "translateY(10px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-6px)" }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="h-full"
              onPointerDown={() => setTouched(true)}
            >
              {tab === "reading" && <ReadingDemo />}
              {tab === "listening" && <ListeningDemo />}
              {tab === "vocabulary" && <MatchDemo />}
              {tab === "spelling" && <SpellingDemo />}
              {tab === "teacher" && <TeacherDemo />}
            </motion.div>
          </AnimatePresence>
        </Phone>
      </div>
    </section>
  );
}

// ---------- Frame ----------

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[19.5rem] shrink-0">
      <div className="relative rounded-[2.75rem] bg-[#0d0f14] p-2.5 ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)]">
        <div className="relative h-[37rem] overflow-hidden rounded-[2.2rem] bg-background">
          {/* Status bar + island */}
          <div aria-hidden="true" className="flex items-center justify-between px-6 pt-3 text-[0.65rem] font-bold text-foreground/70" dir="ltr">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-[#0d0f14]" />
            <span className="flex gap-0.5">
              <span className="h-2 w-1 rounded-sm bg-foreground/60" />
              <span className="h-2.5 w-1 rounded-sm bg-foreground/60" />
              <span className="h-3 w-1 rounded-sm bg-foreground/60" />
            </span>
          </div>
          <div aria-hidden="true" className="mt-2 flex items-center justify-between border-b border-card-border px-4 pb-2.5">
            <span className="font-black text-primary">saylo</span>
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-background-2">
              <span className="block h-full w-2/3 rounded-full bg-primary" />
            </span>
          </div>
          <div className="h-[calc(100%-4.75rem)] overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Shared bits ----------

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold text-muted">{children}</p>;
}

function Options({
  options,
  correct,
  english = false,
  onAnswer,
}: {
  options: string[];
  correct: number;
  english?: boolean;
  onAnswer?: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="mt-3 space-y-2">
      {options.map((o, i) => {
        const state = picked === null ? "idle" : i === correct ? "right" : i === picked ? "wrong" : "dim";
        return (
          <button
            key={o}
            type="button"
            disabled={picked !== null}
            onClick={() => {
              setPicked(i);
              onAnswer?.(i === correct);
            }}
            dir={english ? "ltr" : undefined}
            className={`game-press flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-[background-color,border-color,opacity,transform] duration-150 ${
              state === "right"
                ? "border-success bg-success/12 text-success"
                : state === "wrong"
                  ? "border-danger bg-danger/10 text-danger"
                  : state === "dim"
                    ? "border-card-border opacity-50"
                    : "border-card-border bg-card hover:border-primary/50"
            }`}
          >
            <span className={english ? "text-left" : "text-right"}>{o}</span>
            {state === "right" && <CheckCircle2 size={16} aria-hidden="true" />}
            {state === "wrong" && <XCircle size={16} aria-hidden="true" />}
          </button>
        );
      })}
      {picked !== null && (
        <motion.p
          initial={{ opacity: 0, transform: "translateY(4px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className={`text-sm font-bold ${picked === correct ? "text-success" : "text-danger"}`}
        >
          {picked === correct ? "נכון! +10 XP" : "כמעט. התשובה הנכונה מסומנת בירוק."}
        </motion.p>
      )}
    </div>
  );
}

// ---------- Reading ----------

const GLOSS: Record<string, string> = { empty: "ריק", asleep: "ישנה", avoiding: "נמנעה מ-" };

function ReadingDemo() {
  const [open, setOpen] = useState<string | null>("empty");
  const word = (w: string) => (
    <button
      type="button"
      onClick={() => setOpen(open === w ? null : w)}
      className={`relative rounded px-0.5 font-semibold underline decoration-primary/60 decoration-2 underline-offset-4 ${open === w ? "bg-primary/15 text-primary" : ""}`}
    >
      {w}
      {open === w && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-bold text-background shadow-lg" dir="rtl">
          {GLOSS[w]}
        </span>
      )}
    </button>
  );
  return (
    <div>
      <Kicker>קריאה · B1</Kicker>
      <h3 className="mt-1 text-lg font-black" dir="ltr">
        The Letter
      </h3>
      <p dir="ltr" lang="en" className="mt-2 rounded-lg bg-card p-3 text-[0.9rem] leading-7 text-left border border-card-border">
        Maya opened the window and looked at the {word("empty")} street. It was early, and the city was still {word("asleep")}. She
        made a coffee, sat down, and began the letter she had been {word("avoiding")} for weeks.
      </p>
      <p className="mt-4 text-sm font-bold" dir="ltr">
        Why was the street empty?
      </p>
      <Options english correct={0} options={["It was very early.", "It was raining.", "It was a holiday.", "Everyone was at work."]} />
    </div>
  );
}

// ---------- Listening ----------

const DIALOGUE: [string, string][] = [
  ["A", "Hi, I'd like to book a table for two, please."],
  ["B", "Of course. For what time?"],
  ["A", "Around eight, if that's possible."],
  ["B", "Eight is fine. Can I have your name?"],
];

function ListeningDemo() {
  const [showText, setShowText] = useState(false);
  const [playing, setPlaying] = useState(false);
  const runId = useRef(0);

  function play(rate: number) {
    const id = ++runId.current;
    setPlaying(true);
    const say = (i: number) => {
      if (id !== runId.current) return;
      if (i >= DIALOGUE.length) return setPlaying(false);
      speak(DIALOGUE[i][1], rate, () => say(i + 1));
    };
    say(0);
  }
  useEffect(
    () => () => {
      runId.current++;
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  return (
    <div>
      <Kicker>האזנה · A2</Kicker>
      <h3 className="mt-1 text-lg font-black" dir="ltr">
        Booking a Table
      </h3>
      <div className="mt-3 rounded-lg bg-primary p-4 text-primary-ink">
        <div className="flex h-10 items-center justify-center gap-1" aria-hidden="true">
          {[30, 60, 90, 55, 100, 70, 40, 85, 50, 30, 65, 45].map((h, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full bg-primary-ink/85 ${playing ? "studio-bar" : ""}`}
              style={{ height: playing ? `${h}%` : "20%", animationDelay: `${i * 70}ms`, transition: "height 200ms ease-out" }}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs font-bold">
          <button type="button" onClick={() => play(0.95)} className="game-press inline-flex items-center justify-center gap-1 rounded-md bg-background py-2 text-foreground">
            <Play size={13} aria-hidden="true" className="fill-current" /> נגן
          </button>
          <button type="button" onClick={() => play(0.6)} className="game-press inline-flex items-center justify-center gap-1 rounded-md bg-primary-ink/15 py-2">
            <Snail size={13} aria-hidden="true" /> לאט
          </button>
          <button type="button" onClick={() => setShowText((s) => !s)} className="game-press inline-flex items-center justify-center gap-1 rounded-md bg-primary-ink/15 py-2">
            {showText ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
            {showText ? "הסתר" : "טקסט"}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {showText && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            dir="ltr"
            lang="en"
            className="mt-2 space-y-1 overflow-hidden text-left text-[0.82rem] leading-snug"
          >
            {DIALOGUE.map(([who, line]) => (
              <li key={line}>
                <span className="font-bold text-primary">{who}:</span> {line}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <p className="mt-4 text-sm font-bold">לאיזו שעה הם רוצים את השולחן?</p>
      <Options correct={1} options={["שבע", "שמונה", "תשע", "שתיים"]} />
    </div>
  );
}

// ---------- Vocabulary match ----------

const PAIRS: [string, string][] = [
  ["borrow", "ללוות"],
  ["journey", "מסע"],
  ["careful", "זהיר"],
  ["improve", "לשפר"],
];
const RIGHT_ORDER = [2, 0, 3, 1];

function MatchDemo() {
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [miss, setMiss] = useState<number | null>(null);

  function pickRight(i: number) {
    if (left === null) return;
    if (i === left) {
      setDone((d) => [...d, i]);
      setLeft(null);
    } else {
      setMiss(i);
      setTimeout(() => setMiss(null), 450);
    }
  }
  const finished = done.length === PAIRS.length;

  return (
    <div>
      <Kicker>אוצר מילים · B1</Kicker>
      <h3 className="mt-1 text-lg font-black">חברו כל מילה לפירוש</h3>
      <p className="text-xs text-muted">בוחרים מילה באנגלית, ואז את הפירוש שלה</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="space-y-2" dir="ltr">
          {PAIRS.map(([en], i) => (
            <button
              key={en}
              type="button"
              disabled={done.includes(i)}
              onClick={() => setLeft(i)}
              className={`game-press w-full rounded-lg border px-2 py-2.5 text-sm font-bold transition-[background-color,border-color,opacity,transform] duration-150 ${
                done.includes(i)
                  ? "border-success/50 bg-success/10 text-success"
                  : left === i
                    ? "border-primary bg-primary/12 text-primary"
                    : "border-card-border bg-card"
              }`}
            >
              {en}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {RIGHT_ORDER.map((i) => (
            <button
              key={PAIRS[i][1]}
              type="button"
              disabled={done.includes(i)}
              onClick={() => pickRight(i)}
              className={`game-press w-full rounded-lg border px-2 py-2.5 text-sm font-bold transition-[background-color,border-color,opacity,transform] duration-150 ${
                done.includes(i)
                  ? "border-success/50 bg-success/10 text-success"
                  : miss === i
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-card-border bg-card"
              }`}
            >
              {PAIRS[i][1]}
            </button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-success/12 px-3 py-2.5 text-sm font-bold text-success">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={16} aria-hidden="true" /> כל הזוגות נכונים
          </span>
          <button type="button" onClick={() => setDone([])} className="inline-flex items-center gap-1 text-xs text-foreground">
            <RotateCcw size={13} aria-hidden="true" /> שוב
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Spelling ----------

const WORD = "kitchen";
const MASK = "k_tch_n";
const LETTERS = ["e", "a", "i", "o"];

function SpellingDemo() {
  const [typed, setTyped] = useState<string[]>([]);
  const blanks = [...MASK].map((c, i) => (c === "_" ? i : -1)).filter((i) => i >= 0);
  const filled = typed.length === blanks.length;
  const correct = filled && blanks.every((pos, k) => typed[k] === WORD[pos]);

  return (
    <div>
      <Kicker>איות · A2</Kicker>
      <h3 className="mt-1 text-lg font-black">אילו אותיות חסרות?</h3>
      <p className="text-sm text-muted">מטבח</p>
      <div dir="ltr" className="mt-6 flex justify-center gap-1.5 font-content">
        {[...MASK].map((c, i) => {
          const k = blanks.indexOf(i);
          const shown = c === "_" ? (typed[k] ?? "") : c;
          return (
            <span
              key={i}
              className={`inline-flex w-9 h-11 items-center justify-center rounded-md text-xl font-bold transition-colors duration-150 ${
                filled
                  ? correct
                    ? "bg-success/15 text-success"
                    : c === "_"
                      ? "bg-danger/10 text-danger border border-danger/40"
                      : "bg-background-2 text-muted"
                  : c === "_"
                    ? `border-2 ${shown ? "border-primary text-primary" : "border-dashed border-card-border"}`
                    : "bg-background-2 text-muted"
              }`}
            >
              {shown}
            </span>
          );
        })}
      </div>
      <div dir="ltr" className="mt-6 flex justify-center gap-2">
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            disabled={filled}
            onClick={() => setTyped((t) => [...t, l])}
            className="game-press inline-flex w-12 h-12 items-center justify-center rounded-lg border-2 border-card-border bg-card text-xl font-bold transition-[border-color,transform] duration-150 hover:border-primary/60 disabled:opacity-40"
          >
            {l}
          </button>
        ))}
      </div>
      {filled && (
        <div className={`mt-5 rounded-lg px-3 py-2.5 text-sm font-bold ${correct ? "bg-success/12 text-success" : "bg-danger/10 text-danger"}`}>
          <p>{correct ? "מצוין! kitchen" : "לא בדיוק. נכון: kitchen"}</p>
          <button type="button" onClick={() => setTyped([])} className="mt-1 inline-flex items-center gap-1 text-xs text-foreground">
            <RotateCcw size={13} aria-hidden="true" /> לנסות שוב
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- AI teacher ----------

const CHAT: { from: "me" | "teacher"; text: string; fix?: [string, string] }[] = [
  { from: "me", text: "Yesterday I go to the beach with my friends." },
  { from: "teacher", text: "Sounds fun! Small fix: “I went”, because it happened yesterday. What did you do there?", fix: ["go", "went"] },
  { from: "me", text: "We went swimming and ate ice cream." },
  { from: "teacher", text: "Perfect past tense this time. Was the water cold?" },
];

function TeacherDemo() {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= CHAT.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 1400);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="flex h-full flex-col">
      <Kicker>שיחה עם המורה · B1</Kicker>
      <div className="mt-3 flex-1 space-y-2.5" dir="ltr" lang="en">
        {CHAT.slice(0, shown).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, transform: "translateY(8px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.85rem] leading-snug ${
              m.from === "me" ? "ms-auto rounded-br-md bg-primary text-primary-ink" : "rounded-bl-md bg-card border border-card-border"
            }`}
          >
            {m.text}
            {m.fix && (
              <span className="mt-1.5 flex items-center gap-1.5 text-xs font-bold">
                <span className="rounded bg-danger/12 px-1.5 py-0.5 text-danger line-through">{m.fix[0]}</span>
                <span aria-hidden="true">→</span>
                <span className="rounded bg-success/15 px-1.5 py-0.5 text-success">{m.fix[1]}</span>
              </span>
            )}
          </motion.div>
        ))}
        {shown < CHAT.length && (
          <div className="flex w-14 gap-1 rounded-2xl rounded-bl-md border border-card-border bg-card px-3 py-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>
      {shown >= CHAT.length && (
        <button
          type="button"
          onClick={() => setShown(1)}
          className="mt-3 inline-flex items-center justify-center gap-1 self-center text-xs font-bold text-muted"
        >
          <RotateCcw size={13} aria-hidden="true" /> להתחיל מחדש
        </button>
      )}
    </div>
  );
}
