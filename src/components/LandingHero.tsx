"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bot, Plane } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MagneticButton from "@/components/MagneticButton";

export default function LandingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });
  const opacity = useTransform(smoothProgress, [0, 1], [1, 0]);
  const y = useTransform(smoothProgress, [0, 1], [0, 40]);
  const blobPrimaryY = useTransform(smoothProgress, [0, 1], [0, 60]);
  const blobAccentY = useTransform(smoothProgress, [0, 1], [0, -50]);
  const cardRotate = useTransform(smoothProgress, [0, 1], [-2.2, 0.8]);
  const cardY = useTransform(smoothProgress, [0, 1], [0, -14]);
  const stampRotate = useTransform(smoothProgress, [0, 1], [-11, -5]);

  // A gentle cursor-parallax on the two ambient glows — the blobs drift
  // toward the pointer at different rates, giving the hero a subtle sense
  // of depth that only shows up once you actually move the mouse.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerXSpring = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.6 });
  const pointerYSpring = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.6 });
  const blobPrimaryX = useTransform(pointerXSpring, [-1, 1], [-18, 18]);
  const blobPrimaryYPointer = useTransform(pointerYSpring, [-1, 1], [-18, 18]);
  const blobAccentX = useTransform(pointerXSpring, [-1, 1], [14, -14]);
  const blobAccentYPointer = useTransform(pointerYSpring, [-1, 1], [14, -14]);
  const blobPrimaryYCombined = useTransform([blobPrimaryY, blobPrimaryYPointer], ([a, b]: number[]) => a + b);
  const blobAccentYCombined = useTransform([blobAccentY, blobAccentYPointer], ([a, b]: number[]) => a + b);

  function onPointerMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function onPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28"
    >
      <motion.div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        style={{ y: blobPrimaryYCombined, x: blobPrimaryX }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-[8%] w-64 h-64 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        style={{ y: blobAccentYCombined, x: blobAccentX }}
      />

      {/* The dashed flight path draws itself in once on load — the same
          "your journey" metaphor as the passport stamp and the boarding-pass
          steps section further down, made literal right in the hero. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35]"
      >
        <motion.path
          d="M 4 92 C 30 78, 34 46, 58 34 S 88 14, 94 8"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.35"
          strokeDasharray="1.6 2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
        />
      </svg>
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.1 }}
        className="absolute rotate-[-38deg] text-accent-hover"
        style={{ top: "5%", left: "91%" }}
      >
        <Plane size={18} strokeWidth={2} />
      </motion.span>
      <Image
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        width={480}
        height={415}
        className="absolute top-1/2 -translate-y-1/2 -left-24 rotate-[6deg] opacity-[0.08] pointer-events-none select-none"
      />

      <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
        <motion.div style={{ opacity, y }}>
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
            <span className="animate-gradient-shimmer bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              סוף סוף מובנת
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted max-w-xl"
          >
            מבחן רמה אישי, מסלול לימוד שמתאים בדיוק לחוזקות ולחולשות שלכם, ומורה AI
            שזוכר כל מילה שקשה לכם.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="block px-8 py-3.5 rounded-xl bg-primary text-primary-ink font-medium text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  התחילו ללמוד בחינם
                </Link>
              </motion.div>
            </MagneticButton>
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/pricing"
                  className="block px-8 py-3.5 rounded-xl bg-card border border-card-border font-medium text-lg hover:bg-background-2 transition-colors"
                >
                  לצפייה במסלולים
                </Link>
              </motion.div>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* A live "lesson in progress" mockup — the AI tutor catching and
            correcting a real mistake — doubles as a product demo instead of
            decoration. The passport-stamp badge ties into the CEFR levels
            further down the page. */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <motion.div
            style={{ rotate: stampRotate }}
            className="absolute -top-6 -left-7 w-[92px] h-[92px] rounded-full border-[2.5px] border-dashed border-accent bg-accent/[0.07] text-accent-hover flex flex-col items-center justify-center z-10"
          >
            <EnglishText as="span" className="font-extrabold text-xl leading-none">
              B1
            </EnglishText>
            <span className="font-pen font-bold text-sm mt-0.5">עברתם!</span>
          </motion.div>

          <motion.div
            style={{ rotate: cardRotate, y: cardY }}
            className="bg-card border border-card-border rounded-[20px] p-6 shadow-xl shadow-primary/10"
          >
            <div className="flex items-center gap-2.5 pb-3.5 mb-4 border-b border-dashed border-card-border">
              <span className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-ink">
                <Bot size={17} strokeWidth={2.25} />
              </span>
              <div>
                <div className="text-[13.5px] font-semibold">מורה AI</div>
                <div className="text-[11.5px] text-accent-hover flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  מתקן עכשיו
                </div>
              </div>
            </div>

            <div className="-mb-1 flex items-baseline gap-1.5 pe-1.5">
              <span aria-hidden="true" className="text-accent-hover text-xl leading-none">
                ↳
              </span>
              <EnglishText as="span" className="font-pen font-bold text-accent-hover text-xl">
                have gone
              </EnglishText>
            </div>

            <div className="mt-3.5 bg-background-2 rounded-2xl p-4">
              <EnglishText as="span" className="block text-[15px] leading-relaxed">
                I <span className="text-danger line-through decoration-[1.5px] opacity-75">have went</span> to the
                store yesterday.
              </EnglishText>
              <span className="block mt-2 text-xs text-muted leading-relaxed">
                הלכתי לחנות אתמול — אבל &quot;went&quot; לא מתחבר ל-have. הצורה הנכונה:{" "}
                <EnglishText as="span">gone</EnglishText>.
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
