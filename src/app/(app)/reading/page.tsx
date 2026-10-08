import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ListChecks, AlignLeft, Search, ListX, Timer, PenLine, CheckCircle2, ChevronLeft, Clock, BookOpen } from "lucide-react";
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

// The text to suggest next: unread, at the learner's reading level if
// there is one there, else the nearest level up, then down.
function pickNext(texts: ReadingText[], byText: Map<string, TextProgress>, level: CefrLevel | null): ReadingText | null {
  const unread = texts.filter((t) => !byText.get(t.id)?.answered);
  if (unread.length === 0) return null;
  if (!level) return unread[0];
  const at = LEVELS.indexOf(level);
  const order = [...LEVELS.slice(at), ...LEVELS.slice(0, at).reverse()];
  for (const l of order) {
    const hit = unread.find((t) => t.cefr_level === l);
    if (hit) return hit;
  }
  return unread[0];
}

function excerpt(body: string, max = 170): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, flat.lastIndexOf(" ", max)) + "…";
}

export default async function ReadingPage() {
  const [texts, { byText, level }] = await Promise.all([listReadingTexts(), readingProgress()]);
  const groups = LEVELS.map((l) => ({ level: l, texts: texts.filter((t) => t.cefr_level === l) })).filter((g) => g.texts.length > 0);
  const readCount = texts.filter((t) => (byText.get(t.id)?.answered ?? 0) > 0).length;
  const next = pickNext(texts, byText, level);
  const nextInfo = next ? readingMinutes(next) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">קריאה</h1>
          <p className="mt-2 text-muted max-w-prose leading-relaxed">
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

      {next && nextInfo && (
        <Link
          href={`/reading/${next.id}`}
          className="game-press group relative mt-8 block overflow-hidden rounded-lg bg-primary text-primary-ink p-6 sm:p-7 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-primary-ink/80">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={16} aria-hidden="true" />
              {readCount === 0 ? "מתחילים מכאן" : "הטקסט הבא בשבילכם"}
            </span>
            <span className="chyron rounded-md bg-primary-ink/15 px-2 py-0.5 text-sm" dir="ltr">
              {next.cefr_level}
            </span>
            <span className="inline-flex items-center gap-1 font-medium tabular-nums">
              <Clock size={14} aria-hidden="true" />
              {nextInfo.minutes} דק׳ · {nextInfo.words} מילים
            </span>
          </span>
          <EnglishText as="span" className="mt-3 block text-right text-2xl sm:text-3xl font-black leading-tight">
            {next.title_en}
          </EnglishText>
          <span className="mt-1 block text-primary-ink/80">{next.title_he}</span>
          <span dir="ltr" lang="en" className="mt-4 block max-w-2xl text-left text-sm leading-relaxed text-primary-ink/70 line-clamp-2">
            {excerpt(next.body_en)}
          </span>
          <span className="mt-5 inline-flex items-center gap-2 min-h-11 px-5 rounded-lg bg-background text-foreground font-bold">
            להתחיל לקרוא
            <ChevronLeft size={17} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
          </span>
        </Link>
      )}

      {texts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין טקסטים זמינים — יתווספו בקרוב.</p>
      ) : (
        <>
          {/* Jump to a level, with how much of it is read. */}
          <nav aria-label="רמות" className="mt-8 flex flex-wrap gap-2">
            {groups.map((g) => {
              const read = g.texts.filter((t) => (byText.get(t.id)?.answered ?? 0) > 0).length;
              const mine = g.level === level;
              return (
                <a
                  key={g.level}
                  href={`#level-${g.level}`}
                  className={`game-press inline-flex items-center gap-2 min-h-10 px-3 rounded-lg border text-sm transition-[border-color,transform] duration-150 hover:border-primary/50 ${
                    mine ? "border-primary/60 bg-primary/[0.06]" : "border-card-border bg-card"
                  }`}
                >
                  <span className="chyron text-lg text-primary" dir="ltr">
                    {g.level}
                  </span>
                  <span className="text-muted tabular-nums">
                    {read}/{g.texts.length}
                  </span>
                </a>
              );
            })}
          </nav>

          {groups.map((group) => {
            const mine = group.level === level;
            return (
              <section key={group.level} aria-labelledby={`level-${group.level}`} className="mt-10">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 id={`level-${group.level}`} className="flex items-baseline gap-2 text-xl font-black tracking-tight scroll-mt-24">
                    <span className="chyron text-3xl text-primary" dir="ltr">
                      {group.level}
                    </span>
                    {LEVEL_NAME[group.level]}
                  </h2>
                  {mine && <span className="rounded-md bg-primary/12 px-2 py-0.5 text-xs font-bold text-primary">הרמה שלכם</span>}
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {group.texts.map((text) => {
                    const { words, minutes } = readingMinutes(text);
                    const p = byText.get(text.id);
                    const done = !!p && p.answered > 0;
                    return (
                      <li key={text.id}>
                        <Link
                          href={`/reading/${text.id}`}
                          className="game-press group relative flex h-full flex-col overflow-hidden rounded-lg border border-card-border bg-card p-4 transition-[border-color,transform,box-shadow] duration-150 hover:border-primary/50 hover:shadow-[0_12px_30px_-18px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                        >
                          <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1 ${done ? "bg-success" : "bg-transparent"}`} />
                          <EnglishText as="span" className="block text-right text-lg font-bold leading-snug">
                            {text.title_en}
                          </EnglishText>
                          <span className="block text-sm text-muted">{text.title_he}</span>
                          <span className="mt-auto pt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} aria-hidden="true" />
                              {minutes} דק׳ · {words} מילים
                            </span>
                            {done && p ? (
                              <span className="inline-flex items-center gap-1 font-medium text-success">
                                <CheckCircle2 size={12} aria-hidden="true" />
                                {p.correct} מתוך {p.total} נכונות
                              </span>
                            ) : (
                              <span>עוד לא נקרא</span>
                            )}
                            <ChevronLeft
                              size={16}
                              aria-hidden="true"
                              className="ms-auto text-muted shrink-0 transition-transform group-hover:-translate-x-0.5"
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      )}

      <details className="group mt-12 rounded-lg border border-card-border bg-card">
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
    </div>
  );
}
