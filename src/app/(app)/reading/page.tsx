import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ListChecks, AlignLeft, Search, ListX, Timer, PenLine, CheckCircle2, ChevronLeft, Clock } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { listReadingTexts } from "@/lib/content/reading";
import { createClient } from "@/lib/supabase/serverClient";
import type { CefrLevel, ReadingText } from "@/types/database";

export const metadata: Metadata = {
  title: "קריאה — Saylo",
};

// Synthesized from widely-published reading-comprehension test-taking
// guidance (SAT/TOEFL-style prep sources) into our own words — general,
// well-established technique, not any one source's specific phrasing.
const TIPS = [
  { icon: ListChecks, text: "עברו על השאלות לפני שאתם קוראים את הטקסט — זה ממקד את הקריאה שלכם." },
  { icon: AlignLeft, text: "קראו למבנה: מה הרעיון המרכזי של כל פסקה, לא כל מילה בעצימות שווה." },
  { icon: Search, text: "לפני שעונים, חפשו בטקסט הוכחה ישירה לתשובה — אל תסתמכו על הזיכרון." },
  { icon: ListX, text: "פסלו קודם תשובות שברור שהן שגויות, ורק אז בחרו מבין מה שנשאר." },
  { icon: Timer, text: "שמרו על קצב — אם נתקעתם על שאלה, המשיכו הלאה וחזרו אליה אם יישאר זמן." },
  { icon: PenLine, text: "בשאלה הפתוחה: תכננו רגע לפני שאתם כותבים, והביאו פרטים קונקרטיים מהטקסט." },
];

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_NAME: Record<CefrLevel, string> = {
  A1: "מתחילים",
  A2: "בסיסי",
  B1: "בינוני",
  B2: "בינוני-גבוה",
  C1: "מתקדם",
  C2: "שליטה מלאה",
};

// A learner reads a second language far slower than a native speaker;
// ~110 words a minute is a fair, slightly generous pace to estimate with.
function readingMinutes(text: ReadingText): { words: number; minutes: number } {
  const words = text.body_en.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 110)) };
}

interface TextProgress {
  answered: number;
  correct: number;
  total: number;
}

// Per text: how many of its comprehension questions this learner has
// answered, and how many their latest answer got right.
async function readingProgress(): Promise<{ byText: Map<string, TextProgress>; level: CefrLevel | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const byText = new Map<string, TextProgress>();
  if (!user) return { byText, level: null };

  const [{ data: exercises }, { data: levelRow }] = await Promise.all([
    supabase.from("exercises").select("id, reading_text_id").not("reading_text_id", "is", null).eq("status", "published"),
    supabase.from("skill_levels").select("cefr_level").eq("profile_id", user.id).eq("skill", "reading").maybeSingle(),
  ]);
  const textOf = new Map((exercises ?? []).map((e) => [e.id as string, e.reading_text_id as string]));
  for (const textId of textOf.values()) {
    const p = byText.get(textId) ?? { answered: 0, correct: 0, total: 0 };
    p.total++;
    byText.set(textId, p);
  }

  if (textOf.size > 0) {
    const { data: attempts } = await supabase
      .from("exercise_attempts")
      .select("exercise_id, is_correct, created_at")
      .eq("profile_id", user.id)
      .in("exercise_id", [...textOf.keys()])
      .order("created_at", { ascending: false });
    const seen = new Set<string>();
    for (const a of attempts ?? []) {
      if (seen.has(a.exercise_id)) continue;
      seen.add(a.exercise_id);
      const p = byText.get(textOf.get(a.exercise_id) as string);
      if (!p) continue;
      p.answered++;
      if (a.is_correct) p.correct++;
    }
  }

  return { byText, level: (levelRow?.cefr_level as CefrLevel | undefined) ?? null };
}

export default async function ReadingPage() {
  const [texts, { byText, level }] = await Promise.all([listReadingTexts(), readingProgress()]);
  const groups = LEVELS.map((l) => ({ level: l, texts: texts.filter((t) => t.cefr_level === l) })).filter((g) => g.texts.length > 0);
  const readCount = texts.filter((t) => (byText.get(t.id)?.answered ?? 0) > 0).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-3xl font-bold">קריאה</h1>
          <p className="mt-2 text-muted max-w-prose">
            טקסטים מקוריים בכל רמה, עם מבחן הבנה בסוף כל אחד. לחצו על מילה מסומנת בטקסט כדי לראות תרגום ולשמוע הגייה.
          </p>
        </div>
        <dl className="flex gap-5">
          {level && (
            <div>
              <dt className="text-xs text-muted">הרמה שלכם בקריאה</dt>
              <dd className="chyron text-3xl" dir="ltr">
                {level}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted">טקסטים שקראתם</dt>
            <dd className="chyron text-3xl tabular-nums">
              {readCount}/{texts.length}
            </dd>
          </div>
        </dl>
      </div>

      <details className="group mt-6 rounded-lg border border-card-border bg-card">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 font-bold [&::-webkit-details-marker]:hidden">
          <Lightbulb size={16} aria-hidden="true" className="text-accent-hover" />
          טיפים לקריאה ולמבחן
          <ChevronLeft size={16} aria-hidden="true" className="ms-auto text-muted transition-transform group-open:-rotate-90" />
        </summary>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 px-5 pb-5">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <tip.icon size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm text-muted leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </details>

      {texts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין טקסטים זמינים — יתווספו בקרוב.</p>
      ) : (
        groups.map((group) => {
          const mine = group.level === level;
          return (
            <section key={group.level} aria-labelledby={`level-${group.level}`} className="mt-10">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 id={`level-${group.level}`} className="flex items-baseline gap-2 text-lg font-bold">
                  <span className="chyron text-2xl text-primary" dir="ltr">
                    {group.level}
                  </span>
                  {LEVEL_NAME[group.level]}
                </h2>
                {mine && <span className="text-sm font-bold text-accent-hover">הרמה שלכם</span>}
              </div>
              <ul className="mt-3 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
                {group.texts.map((text) => {
                  const { words, minutes } = readingMinutes(text);
                  const p = byText.get(text.id);
                  const done = p && p.answered > 0;
                  return (
                    <li key={text.id}>
                      <Link
                        href={`/reading/${text.id}`}
                        className="game-press group flex items-center gap-4 p-4 hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                      >
                        <span className="flex-1 min-w-0">
                          <EnglishText as="span" className="block text-lg font-bold leading-snug">
                            {text.title_en}
                          </EnglishText>
                          <span className="block text-sm text-muted">{text.title_he}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} aria-hidden="true" />
                              {minutes} דק׳ קריאה · {words} מילים
                            </span>
                            {done && p && (
                              <span className="inline-flex items-center gap-1 font-medium text-success">
                                <CheckCircle2 size={12} aria-hidden="true" />
                                {p.correct} מתוך {p.total} נכונות
                              </span>
                            )}
                          </span>
                        </span>
                        <ChevronLeft
                          size={18}
                          aria-hidden="true"
                          className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
