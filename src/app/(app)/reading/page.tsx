import type { Metadata } from "next";
import { Lightbulb, ListChecks, AlignLeft, Search, ListX, Timer, PenLine } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listReadingTexts } from "@/lib/content/reading";

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

export default async function ReadingPage() {
  const texts = await listReadingTexts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">הבנת הנקרא</span>
          <h1 className="text-3xl font-bold">קריאה</h1>
          <p className="mt-2 text-muted">לחצו על כל מילה מוכרת בטקסט כדי לראות תרגום והגייה</p>
        </div>
      </div>

      <div className="mt-8 bg-card border border-card-border rounded-2xl p-6">
        <p className="flex items-center gap-1.5 font-bold text-accent-hover">
          <Lightbulb size={16} /> טיפים לפני שמתחילים
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tip.icon size={13} />
              </span>
              <p className="text-sm text-muted leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {texts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין טקסטים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {texts.map((text, i) => (
            <ContentCard key={text.id} href={`/reading/${text.id}`} index={i}>
              <div className="flex flex-col items-start gap-1.5">
                <EnglishText as="h2" className="text-lg font-bold">
                  {text.title_en}
                </EnglishText>
                <p className="text-sm font-medium text-foreground/70">{text.title_he}</p>
                <CefrBadge level={text.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}
