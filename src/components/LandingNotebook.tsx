"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion/easing";
import { useReducedMotionPreference } from "@/lib/motion/reducedMotion";

// The hero's signature moment, drawn as the thing it actually is: the
// learner's mistakes notebook. Each spread is one real mistake. The English
// page gets the sentence written in, the teacher strikes the wrong word and
// writes the right one above it, the Hebrew page explains the rule and
// stamps it as saved, then the page turns to the next mistake.
//
// The page turns the way a Hebrew book does: the left leaf lifts off the
// spine and lands on the right. On phones the book opens top-and-bottom
// (one page over the other) and the bottom leaf flips up instead.
//
// What the server sends, and what reduced motion keeps, is the first spread
// fully written. The cycle starts from there, so nothing is ever hidden
// while waiting for scripts.
interface Entry {
  level: string;
  prefix: string;
  wrong: string;
  correct: string;
  suffix: string;
  he: string;
  // What lands in the mistakes notebook: the short name of the rule.
  rule: string;
}

const ENTRIES: Entry[] = [
  {
    level: "B1",
    prefix: "She has",
    wrong: "went",
    correct: "gone",
    suffix: "to bed already.",
    he: "אחרי has באה הצורה השלישית: gone, לא went.",
    rule: "has + gone",
  },
  {
    level: "A2",
    prefix: "She",
    wrong: "don't",
    correct: "doesn't",
    suffix: "like coffee in the morning.",
    he: "אחרי he, she, it משתמשים ב-doesn't, לא don't.",
    rule: "she doesn't",
  },
  {
    level: "B1",
    prefix: "I",
    wrong: "am agree",
    correct: "agree",
    suffix: "with your plan.",
    he: '"agree" הוא כבר פועל. אין צורך ב-am לפניו.',
    rule: "agree בלי am",
  },
  {
    level: "A2",
    prefix: "He is",
    wrong: "more taller",
    correct: "taller",
    suffix: "than his brother.",
    he: "כש-taller כבר משווה, לא מוסיפים לפניו more.",
    rule: "taller בלי more",
  },
];

type Phase = "write" | "strike" | "correct" | "explain" | "saved" | "read" | "turn";
const PHASES: Phase[] = ["write", "strike", "correct", "explain", "saved", "read", "turn"];

const WORD_STAGGER = 0.07;
const HE_WORD_STAGGER = 0.05;
const TURN_SECONDS = 1.1;

const words = (s: string) => s.split(" ").filter(Boolean);

function phaseDuration(phase: Phase, entry: Entry): number {
  switch (phase) {
    case "write":
      return (words(entry.prefix).length + words(entry.wrong).length + words(entry.suffix).length) * WORD_STAGGER * 1000 + 650;
    case "strike":
      return 550;
    case "correct":
      return 700;
    case "explain":
      return words(entry.he).length * HE_WORD_STAGGER * 1000 + 500;
    case "saved":
      return 500;
    case "read":
      return 2600;
    case "turn":
      return TURN_SECONDS * 1000 + 80;
  }
}

// How far each page has got. English: 0 ruled lines only, 1 written,
// 2 struck, 3 corrected. Hebrew: 0 header only, 1 explained, 2 saved.
const FULL_EN = 3;
const FULL_HE = 2;
function enStage(phase: Phase): number {
  return phase === "write" ? 1 : phase === "strike" ? 2 : 3;
}
function heStage(phase: Phase): number {
  return phase === "explain" ? 1 : phase === "saved" || phase === "read" || phase === "turn" ? 2 : 0;
}

// Side by side from sm up, one page over the other below it. Matches the
// `sm:` classes on the spread.
const WIDE_QUERY = "(min-width: 640px)";
function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true
  );
}

// Words inked in one after another. Plain inline spans, not inline-blocks:
// the paragraph keeps one bidi run, so English inside the Hebrew note
// ("he, she, it", "ב-doesn't") stays in its real order.
function Ink({ text, animateIn, stagger, start = 0 }: { text: string; animateIn: boolean; stagger: number; start?: number }) {
  return words(text).map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <motion.span
        className="whitespace-nowrap"
        initial={animateIn ? { opacity: 0, filter: "blur(3px)" } : false}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.3, ease: EASE_OUT, delay: (start + i) * stagger }}
      >
        {w}
      </motion.span>
    </Fragment>
  ));
}

function EnglishPage({ entry, stage, page, animateIn }: { entry: Entry; stage: number; page: number; animateIn: boolean }) {
  const pre = words(entry.prefix);
  const wrongDelay = pre.length * WORD_STAGGER;
  return (
    <div className="notebook-page notebook-page-en">
      <div className="notebook-head">
        <EnglishText className="text-xs font-bold tracking-wide notebook-muted">{entry.level}</EnglishText>
      </div>
      {stage > 0 && (
        <EnglishText as="p" className="notebook-line text-[17px] sm:text-lg lg:text-xl">
          <Ink text={entry.prefix} animateIn={animateIn} stagger={WORD_STAGGER} />{" "}
          <span className="relative inline-block whitespace-nowrap">
            <motion.span
              className={`inline-block transition-colors duration-300 ${stage >= 2 ? "notebook-muted" : ""}`}
              initial={animateIn ? { opacity: 0, filter: "blur(3px)" } : false}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: EASE_OUT, delay: wrongDelay }}
            >
              {entry.wrong}
            </motion.span>
            {/* The teacher's red line through the mistake. */}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ scaleX: stage >= 2 ? 1 : 0 }}
              transition={{ duration: animateIn ? 0.4 : 0, ease: EASE_OUT }}
              className="notebook-strike absolute inset-x-[-2px] top-[55%] h-[2px] origin-left rounded-full"
            />
            {/* And the right word written above it, in the teacher's blue. */}
            {stage >= 3 && (
              <motion.span
                initial={animateIn ? { opacity: 0, y: 6, clipPath: "inset(0 100% 0 0)" } : false}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
                className="notebook-pen absolute start-1/2 -translate-x-1/2 bottom-[78%] whitespace-nowrap text-[0.9em] font-bold leading-none"
              >
                {entry.correct}
              </motion.span>
            )}
          </span>
          {" "}
          <Ink text={entry.suffix} animateIn={animateIn} stagger={WORD_STAGGER} start={pre.length + 1} />
        </EnglishText>
      )}
      <span aria-hidden="true" className="notebook-folio start-5">
        {page}
      </span>
    </div>
  );
}

function HebrewPage({ entry, stage, page, animateIn }: { entry: Entry; stage: number; page: number; animateIn: boolean }) {
  return (
    <div className="notebook-page notebook-page-he" dir="rtl">
      <div className="notebook-head">
        <span className="text-sm lg:text-[15px] font-extrabold">מחברת הטעויות</span>
        <span className="text-xs font-bold notebook-muted">הדגמה</span>
      </div>
      {stage > 0 && (
        <p className="notebook-line text-[15px] sm:text-base lg:text-[17px]">
          <Ink text={entry.he} animateIn={animateIn} stagger={HE_WORD_STAGGER} />
        </p>
      )}
      {stage >= 2 && (
        <motion.p
          initial={animateIn ? { opacity: 0, scale: 1.25, rotate: -2 } : false}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="notebook-stamp mt-[calc(var(--nb-line)*0.25)] inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold"
        >
          <Check size={14} strokeWidth={3} aria-hidden="true" />
          נשמר: <span dir="auto">{entry.rule}</span>
        </motion.p>
      )}
      <span aria-hidden="true" className="notebook-folio start-5">
        {page}
      </span>
    </div>
  );
}

export default function LandingNotebook() {
  const reduceMotion = useReducedMotionPreference();
  const wide = useWide();
  const [index, setIndex] = useState(0);
  // Starts on the finished first spread, the same thing the server sent.
  const [phase, setPhase] = useState<Phase>("read");
  // Nothing animates in until the first page has turned, so hydration never
  // replays an entrance over content that was already on screen.
  const [cycled, setCycled] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  // Pause off screen and in a background tab: no point turning pages no one sees.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let inView = true;
    const update = () => setOnScreen(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const entry = ENTRIES[index];
  useEffect(() => {
    if (reduceMotion || !onScreen) return;
    const t = setTimeout(() => {
      const next = PHASES.indexOf(phase) + 1;
      if (next < PHASES.length) {
        if (PHASES[next] === "turn") setCycled(true);
        setPhase(PHASES[next]);
      } else {
        setIndex((i) => (i + 1) % ENTRIES.length);
        setPhase("write");
      }
    }, phaseDuration(phase, entry));
    return () => clearTimeout(t);
  }, [phase, entry, reduceMotion, onScreen]);

  const shown: Phase = reduceMotion ? "read" : phase;
  const animateIn = cycled && !reduceMotion;
  const turning = shown === "turn";
  const nextIndex = (index + 1) % ENTRIES.length;
  const next = ENTRIES[nextIndex];
  // The leaf that turns is the English page when the book lies open side by
  // side, the Hebrew page when it opens top-and-bottom. Under a turning leaf
  // the next spread's page is already waiting, blank.
  const turnsEnglish = wide;
  const folio = (i: number) => i * 2 + 1;

  const enPage =
    turning && turnsEnglish ? (
      <EnglishPage entry={next} stage={0} page={folio(nextIndex)} animateIn={false} />
    ) : (
      <EnglishPage entry={entry} stage={enStage(shown)} page={folio(index)} animateIn={animateIn} />
    );
  const hePage =
    turning && !turnsEnglish ? (
      <HebrewPage entry={next} stage={0} page={folio(nextIndex) + 1} animateIn={false} />
    ) : (
      <HebrewPage entry={entry} stage={heStage(shown)} page={folio(index) + 1} animateIn={animateIn} />
    );

  const axis = turnsEnglish ? "rotateY" : "rotateX";
  return (
    <div ref={rootRef} className="notebook-float mt-6 lg:mt-0">
      <div className="notebook">
        <div className="notebook-spread grid grid-rows-[1fr_1fr] sm:grid-rows-1 sm:grid-cols-2" dir="ltr">
          {enPage}
          {hePage}

          {turning && (
            <motion.div
              key={`leaf-${index}`}
              aria-hidden="true"
              className={`notebook-leaf ${turnsEnglish ? "notebook-leaf-side" : "notebook-leaf-bottom"}`}
              initial={{ [axis]: 0 }}
              animate={{ [axis]: 180 }}
              transition={{ duration: TURN_SECONDS, ease: EASE_IN_OUT }}
            >
              <div className="notebook-face">
                {turnsEnglish ? (
                  <EnglishPage entry={entry} stage={FULL_EN} page={folio(index)} animateIn={false} />
                ) : (
                  <HebrewPage entry={entry} stage={FULL_HE} page={folio(index) + 1} animateIn={false} />
                )}
                <motion.span
                  className="notebook-shade"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.22, 0.22] }}
                  transition={{ duration: TURN_SECONDS, times: [0, 0.5, 1], ease: "linear" }}
                />
              </div>
              <div className={`notebook-face ${turnsEnglish ? "notebook-face-back-y" : "notebook-face-back-x"}`}>
                {turnsEnglish ? (
                  <HebrewPage entry={next} stage={0} page={folio(nextIndex) + 1} animateIn={false} />
                ) : (
                  <EnglishPage entry={next} stage={0} page={folio(nextIndex)} animateIn={false} />
                )}
                <motion.span
                  className="notebook-shade"
                  initial={{ opacity: 0.22 }}
                  animate={{ opacity: [0.22, 0.22, 0] }}
                  transition={{ duration: TURN_SECONDS, times: [0, 0.5, 1], ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          <span aria-hidden="true" className="notebook-spine" />
        </div>
      </div>
    </div>
  );
}
