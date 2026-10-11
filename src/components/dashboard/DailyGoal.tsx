"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

export const DAILY_XP_GOAL = 50;

// Today's XP as this learner last saw it on this screen, per day and per
// tab. Coming back from practice, the goal rolls up from there to the new
// total and names what was added, so the dashboard answers "did that
// count?" without a toast. A first look, or nothing new, simply shows.
const GOAL_SEEN_KEY = "saylo-goal-seen";

function readSeenXp(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

export default function DailyGoal({ profileId, todayXp }: { profileId: string; todayXp: number }) {
  const key = `${GOAL_SEEN_KEY}:${profileId}:${new Date().toLocaleDateString("en-CA")}`;
  // Read once, when the card first appears; the dashboard only renders it
  // after its data loads, so this never runs on the server.
  const [seenXp] = useState(() => readSeenXp(key));
  const fromXp = seenXp !== null && seenXp < todayXp ? seenXp : todayXp;
  const added = todayXp - fromXp;

  useEffect(() => {
    try {
      sessionStorage.setItem(key, String(todayXp));
    } catch {
      // Storage unavailable: every visit is a first look, which is fine.
    }
  }, [key, todayXp]);

  const pct = (xp: number) => Math.min(100, Math.round((xp / DAILY_XP_GOAL) * 100));
  const goalPct = pct(todayXp);
  const done = goalPct >= 100;

  return (
    <div className="rounded-lg border border-card-border bg-card p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted">היעד היומי</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <CountUp value={todayXp} from={fromXp} duration={0.7} className="chyron text-4xl tabular-nums" />
            <span className="text-sm font-medium text-muted">/ {DAILY_XP_GOAL} XP</span>
            {added > 0 && (
              <span className="ms-1 text-sm font-bold text-success tabular-nums" dir="ltr">
                +{added}
              </span>
            )}
          </p>
        </div>
        <span className={`shrink-0 mt-1 text-sm font-bold tabular-nums ${done ? "text-success" : "text-primary"}`}>
          <CountUp value={goalPct} from={pct(fromXp)} duration={0.7} />%
        </span>
      </div>
      <div className="mt-4">
        <div className="h-2 rounded-full bg-background-2 overflow-hidden">
          {/* Fills from the reading start (the right, in Hebrew). A
              transform, not width, so it never triggers layout. */}
          <motion.div
            className={`h-full rounded-full origin-right ${done ? "bg-success" : "bg-primary"}`}
            initial={{ scaleX: pct(fromXp) / 100 }}
            animate={{ scaleX: goalPct / 100 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{done ? "היעד של היום הושלם" : "כל תרגיל, משחק ושיחה נספרים ביעד"}</p>
      </div>
    </div>
  );
}
