"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Trophy, Timer } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { recordGameAnswer } from "@/lib/games/recordGameAnswer";
import { getMatchPairs, type MatchPair, type MatchRoundType } from "@/lib/games/matchContent";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import HeartsGate from "@/components/HeartsGate";
import IconBadge from "@/components/IconBadge";
import MotionLink from "@/components/MotionLink";
import EnglishText from "@/components/EnglishText";

interface LevelConfig {
  type: MatchRoundType;
  label: string;
  instruction: string;
  pairCount: number;
  seconds: number;
}

const LEVELS: LevelConfig[] = [
  { type: "translation", label: "תרגום", instruction: "התאימו כל מילה באנגלית לתרגום שלה", pairCount: 5, seconds: 45 },
  { type: "opposites", label: "הפכים", instruction: "התאימו כל מילה להפך שלה", pairCount: 5, seconds: 40 },
  { type: "sentences", label: "משפטים", instruction: "התאימו כל מילה למשפט שמשתמש בה", pairCount: 4, seconds: 55 },
];

const DRAG_THRESHOLD = 8;

function lineCoords(el: HTMLElement | undefined, containerRect: DOMRect) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: r.left - containerRect.left + r.width / 2,
    y: r.top - containerRect.top + r.height / 2,
  };
}

type Phase = "loading" | "empty" | "playing" | "levelUp" | "finished";

// A drag/tap can now originate from either column — "source" (id = pair
// id) or "target" (id = the target's display value) — so selection and
// drag state are tracked generically instead of assuming the right-hand
// column is always where interaction starts.
type Endpoint = { side: "source"; id: string } | { side: "target"; id: string };

export default function MatchGamePage() {
  const { profile, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [levelIndex, setLevelIndex] = useState(0);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [targetOrder, setTargetOrder] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [wrongPulse, setWrongPulse] = useState<{ sourceId: string; target: string } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [dragLine, setDragLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const correctCountRef = useRef(0);
  const totalAttemptsRef = useRef(0);
  const xpAwardedRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<{ endpoint: Endpoint; startX: number; startY: number; isDragging: boolean } | null>(null);
  const matchedIdsRef = useRef<Set<string>>(new Set());
  const selectedEndpointRef = useRef<Endpoint | null>(null);

  const level = LEVELS[levelIndex];

  // Pure fetch, no setState — searching forward from `fromIdx` for the
  // first level with enough content to actually play. Kept side-effect
  // free so it's safe to call straight from an effect's .then(); the
  // caller applies the result to state itself.
  async function findPlayableLevel(fromIdx: number, profileId: string) {
    for (let i = fromIdx; i < LEVELS.length; i++) {
      const cfg = LEVELS[i];
      const fetched = await getMatchPairs(cfg.type, profileId, cfg.pairCount);
      if (fetched.length >= 3) return { levelIdx: i, cfg, pairs: fetched };
    }
    return null;
  }

  function applyLevel(found: { levelIdx: number; cfg: LevelConfig; pairs: MatchPair[] } | null) {
    if (!found) {
      // No level had enough content to play.
      setPhase(correctCountRef.current > 0 || totalAttemptsRef.current > 0 ? "finished" : "empty");
      return;
    }
    setLevelIndex(found.levelIdx);
    setPairs(found.pairs);
    setTargetOrder(shuffle(found.pairs.map((p) => p.target)));
    setMatchedIds(new Set());
    matchedIdsRef.current = new Set();
    setSelectedEndpoint(null);
    selectedEndpointRef.current = null;
    setTimeLeft(found.cfg.seconds);
    setPhase("playing");
  }

  useEffect(() => {
    if (!profile) return;
    findPlayableLevel(0, profile.id).then(applyLevel);
  }, [profile]);

  // Countdown — active only while a level is actually in play.
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  async function finishGame() {
    playCompleteSound();
    setPhase("finished");
    if (profile) {
      await supabase.from("vocabulary_game_sessions").insert({
        profile_id: profile.id,
        game_type: "match",
        total_questions: totalAttemptsRef.current,
        correct_count: correctCountRef.current,
        xp_awarded: xpAwardedRef.current,
      });
    }
  }

  async function attemptMatch(sourceId: string, targetValue: string) {
    if (matchedIdsRef.current.has(sourceId) || !profile) return;
    const pair = pairs.find((p) => p.id === sourceId);
    if (!pair) return;

    totalAttemptsRef.current += 1;
    const isCorrect = pair.target === targetValue;

    if (isCorrect) {
      playCorrectSound();
      correctCountRef.current += 1;
      const next = new Set(matchedIdsRef.current);
      next.add(sourceId);
      matchedIdsRef.current = next;
      setMatchedIds(next);
      setSelectedEndpoint(null);
      selectedEndpointRef.current = null;
      setAnnouncement(`נכון! ${pair.source} = ${pair.target}`);
      try {
        const res = await recordGameAnswer(profile.id, sourceId, true, "vocab_game_match");
        xpAwardedRef.current += res.xpAwarded;
      } catch (err) {
        console.error("recordGameAnswer failed", err);
      }

      if (next.size === pairs.length) {
        setPhase("levelUp");
        setTimeout(async () => {
          if (levelIndex + 1 >= LEVELS.length) {
            finishGame();
          } else {
            applyLevel(await findPlayableLevel(levelIndex + 1, profile.id));
          }
        }, 1100);
      }
    } else {
      playIncorrectSound();
      setWrongPulse({ sourceId, target: targetValue });
      setSelectedEndpoint(null);
      selectedEndpointRef.current = null;
      setAnnouncement("לא נכון, נסו שוב");
      try {
        const res = await recordGameAnswer(profile.id, sourceId, false, "vocab_game_match");
        xpAwardedRef.current += res.xpAwarded;
      } catch (err) {
        console.error("recordGameAnswer failed", err);
      }
      setTimeout(() => setWrongPulse(null), 450);
    }
  }

  // The window-level pointermove/pointerup listeners below are added once
  // per drag gesture and must stay referentially stable for the whole
  // gesture (so removeEventListener actually removes what was added) —
  // but they still need to call the *current* render's attemptMatch
  // (closing over this render's pairs/profile/levelIndex). This ref is
  // the bridge: always kept current, read instead of closing over
  // attemptMatch directly.
  const attemptMatchRef = useRef(attemptMatch);
  attemptMatchRef.current = attemptMatch;

  function isEndpointMatched(endpoint: Endpoint): boolean {
    if (endpoint.side === "source") return matchedIds.has(endpoint.id);
    return pairs.some((p) => matchedIds.has(p.id) && p.target === endpoint.id);
  }

  // Bound to both columns now — either side can start a drag or a tap,
  // and the other side completes it, matching how a real user naturally
  // expects a two-column matching game to work.
  function handleEndpointPointerDown(endpoint: Endpoint, e: React.PointerEvent) {
    if (isEndpointMatched(endpoint) || phase !== "playing") return;
    dragStateRef.current = { endpoint, startX: e.clientX, startY: e.clientY, isDragging: false };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  // The tap-to-select half of the pointer-up logic below, pulled out so
  // keyboard activation (Enter/Space) can reuse it — these cards are plain
  // divs with only pointer handlers, so without this a keyboard or screen
  // reader user has no way to play this game at all.
  function handleEndpointTap(endpoint: Endpoint) {
    const current = selectedEndpointRef.current;
    if (current && current.side !== endpoint.side) {
      const sourceId = current.side === "source" ? current.id : endpoint.id;
      const targetValue = current.side === "target" ? current.id : endpoint.id;
      selectedEndpointRef.current = null;
      setSelectedEndpoint(null);
      attemptMatchRef.current(sourceId, targetValue);
    } else if (current && current.side === endpoint.side && current.id === endpoint.id) {
      selectedEndpointRef.current = null;
      setSelectedEndpoint(null);
    } else {
      selectedEndpointRef.current = endpoint;
      setSelectedEndpoint(endpoint);
    }
  }

  function handleEndpointKeyDown(endpoint: Endpoint, e: React.KeyboardEvent) {
    if (isEndpointMatched(endpoint) || phase !== "playing") return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEndpointTap(endpoint);
    }
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const drag = dragStateRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragStateRef.current = { ...drag, isDragging: true };
    }
    if (dragStateRef.current?.isDragging) {
      const rect = container.getBoundingClientRect();
      const refMap = drag.endpoint.side === "source" ? sourceRefs.current : targetRefs.current;
      const start = lineCoords(refMap.get(drag.endpoint.id), rect);
      if (start) {
        setDragLine({ x1: start.x, y1: start.y, x2: e.clientX - rect.left, y2: e.clientY - rect.top });
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    setDragLine(null);
    if (!drag) return;

    if (drag.isDragging) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (drag.endpoint.side === "source") {
        const targetEl = el?.closest<HTMLElement>("[data-target-value]");
        const targetValue = targetEl?.dataset.targetValue;
        if (targetValue) attemptMatchRef.current(drag.endpoint.id, targetValue);
      } else {
        const sourceEl = el?.closest<HTMLElement>("[data-source-id]");
        const sourceId = sourceEl?.dataset.sourceId;
        if (sourceId) attemptMatchRef.current(sourceId, drag.endpoint.id);
      }
    } else {
      handleEndpointTap(drag.endpoint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading || phase === "loading") {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען מילים...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Link2} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למשחק</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  if (phase === "finished") {
    const accuracy = totalAttemptsRef.current > 0 ? Math.round((correctCountRef.current / totalAttemptsRef.current) * 100) : 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">משחק ההתאמה הושלם!</h1>
        <p className="mt-2 text-muted">
          {correctCountRef.current} התאמות נכונות מתוך {totalAttemptsRef.current} ({accuracy}%)
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <MotionLink
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="/games/match"
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
    <HeartsGate>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="sr-only">משחק ההתאמה</h1>
        <p role="status" className="sr-only">
          {announcement}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold tracking-[0.14em] uppercase text-accent-hover">
              שלב {levelIndex + 1} מתוך {LEVELS.length} · {level.label}
            </span>
            <p className="mt-1 text-sm text-muted">{level.instruction}</p>
          </div>
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-2 border-dashed border-card-border">
            <Timer size={14} className="absolute -top-1.5 -right-1.5 bg-background rounded-full text-muted" />
            <EnglishText as="span" className="text-sm font-bold tabular-nums">
              {timeLeft}
            </EnglishText>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${(matchedIds.size / Math.max(pairs.length, 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div ref={containerRef} className="relative">
          <AnimatePresence>
            {phase === "levelUp" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 rounded-2xl"
              >
                <p className="text-xl font-bold text-accent-hover">שלב הושלם! 🎉</p>
              </motion.div>
            )}
          </AnimatePresence>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {pairs.map((p) => {
              if (!matchedIds.has(p.id) || !containerRef.current) return null;
              const rect = containerRef.current.getBoundingClientRect();
              const start = lineCoords(sourceRefs.current.get(p.id), rect);
              const end = lineCoords(targetRefs.current.get(p.target), rect);
              if (!start || !end) return null;
              return (
                <line
                  key={p.id}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="var(--success)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              );
            })}
            {dragLine && (
              <line
                x1={dragLine.x1}
                y1={dragLine.y1}
                x2={dragLine.x2}
                y2={dragLine.y2}
                stroke="var(--primary)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="6 5"
              />
            )}
          </svg>

          <div className="relative grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="space-y-3">
              {pairs.map((p) => {
                const isMatched = matchedIds.has(p.id);
                const isWrong = wrongPulse?.sourceId === p.id;
                return (
                  <motion.div
                    key={p.id}
                    ref={(el) => {
                      if (el) sourceRefs.current.set(p.id, el);
                    }}
                    data-source-id={p.id}
                    onPointerDown={(e) => handleEndpointPointerDown({ side: "source", id: p.id }, e)}
                    onKeyDown={(e) => handleEndpointKeyDown({ side: "source", id: p.id }, e)}
                    role="button"
                    tabIndex={isMatched ? -1 : 0}
                    aria-pressed={selectedEndpoint?.side === "source" && selectedEndpoint.id === p.id}
                    aria-disabled={isMatched}
                    animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    style={{ touchAction: "none" }}
                    className={`select-none rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      isMatched
                        ? "border-success/40 bg-success/10 opacity-70 cursor-default"
                        : selectedEndpoint?.side === "source" && selectedEndpoint.id === p.id
                          ? "border-primary bg-primary/5"
                          : isWrong
                            ? "border-danger bg-danger/5"
                            : "border-card-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <EnglishText className="pointer-events-none">{p.source}</EnglishText>
                  </motion.div>
                );
              })}
            </div>
            <div className="space-y-3">
              {targetOrder.map((t) => {
                const isMatched = pairs.some((p) => matchedIds.has(p.id) && p.target === t);
                const isWrong = wrongPulse?.target === t;
                return (
                  <motion.div
                    key={t}
                    ref={(el) => {
                      if (el) targetRefs.current.set(t, el);
                    }}
                    data-target-value={t}
                    onPointerDown={(e) => handleEndpointPointerDown({ side: "target", id: t }, e)}
                    onKeyDown={(e) => handleEndpointKeyDown({ side: "target", id: t }, e)}
                    role="button"
                    tabIndex={isMatched ? -1 : 0}
                    aria-pressed={selectedEndpoint?.side === "target" && selectedEndpoint.id === t}
                    aria-disabled={isMatched}
                    animate={isWrong ? { x: [0, 6, -6, 4, -4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    style={{ touchAction: "none" }}
                    className={`select-none rounded-xl border px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      isMatched
                        ? "border-success/40 bg-success/10 opacity-70 cursor-default"
                        : selectedEndpoint?.side === "target" && selectedEndpoint.id === t
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : isWrong
                            ? "border-danger bg-danger/5 cursor-pointer"
                            : "border-card-border bg-card hover:border-primary/40 cursor-pointer"
                    }`}
                  >
                    {/^[a-zA-Z____]/.test(t) ? <EnglishText className="pointer-events-none">{t}</EnglishText> : t}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </HeartsGate>
  );
}
