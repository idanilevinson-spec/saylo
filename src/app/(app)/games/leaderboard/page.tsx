"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Crown, ChevronRight } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import type { LeaderboardEntry } from "@/app/api/leaderboard/route";

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  windowDays: number;
}

const MEDAL_COLOR = ["text-[#d4af37]", "text-[#a8a9ad]", "text-[#b08d57]"];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData);
  }, []);

  if (data === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  const { entries, me } = data;
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-12">
      <Link href="/games" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronRight size={15} aria-hidden="true" /> למשחקים
      </Link>
      <h1 className="mt-3 text-3xl font-bold">לוח המובילים</h1>
      <p className="mt-2 text-muted">מי צבר הכי הרבה XP ב-{data.windowDays} הימים האחרונים, מכל התרגול והמשחקים ביחד.</p>

      {entries.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-card-border p-8 text-center">
          <Trophy size={36} aria-hidden="true" className="mx-auto text-muted" />
          <p className="mt-3 text-muted">עוד אף אחד לא צבר XP השבוע. כל תרגול או משחק יכניס אתכם ללוח.</p>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <ol className="mt-8 flex items-end justify-center gap-2.5 sm:gap-3" aria-label="שלושת הראשונים">
              {[podium[1], podium[0], podium[2]].map((entry, i) =>
                entry ? (
                  <motion.li
                    key={entry.rank}
                    initial={{ opacity: 0, transform: "translateY(12px)" }}
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                    className={`relative overflow-hidden flex flex-1 max-w-32 flex-col items-center justify-end rounded-lg border bg-card px-2 pb-3 ${
                      entry.rank === 1 ? "h-44 border-primary/45 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)]" : entry.rank === 2 ? "h-36 border-card-border" : "h-32 border-card-border"
                    } ${entry.isMe ? "ring-2 ring-primary" : ""}`}
                  >
                    {entry.rank === 1 && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}
                    <Crown size={entry.rank === 1 ? 22 : 16} aria-hidden="true" className={MEDAL_COLOR[entry.rank - 1]} />
                    <span className="chyron text-4xl leading-none mt-1 tabular-nums" aria-label={`מקום ${entry.rank}`}>
                      {entry.rank}
                    </span>
                    <p className="mt-1.5 text-sm font-bold truncate max-w-full">
                      {entry.displayName}
                      {entry.isMe && <span className="text-primary"> (אתם)</span>}
                    </p>
                    <EnglishText as="p" className="text-xs text-muted tabular-nums">
                      {entry.xp} XP
                    </EnglishText>
                  </motion.li>
                ) : (
                  <li key={`empty-${i}`} aria-hidden="true" className="flex-1 max-w-32" />
                )
              )}
            </ol>
          )}

          {rest.length > 0 && (
            <ol className="mt-6 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden" start={4}>
              {rest.map((entry) => (
                <li
                  key={entry.rank}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${entry.isMe ? "bg-primary/[0.07]" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="chyron w-8 text-2xl text-muted shrink-0 tabular-nums">{entry.rank}</span>
                    <span className="font-medium truncate">
                      {entry.displayName}
                      {entry.isMe && <span className="text-primary"> (אתם)</span>}
                    </span>
                  </div>
                  <EnglishText as="span" className="text-sm font-bold text-primary shrink-0 tabular-nums">
                    {entry.xp} XP
                  </EnglishText>
                </li>
              ))}
            </ol>
          )}

          {me && (
            <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-primary/50 bg-primary/[0.07]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="chyron w-8 text-2xl text-primary shrink-0 tabular-nums">{me.rank}</span>
                <span className="font-medium truncate">{me.displayName} (אתם)</span>
              </div>
              <EnglishText as="span" className="text-sm font-bold text-primary shrink-0 tabular-nums">
                {me.xp} XP
              </EnglishText>
            </div>
          )}
        </>
      )}
    </div>
  );
}
