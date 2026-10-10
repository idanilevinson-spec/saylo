import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ListChecks, AlignLeft, Search, ListX, Timer, PenLine, CheckCircle2, ChevronLeft, Clock, BookOpen, BookOpenText } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { getLearnerLevels } from "@/lib/content/learnerLevel";
import { listReadingTexts } from "@/lib/content/reading";
import { createClient } from "@/lib/supabase/serverClient";
import type { CefrLevel, ReadingText } from "@/types/database";
import { fetchAll } from "@/lib/supabase/fetchAll";

export const metadata: Metadata = {
  title: "קריאה — Saylo",
};

// Synthesized from widely-published reading-comprehension test-taking
// guidance (SAT/TOEFL-style prep sources) into our own words — general,
// well-established technique, not any one source's specific phrasing.
const TIPS = [
  { icon: ListChecks, text: "קודם השאלות, אחר כך הטקסט. כך יודעים מה מחפשים." },
  { icon: AlignLeft, text: "קראו למבנה: מה הרעיון המרכזי של כל פסקה, לא כל מילה בעצימות שווה." },
  { icon: Search, text: "לפני שעונים, מוצאים בטקסט את המשפט שמוכיח את התשובה. לא סומכים על הזיכרון." },
  { icon: ListX, text: "פסלו קודם תשובות שברור שהן שגויות, ורק אז בחרו מבין מה שנשאר." },
  { icon: Timer, text: "נתקעתם בשאלה? ממשיכים הלאה, וחוזרים אליה אם נשאר זמן." },
  { icon: PenLine, text: "בשאלה הפתוחה: תכננו רגע לפני שאתם כותבים, והביאו פרטים קונקרטיים מהטקסט." },
];

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
    fetchAll((from, to) =>
      supabase
        .from("exercises")
        .select("id, reading_text_id")
        .not("reading_text_id", "is", null)
        .eq("status", "published")
        .order("id")
        .range(from, to),
    ),
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
  const [texts, { byText, level: readingLevel }, levels] = await Promise.all([listReadingTexts(), readingProgress(), getLearnerLevels()]);
  // The live reading level, else the placement result.
  const level = readingLevel ?? levels.overall;
  const readCount = texts.filter((t) => (byText.get(t.id)?.answered ?? 0) > 0).length;
  const next = pickNext(texts, byText, level);
  const nextInfo = next ? readingMinutes(next) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={BookOpenText}
        title="קריאה"
        description={`טקסטים מקוריים בכל רמה, עם מבחן הבנה בסוף כל אחד. לחיצה על מילה מסומנת מראה תרגום והגייה. קראתם ${readCount} מתוך ${texts.length}.`}
        level={level}
        levelLabel="הרמה שלכם בקריאה"
        signedIn={levels.signedIn}
      />

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

      <div className="mt-10">
        {texts.length === 0 ? (
          <p className="text-muted">עוד אין כאן טקסטים.</p>
        ) : (
          <LevelShelves
            items={texts}
            level={level}
            levelOf={(t) => t.cefr_level}
            keyOf={(t) => t.id}
            renderItem={(text) => {
              const { words, minutes } = readingMinutes(text);
              const p = byText.get(text.id);
              const done = !!p && p.answered > 0;
              return (
                <TopicTile
                  href={`/reading/${text.id}`}
                  titleEn={text.title_en}
                  titleHe={text.title_he}
                  level={text.cefr_level}
                  done={done}
                  meta={
                    <>
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
                    </>
                  }
                />
              );
            }}
          />
        )}
      </div>

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
