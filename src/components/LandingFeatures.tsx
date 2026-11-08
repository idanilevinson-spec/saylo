"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { skillInk } from "@/lib/design/skillInk";

// The two ways to talk with the teacher lead; everything else is set as a
// book's contents page (title, a dotted leader, the way in), not as a grid
// of icon cards.
const LEAD = [
  {
    title: "שיחה קולית עם המורה",
    // A real exchange of the kind the voice call runs (the restaurant role-play).
    sample: [
      { who: "you", text: "Hi, can we get a table for two?" },
      { who: "teacher", text: "Of course. Inside, or by the window?" },
    ],
    body: "תרגלו מצבים אמיתיים (ראיון עבודה, מסעדה, שדה תעופה) בשיחה קולית חופשית, כמו שיחת טלפון עם מורה שמקשיב ומגיב אליכם.",
    href: "/speaking/voice",
  },
  {
    title: "או בכתב, בקצב שלכם",
    // The teacher corrects the one mistake that matters and keeps talking.
    sample: [
      { who: "you", text: "Last week I have went to Eilat." },
      { who: "teacher", text: "Nice! \"Last week I went to Eilat.\" What did you do there?" },
    ],
    body: "מעדיפים להקליד? אותם תרחישים ואותו מורה, בכתב. יש זמן לחשוב לפני כל תשובה.",
    href: "/speaking",
  },
];

const CONTENTS = [
  { title: "אוצר מילים לפי נושא", en: "Vocabulary", body: "ממספרים ובגדים ועד Business ו-Technology", href: "/vocabulary" },
  { title: "דקדוק", en: "Grammar", body: "הסבר קצר בעברית ותרגול לכל נושא, מ-present simple ועד nominalisation", href: "/grammar" },
  { title: "האזנה", en: "Listening", body: "שיחות לפי רמה, עם האטה ותמלול, וגם דיבור טבעי עם קיצורים והססות", href: "/listening" },
  { title: "קריאה", en: "Reading", body: "טקסטים מקוריים לפי רמה, תרגום בלחיצה על מילה, ושאלה פתוחה עם משוב", href: "/reading" },
  { title: "חזרה חכמה", en: "Spaced review", body: "מילים חוזרות אליכם במרווחי זמן מתוכננים, כדי שיישארו בזיכרון", href: "/review" },
  { title: "משחקים", en: "Word games", body: "שמונה משחקים על המילים שלכם: מהירות, האזנה, איות, זיכרון ועוד", href: "/games" },
  { title: "הכנה לבגרות", en: "Bagrut prep", body: "3, 4 ו-5 יח״ל: מבנה השאלונים, מיומנויות וערכות תרגול באותו מבנה", href: "/bagrut" },
];

export default function LandingFeatures() {
  // Logged-in visitors go straight to the feature; anyone else goes to
  // signup first — every link here otherwise lands on a page that just
  // spins forever waiting for a profile that will never arrive.
  const { session } = useAuth();
  const dest = (href: string) => (session ? href : "/signup");

  return (
    <section className="px-4 py-20 sm:py-28 bg-background-2">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black leading-[1.1]">מה יש בפנים</h2>
        <p lang="en" dir="ltr" className="gloss mt-2 text-right text-lg">What&rsquo;s inside</p>
        <p className="mt-4 max-w-xl text-lg text-muted leading-relaxed">
          שש מיומנויות, כל אחת ברמה שלה. ומורה אחד שזוכר את הטעויות שלכם בכולן.
        </p>

        <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {LEAD.map((f) => (
            <Link
              key={f.title}
              href={dest(f.href)}
              className="group block border-t-2 border-foreground pt-5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
            >
              <h3 className="font-display text-2xl sm:text-3xl font-bold">{f.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{f.body}</p>
              <div lang="en" dir="ltr" className="mt-4 space-y-1.5 border-s border-card-border ps-3 font-content text-[0.95rem] leading-snug">
                {f.sample.map((line) => (
                  <p key={line.text} className={line.who === "teacher" ? "text-foreground" : "text-muted"}>
                    <span className="me-1.5 text-xs font-bold uppercase tracking-wide text-muted">{line.who === "teacher" ? "Teacher" : "You"}</span>
                    {line.text}
                  </p>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 font-bold text-primary-hover">
                לנסות
                <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <ol className="mt-16 border-t border-foreground/15">
          {CONTENTS.map((f) => (
            <li key={f.title}>
              <Link
                href={dest(f.href)}
                className="group flex items-baseline gap-4 border-b border-foreground/15 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 translate-y-[-0.1em] rounded-full ${skillInk(f.href).dot}`} />
                <span className="min-w-0 sm:shrink-0 sm:max-w-[60%]">
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-bold text-lg">{f.title}</span>
                    <span lang="en" dir="ltr" className="gloss text-[0.95rem]">{f.en}</span>
                  </span>
                  <span className="block text-sm text-muted leading-relaxed">{f.body}</span>
                </span>
                <span aria-hidden="true" className="hidden sm:block flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-foreground/20" />
                <ArrowLeft
                  size={18}
                  aria-hidden="true"
                  className="ms-auto shrink-0 self-center text-muted transition-[color,translate] group-hover:-translate-x-1 group-hover:text-foreground"
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
