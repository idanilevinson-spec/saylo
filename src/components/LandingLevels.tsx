"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import type { LevelCatalogEntry } from "@/lib/content/levelCatalog";
import type { CefrLevel } from "@/types/database";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const LEVELS: { code: CefrLevel; he: string }[] = [
  { code: "A1", he: "מתחילים" },
  { code: "A2", he: "בסיסי" },
  { code: "B1", he: "בינוני" },
  { code: "B2", he: "בינוני-גבוה" },
  { code: "C1", he: "מתקדם" },
  { code: "C2", he: "שליטה מלאה" },
];

const COUNTS: { key: keyof LevelCatalogEntry; label: string }[] = [
  { key: "words", label: "מילים" },
  { key: "grammar", label: "נושאי דקדוק" },
  { key: "reading", label: "טקסטים לקריאה" },
  { key: "listening", label: "קטעי האזנה" },
  { key: "scenarios", label: "תרחישי שיחה" },
  { key: "writing", label: "נושאי כתיבה" },
];

// The CEFR ladder as a rail you can scrub: pick a level and see what a
// learner there can actually do, and how much practice waits at it —
// counted from the database, not promised.
export default function LandingLevels({ catalog }: { catalog: Record<CefrLevel, LevelCatalogEntry> }) {
  const [level, setLevel] = useState<CefrLevel>("B1");
  const index = LEVELS.findIndex((l) => l.code === level);
  const entry = catalog[level];
  const speak = getCanDoStatement("speaking", level);
  const read = getCanDoStatement("reading", level);

  return (
    <section aria-labelledby="levels-title" className="px-4 py-20 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <h2 id="levels-title" className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
          שש רמות. בכל אחת יש מה לעשות.
        </h2>
        <p className="mt-3 max-w-xl text-lg text-muted leading-relaxed">
          מבחן הרמה מציב אתכם על הסולם הבינלאומי (CEFR), ומשם התוכן נפתח לפי הרמה שלכם בכל מיומנות. בחרו רמה:
        </p>

        {/* The rail */}
        <div className="relative mt-10" role="radiogroup" aria-label="רמות">
          <div aria-hidden="true" className="absolute inset-x-[8.33%] top-[1.15rem] h-1 rounded-full bg-card-border">
            <motion.div
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
              animate={{ width: `${(index / (LEVELS.length - 1)) * 100}%` }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            />
          </div>
          <div className="relative grid grid-cols-6">
            {LEVELS.map((l, i) => {
              const active = l.code === level;
              const passed = i <= index;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLevel(l.code)}
                  className="group flex flex-col items-center gap-2 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] duration-200 ${
                      active
                        ? "scale-110 border-primary bg-primary text-primary-ink"
                        : passed
                          ? "border-primary bg-background text-primary"
                          : "border-card-border bg-background text-muted group-hover:border-primary/50"
                    }`}
                  >
                    <span className="chyron text-base leading-none" dir="ltr">
                      {l.code}
                    </span>
                  </span>
                  <span className={`hidden sm:block text-xs ${active ? "font-bold text-foreground" : "text-muted"}`}>{l.he}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* What this level looks like */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={level}
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(-4px)" }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="mt-8 grid gap-4 md:grid-cols-[1.1fr_1fr]"
          >
            <div className="relative overflow-hidden rounded-lg border border-card-border bg-card p-6">
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 bg-primary" />
              <p className="flex items-baseline gap-3">
                <EnglishText as="span" className="chyron text-6xl leading-none text-primary">
                  {level}
                </EnglishText>
                <span className="text-xl font-black">{LEVELS[index].he}</span>
              </p>
              <dl className="mt-5 space-y-3 text-sm leading-relaxed">
                {speak && (
                  <div>
                    <dt className="font-bold">בדיבור</dt>
                    <dd className="text-muted">{speak}</dd>
                  </div>
                )}
                {read && (
                  <div>
                    <dt className="font-bold">בקריאה</dt>
                    <dd className="text-muted">{read}</dd>
                  </div>
                )}
              </dl>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-card-border bg-card-border">
              {COUNTS.map(({ key, label }) => (
                <div key={key} className="flex flex-col-reverse bg-card px-4 py-3.5">
                  <dt className="mt-1 text-xs text-muted">{label}</dt>
                  <dd className="chyron text-3xl leading-none tabular-nums">{entry[key]}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
        <p className="mt-3 text-xs text-muted">
          המספרים נספרים מהמאגר עצמו ומתעדכנים כשנוסף תוכן. הרמה ב-Saylo היא הערכה פנימית, לא תעודה רשמית.
        </p>
      </div>
    </section>
  );
}
