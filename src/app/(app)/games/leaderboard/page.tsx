"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
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
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">
          {data.windowDays} הימים האחרונים
        </span>
        <h1 className="text-3xl font-bold">לוח המובילים</h1>
        <p className="mt-2 text-muted">מי צבר הכי הרבה XP השבוע — מכל התרגול והמשחקים ביחד</p>
      </motion.div>

      {entries.length === 0 ? (
        <div className="mt-10 text-center">
          <Trophy size={40} className="mx-auto text-muted" />
          <p className="mt-3 text-muted">אף אחד עדיין לא צבר XP השבוע — תהיו הראשונים!</p>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="mt-8 flex items-end justify-center gap-3">
              {[podium[1], podium[0], podium[2]].map((entry, i) =>
                entry ? (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`flex flex-col items-center justify-end rounded-2xl border p-4 ${
                      entry.rank === 1
                        ? "w-28 h-36 bg-card border-primary/40 shadow-lg"
                        : "w-24 h-28 bg-card border-card-border"
                    } ${entry.isMe ? "ring-2 ring-primary" : ""}`}
                  >
                    <Crown size={entry.rank === 1 ? 22 : 16} className={MEDAL_COLOR[entry.rank - 1]} />
                    <p className="mt-1 text-sm font-bold truncate max-w-full">{entry.displayName}</p>
                    <EnglishText as="p" className="text-xs text-muted">
                      {entry.xp} XP
                    </EnglishText>
                  </motion.div>
                ) : (
                  <div key={`empty-${i}`} className="w-24" />
                )
              )}
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-6 bg-card border border-card-border rounded-2xl divide-y divide-card-border overflow-hidden">
              {rest.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${entry.isMe ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <EnglishText as="span" className="w-6 text-sm font-bold text-muted shrink-0">
                      {entry.rank}
                    </EnglishText>
                    <span className="text-sm font-medium truncate">{entry.displayName}</span>
                  </div>
                  <EnglishText as="span" className="text-sm font-bold text-primary shrink-0">
                    {entry.xp} XP
                  </EnglishText>
                </div>
              ))}
            </div>
          )}

          {me && (
            <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5">
              <div className="flex items-center gap-3 min-w-0">
                <EnglishText as="span" className="w-6 text-sm font-bold text-primary shrink-0">
                  {me.rank}
                </EnglishText>
                <span className="text-sm font-medium truncate">{me.displayName} (אתם)</span>
              </div>
              <EnglishText as="span" className="text-sm font-bold text-primary shrink-0">
                {me.xp} XP
              </EnglishText>
            </div>
          )}
        </>
      )}
    </div>
  );
}
