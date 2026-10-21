"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
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
      // Driven by the turn animation itself, never by a timer.
      return Infinity;
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
  // A mouse resting on the book holds the page: whoever is reading it decides.
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);

  // How far the leaf has turned, 0 (flat on its own side) to 180 (landed).
  const angle = useMotionValue(0);
  const turnAnim = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<{ x: number; y: number; from: number; moved: boolean } | null>(null);
  const peeking = useRef(false);
  const frontShade = useTransform(angle, [0, 90, 180], [0, 0.22, 0.22]);
  const backShade = useTransform(angle, [0, 90, 180], [0.22, 0.22, 0]);

  // The book leans toward the pointer, like picking it up off a desk.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 18 });
  const shadowX = useTransform(rotateY, (v) => v * -1.6);
  const ribbonSwing = useTransform(rotateY, (v) => v * 0.5);

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

  useEffect(() => () => turnAnim.current?.stop(), []);

  const nextIndex = (index + 1) % ENTRIES.length;

  // Turn the leaf to an angle. 180 lands it and moves the book on to the next
  // mistake; 0 lays it back down; anything between holds it there (a peek).
  function turnTo(target: number, seconds?: number) {
    turnAnim.current?.stop();
    setCycled(true);
    setPhase("turn");
    const distance = Math.abs(target - angle.get()) / 180;
    const controls = animate(angle, target, {
      duration: seconds ?? Math.max(0.25, TURN_SECONDS * distance),
      ease: EASE_IN_OUT,
    });
    turnAnim.current = controls;
    controls.then(() => {
      // A newer turn took over: it decides what happens next.
      if (turnAnim.current !== controls) return;
      if (target === 180) {
        angle.set(0);
        setIndex((i) => (i + 1) % ENTRIES.length);
        setPhase("write");
      } else if (target === 0) {
        setPhase("read");
      }
    });
  }

  function nextPage() {
    if (reduceMotion) {
      setIndex((i) => (i + 1) % ENTRIES.length);
      return;
    }
    if (phase === "turn" && !peeking.current) return;
    peeking.current = false;
    turnTo(180);
  }

  const entry = ENTRIES[index];
  useEffect(() => {
    if (reduceMotion || !onScreen || phase === "turn") return;
    if (phase === "read" && hovered) return;
    const t = setTimeout(() => {
      const next = PHASES[PHASES.indexOf(phase) + 1];
      if (next === "turn") turnTo(180);
      else setPhase(next);
    }, phaseDuration(phase, entry));
    return () => clearTimeout(t);
    // turnTo only touches refs, motion values and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, entry, reduceMotion, onScreen, hovered]);

  // The leaf is the English page when the book lies open side by side, the
  // Hebrew page when it opens top-and-bottom.
  const turnsEnglish = wide;

  function inTurningHalf(e: React.PointerEvent) {
    const r = spreadRef.current?.getBoundingClientRect();
    if (!r) return false;
    return turnsEnglish ? e.clientX < r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
  }

  function onPointerMove(e: React.PointerEvent) {
    const r = spreadRef.current?.getBoundingClientRect();
    if (!r || reduceMotion) return;
    if (e.pointerType === "mouse") {
      tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 14);
      tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -10);
    }
    const d = drag.current;
    if (d) {
      const delta = turnsEnglish ? (e.clientX - d.x) / (r.width / 2) : (d.y - e.clientY) / (r.height / 2);
      if (Math.abs(delta) > 0.03) d.moved = true;
      if (d.moved) angle.set(Math.min(180, Math.max(0, d.from + delta * 170)));
      return;
    }
    // A mouse over the turning page lifts its corner: it can be turned.
    if (e.pointerType !== "mouse") return;
    const over = inTurningHalf(e);
    if (over && !peeking.current && phase === "read") {
      peeking.current = true;
      turnTo(30, 0.4);
    } else if (!over && peeking.current) {
      peeking.current = false;
      turnTo(0, 0.3);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (reduceMotion || e.button !== 0) return;
    // A turn already on its way is left to finish.
    if (phase === "turn" && !peeking.current) return;
    turnAnim.current?.stop();
    turnAnim.current = null;
    drag.current = { x: e.clientX, y: e.clientY, from: angle.get(), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setCycled(true);
    setPhase("turn");
  }

  function onPointerUp(e: React.PointerEvent) {
    if (reduceMotion) {
      if (e.button === 0) nextPage();
      return;
    }
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    peeking.current = false;
    // A tap turns the page; a drag lands it once it is a third of the way over.
    turnTo(!d.moved || angle.get() > 60 ? 180 : 0);
  }

  function onPointerCancel() {
    // The browser took the gesture (a phone scrolling): lay the page back.
    if (!drag.current) return;
    drag.current = null;
    peeking.current = false;
    turnTo(0);
  }

  function onPointerLeave() {
    setHovered(false);
    tiltX.set(0);
    tiltY.set(0);
    if (peeking.current && !drag.current) {
      peeking.current = false;
      turnTo(0, 0.3);
    }
  }

  const shown: Phase = reduceMotion ? "read" : phase;
  const animateIn = cycled && !reduceMotion;
  const turning = shown === "turn";
  const next = ENTRIES[nextIndex];
  const folio = (i: number) => i * 2 + 1;

  // Under a turning leaf the next spread's page is already waiting, blank.
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

  return (
    <div className="mt-6 lg:mt-0">
      <div
        ref={rootRef}
        className="notebook-float"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={onPointerLeave}
      >
        <motion.span aria-hidden="true" className="notebook-ground" style={{ x: shadowX }} />
        <motion.div className="notebook-tilt" style={{ rotateX, rotateY }}>
          <div className="notebook">
            <div
              ref={spreadRef}
              className="notebook-spread grid grid-rows-[1fr_1fr] sm:grid-rows-1 sm:grid-cols-2"
              dir="ltr"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              {enPage}
              {hePage}
              {/* The ribbon bookmark, under the turning leaf, swaying a little as the book tilts. */}
              <motion.span aria-hidden="true" className="notebook-ribbon" style={{ rotate: ribbonSwing }} />

              {turning && (
                <motion.div
                  key={`leaf-${index}`}
                  aria-hidden="true"
                  className={`notebook-leaf ${turnsEnglish ? "notebook-leaf-side" : "notebook-leaf-bottom"}`}
                  style={turnsEnglish ? { rotateY: angle } : { rotateX: angle }}
                >
                  <div className="notebook-face">
                    {turnsEnglish ? (
                      <EnglishPage entry={entry} stage={FULL_EN} page={folio(index)} animateIn={false} />
                    ) : (
                      <HebrewPage entry={entry} stage={FULL_HE} page={folio(index) + 1} animateIn={false} />
                    )}
                    <motion.span className="notebook-shade" style={{ opacity: frontShade }} />
                  </div>
                  <div className={`notebook-face ${turnsEnglish ? "notebook-face-back-y" : "notebook-face-back-x"}`}>
                    {turnsEnglish ? (
                      <HebrewPage entry={next} stage={0} page={folio(nextIndex) + 1} animateIn={false} />
                    ) : (
                      <EnglishPage entry={next} stage={0} page={folio(nextIndex)} animateIn={false} />
                    )}
                    <motion.span className="notebook-shade" style={{ opacity: backShade }} />
                  </div>
                </motion.div>
              )}

              <span aria-hidden="true" className="notebook-spine" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-9 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={nextPage}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-ink/35 px-3.5 py-2 text-sm font-bold text-primary-ink transition-colors hover:bg-primary-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          לטעות הבאה
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <span className="hidden text-sm font-medium text-primary-ink/90 sm:inline">או גררו את הדף</span>
      </div>
    </div>
  );
}
