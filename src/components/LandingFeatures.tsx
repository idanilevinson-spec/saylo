"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  PenLine,
  MessageCircle,
  Headphones,
  BookOpenText,
  Brain,
  Gamepad2,
  Target,
  Phone,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import EnglishText from "@/components/EnglishText";

// Two "now playing" features up top, the rest as a scene list beneath —
// rows of uneven weight, never the banned same-size icon grid.
const NOW_PLAYING = [
  {
    icon: Phone,
    en: "Live call with your AI teacher.",
    title: "שיחה קולית עם מורה AI",
    body: "תרגלו מצבים אמיתיים (ראיון עבודה, מסעדה, שדה תעופה) בשיחה קולית חופשית, כמו שיחת טלפון אמיתית עם מורה שמקשיב ומגיב אליכם.",
    href: "/speaking/voice",
    voice: true,
  },
  {
    icon: MessageCircle,
    en: "Or type it out, at your pace.",
    title: "צ'אט עם מורה AI",
    body: "מעדיפים להקליד? אותם תרחישים ואותו מורה, בשיחת טקסט בקצב שלכם, בלי לחץ ועם זמן לחשוב על כל תשובה.",
    href: "/speaking",
  },
];

const SCENES = [
  { icon: BookOpen, title: "אוצר מילים לפי נושא", body: "ממספרים ובגדים ועד Business ו-Technology.", href: "/vocabulary" },
  { icon: PenLine, title: "דקדוק מלא", body: "מסלול שלם מ-A1 ועד C2, בלי לדלג.", href: "/grammar" },
  { icon: Headphones, title: "האזנה", body: "שיחות וקטעי האזנה לפי רמה.", href: "/listening" },
  { icon: BookOpenText, title: "קריאה חכמה", body: "סיפורים לפי רמה, מבחן הבנה ושאלה פתוחה עם משוב AI.", href: "/reading" },
  { icon: Brain, title: "חזרה חכמה", body: "המערכת מחזירה לכם מילים במרווחי זמן מתוכננים, כדי שיישארו בזיכרון.", href: "/review" },
  { icon: Gamepad2, title: "לומדים דרך משחק", body: "XP, רצף ימים ותגי הישג.", href: "/games" },
  { icon: Target, title: "מסלולים לפי מטרה", body: "עבודה, טיולים, ראיונות או לימודים.", href: "/learn" },
];

// A small ballistic level meter, not a spinner or a static icon — the one
// place this world borrows the VU-meter bridge's real-instrument grammar,
// because this is the one feature that's genuinely audio (speech
// recognition), not a generic "live" flourish reused everywhere.
const BAR_HEIGHTS = [40, 70, 100, 65, 45];
function SignalMeter() {
  return (
    <div className="hidden sm:flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="w-0.5 rounded-full bg-primary"
          initial={{ height: "20%" }}
          animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.3}%`] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

// Strong custom ease-out — the built-in framer-motion/CSS easings read as
// weak/default; this is the curve emil-design-eng recommends for anything
// entering the screen.
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function LandingFeatures() {
  // Logged-in visitors go straight to the feature; anyone else goes to
  // signup first — every card here otherwise lands on a page that just
  // spins forever waiting for a profile that will never arrive.
  const { session } = useAuth();
  const dest = (href: string) => (session ? href : "/signup");

  return (
    <section className="px-4 py-24 bg-background-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
          הכל בערוץ אחד
        </h2>
        <p className="text-center text-muted mb-14 max-w-lg mx-auto">
          לא עוד אתר לימוד רגיל. מערכת שלמה שמכירה אתכם ומתאימה את עצמה אליכם.
        </p>

        <div className="space-y-3 mb-3">
          {NOW_PLAYING.map((f) => (
            <Link key={f.title} href={dest(f.href)} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
              <motion.div
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
                className="relative bg-card border border-card-border shadow-sm rounded-lg px-5 py-5 sm:px-6 sm:py-6 flex items-start gap-4"
              >
                <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 rounded-s-lg bg-primary" />
                <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-ink">
                  <f.icon size={20} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <EnglishText as="p" className="caption-track-en text-base sm:text-lg font-bold text-foreground">
                      {f.en}
                    </EnglishText>
                    {/* Raised from the VU-meter bridge: a real ballistic
                        read for the one feature that's actually audio,
                        not decoration borrowed for every card. */}
                    {f.voice && <SignalMeter />}
                  </div>
                  <p className="mt-1 text-sm font-bold text-primary-hover">{f.title}</p>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-card-border overflow-hidden divide-y divide-card-border">
          {SCENES.map((f) => (
            <Link
              key={f.title}
              href={dest(f.href)}
              className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
              <motion.div
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
                className="group flex items-center gap-4 px-5 py-4 bg-card hover:bg-background-2 transition-colors"
              >
                <span className="inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground">{f.title}</p>
                  <p className="text-xs text-muted leading-relaxed truncate">{f.body}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
