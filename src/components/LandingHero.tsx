"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import EnglishText from "@/components/EnglishText";

// A bilingual word-pair badge is the one visual motif no generic,
// English-only template can borrow — it only makes sense for a site
// that actually teaches English *to* Hebrew speakers, so it doubles as
// a quiet demo of the product (every pair is a real word Saylo teaches).
// Hidden below xl (not the sm used for the old English-only version):
// measured that a bilingual pair is wide enough to overlap the h1 at
// any narrower width, since the h1's own max-w-3xl column leaves too
// little side margin until the viewport is genuinely wide.
const FLOATING_WORDS = [
  { en: "Hello", he: "שלום", top: "10%", right: "6%", delay: 0 },
  { en: "Practice", he: "תרגול", top: "60%", right: "2%", delay: 0.7 },
  { en: "Fluent", he: "שוטף", top: "26%", left: "2%", delay: 1.3 },
  { en: "Grow", he: "לצמוח", top: "70%", left: "8%", delay: 2 },
];

export default function LandingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const blobPrimaryY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blobPrimaryScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const blobAccentY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const blobAccentScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section ref={ref} className="relative overflow-hidden px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <motion.div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        style={{ y: blobPrimaryY, scale: blobPrimaryScale }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        style={{ y: blobAccentY, scale: blobAccentScale }}
      />

      {FLOATING_WORDS.map((w) => (
        <motion.div
          key={w.en}
          className="hidden xl:block absolute pointer-events-none"
          style={{ top: w.top, right: w.right, left: w.left }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, -10, -10, -30] }}
          transition={{ duration: 6, delay: w.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            dir="ltr"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-card-border shadow-sm text-sm font-medium"
          >
            <EnglishText className="text-primary">{w.en}</EnglishText>
            <span aria-hidden="true" className="text-accent text-xs">
              ⇄
            </span>
            <bdi className="text-foreground">{w.he}</bdi>
          </div>
        </motion.div>
      ))}

      <motion.div style={{ opacity, y }} className="relative max-w-3xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          3 ימים ראשונים חינם — בלי כרטיס אשראי
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight"
        >
          האנגלית שתמיד רצית,
          <br />
          <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            סוף סוף מובנת
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-muted max-w-xl mx-auto"
        >
          מבחן רמה אישי, מסלול לימוד שמתאים בדיוק לחוזקות ולחולשות שלכם, ומורה AI
          שזוכר כל מילה שקשה לכם — מגיל 8 ועד 80.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="block px-8 py-3.5 rounded-xl bg-primary text-primary-ink font-medium text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              התחילו ללמוד בחינם
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/pricing"
              className="block px-8 py-3.5 rounded-xl bg-card border border-card-border font-medium text-lg hover:bg-background-2 transition-colors"
            >
              לצפייה במסלולים
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
