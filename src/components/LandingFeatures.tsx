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
  { icon: Headphones, title: "האזנה", body: "שיחות, חדשות ופודקאסטים לפי רמה.", href: "/listening" },
  { icon: BookOpenText, title: "קריאה חכמה", body: "סיפורים לפי רמה, מבחן הבנה ושאלה פתוחה עם משוב AI.", href: "/reading" },
  { icon: Brain, title: "חזרה חכמה", body: "המערכת זוכרת מה שכחתם, ומחזירה לכם בדיוק את זה ברגע הנכון: לא לפני, לא אחרי.", href: "/review" },
  { icon: Gamepad2, title: "לומדים דרך משחק", body: "XP, רצף ימים ותגי הישג.", href: "/games" },
  { icon: Target, title: "מסלולים לפי מטרה", body: "עבודה, טיולים, ראיונות או לימודים.", href: "/learn" },
];

export default function LandingFeatures() {
  // Logged-in visitors go straight to the feature; anyone else goes to
  // signup first — every card here otherwise lands on a page that just
  // spins forever waiting for a profile that will never arrive.
  const { session } = useAuth();
  const dest = (href: string) => (session ? href : "/signup");

  return (
    <section className="px-4 py-24 bg-background-2">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          הכל במקום אחד
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-muted mb-14 max-w-lg mx-auto"
        >
          לא עוד אתר לימוד רגיל. מערכת שלמה שמכירה אתכם ומתאימה את עצמה אליכם.
        </motion.p>

        <div className="space-y-3 mb-3">
          {NOW_PLAYING.map((f, i) => (
            <Link key={f.title} href={dest(f.href)} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ x: -3 }}
                className="caption-bar rounded-2xl px-5 py-5 sm:px-6 sm:py-6 flex items-start gap-4"
              >
                <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink">
                  <f.icon size={20} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <EnglishText as="p" className="caption-track-en text-base sm:text-lg font-bold text-foreground">
                    {f.en}
                  </EnglishText>
                  <p className="mt-1 text-sm font-semibold text-accent">{f.title}</p>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-card-border overflow-hidden divide-y divide-card-border">
          {SCENES.map((f, i) => (
            <Link
              key={f.title}
              href={dest(f.href)}
              className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
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
      </div>
    </section>
  );
}
