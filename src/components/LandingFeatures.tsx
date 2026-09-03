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

const SMALL_FEATURES = [
  { icon: BookOpen, title: "אוצר מילים לפי נושא", body: "ממספרים ובגדים ועד Business ו-Technology.", href: "/vocabulary" },
  { icon: PenLine, title: "דקדוק מלא", body: "מסלול שלם מ-A1 ועד C2, בלי לדלג.", href: "/grammar" },
  { icon: Headphones, title: "האזנה", body: "שיחות, חדשות ופודקאסטים לפי רמה.", href: "/listening" },
  {
    icon: BookOpenText,
    title: "קריאה חכמה",
    body: "סיפורים לפי רמה, מבחן הבנה ושאלה פתוחה עם משוב AI.",
    href: "/reading",
  },
];

const WIDE_FEATURE = {
  icon: Brain,
  title: "חזרה חכמה",
  body: "המערכת זוכרת מה שכחתם, ומחזירה לכם בדיוק את זה ברגע הנכון — לא לפני, לא אחרי.",
  href: "/review",
};

const SMALL_FEATURES_2 = [
  { icon: Gamepad2, title: "גיימיפיקציה", body: "XP, רצף ימים ותגי הישג.", href: "/games" },
  { icon: Target, title: "מסלולים לפי מטרה", body: "עבודה, טיולים, ראיונות או לימודים.", href: "/learn" },
];

export default function LandingFeatures() {
  // Logged-in visitors go straight to the feature; anyone else goes to
  // signup first — every card here otherwise lands on a page that just
  // spins forever waiting for a profile that will never arrive.
  const { session } = useAuth();
  const dest = (href: string) => (session ? href : "/signup");

  return (
    <section className="relative px-4 py-24 bg-background-2 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          הכל במקום אחד
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-muted mb-16 max-w-lg mx-auto"
        >
          לא עוד אתר לימוד רגיל — מערכת שלמה שמכירה אתכם ומתאימה את עצמה אליכם.
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(150px,auto)]">
          <Link
            href={dest("/speaking/voice")}
            className="col-span-2 block rounded-2xl focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-full overflow-hidden rounded-2xl border border-accent/30 bg-accent/5 p-6 flex flex-col justify-center hover:border-accent/50 hover:shadow-md transition-all"
            >
              <span
                aria-hidden="true"
                className="font-pen font-bold text-accent-hover text-base absolute -top-1 left-4 -rotate-6 z-10"
              >
                חדש!
              </span>
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 60% at 100% 0%, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 60%)",
                }}
              />
              <div className="relative flex items-start gap-4">
                <span className="inline-flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-hover">
                  <Phone size={22} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-lg font-bold">שיחה קולית עם מורה AI</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-sm">
                    תרגלו מצבים אמיתיים — ראיון עבודה, מסעדה, שדה תעופה — בשיחה קולית חופשית, כמו שיחת טלפון
                    אמיתית עם מורה שמקשיב ומגיב אליכם.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link
            href={dest("/speaking")}
            className="col-span-2 block rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-full overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col justify-center hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 60% at 100% 0%, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 60%)",
                }}
              />
              <div className="relative flex items-start gap-4">
                <span className="inline-flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <MessageCircle size={22} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-lg font-bold">צ&apos;אט עם מורה AI</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-sm">
                    מעדיפים להקליד? אותם תרחישים ואותו מורה, בשיחת טקסט בקצב שלכם — בלי לחץ, עם זמן לחשוב על
                    כל תשובה.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {SMALL_FEATURES.map((f, i) => (
            <Link
              key={f.title}
              href={dest(f.href)}
              className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="h-full bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-3 font-bold text-sm">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{f.body}</p>
              </motion.div>
            </Link>
          ))}

          <Link
            href={dest(WIDE_FEATURE.href)}
            className="col-span-2 block rounded-2xl focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="h-full flex items-center gap-4 bg-accent/5 border border-accent/25 rounded-2xl p-5 hover:border-accent/45 hover:shadow-md transition-all"
            >
              <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
                <WIDE_FEATURE.icon size={22} strokeWidth={2} />
              </span>
              <div>
                <h3 className="font-bold">{WIDE_FEATURE.title}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{WIDE_FEATURE.body}</p>
              </div>
            </motion.div>
          </Link>

          {SMALL_FEATURES_2.map((f, i) => (
            <Link
              key={f.title}
              href={dest(f.href)}
              className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.36 + i * 0.06 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="h-full bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-3 font-bold text-sm">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{f.body}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
