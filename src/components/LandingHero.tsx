"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MagneticButton from "@/components/MagneticButton";

// Signature interaction: the frame is "playing" — a running timecode ticks
// from a fixed start (never wall-clock time, so a slow connection or a
// paused tab never shows a wildly large number).
function useTimecode() {
  const [seconds, setSeconds] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `00:${m}:${s}`;
}

export default function LandingHero() {
  const timecode = useTimecode();

  return (
    <section className="relative overflow-hidden bg-[#0b0c0f]">
      {/* Letterbox bars — the "paused film frame" the whole world reads
          through. Independent of theme: this frame is always the cinema,
          light or dark theme is what plays inside the caption bar below. */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[6%] bg-black z-20" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-[6%] bg-black z-20" />

      <div className="relative px-4 py-24 sm:py-32">
        {/* Film grain + a faint scanline give the frame texture without
            relying on a photograph — see body::after for the site-wide
            grain layer this intensifies locally. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 2px)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Corner timecode — the running proof this is "live", not a
              static screenshot of a video. Spans the full frame width,
              above both columns. */}
          <div className="flex items-center justify-between mb-10 text-[#f3efe4]/50">
            <EnglishText as="span" className="timecode text-xs">
              {timecode}
            </EnglishText>
            <EnglishText as="span" className="timecode text-xs">
              REC ●
            </EnglishText>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
          <div>

          {/* The caption bar itself is the hero's whole thesis: no gradient
              headline, no hero-metric template — just two stacked tracks,
              English above Hebrew, the way real bilingual subtitles run. */}
          <div className="caption-stack">
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="caption-track-en"
            >
              <EnglishText
                as="h1"
                className="text-4xl sm:text-6xl font-bold leading-[1.05] text-[#f3efe4]"
              >
                The English you always wanted<span className="text-[#f2a53c]">.</span>
              </EnglishText>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="caption-track-he"
            >
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight text-[#5ee6e1]">
                סוף סוף, ברור.
              </h2>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-6 max-w-xl text-lg text-[#f3efe4]/70 leading-relaxed"
          >
            מבחן רמה אישי, מסלול לימוד שמתאים בדיוק לחוזקות ולחולשות שלכם, ומורה AI שזוכר כל מילה שקשה לכם.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.55 }}
            className="mt-6 inline-block rounded-full bg-[#f2a53c]/10 border border-[#f2a53c]/30 px-4 py-1.5 text-sm font-medium text-[#f2a53c]"
          >
            3 ימים ראשונים חינם — בלי כרטיס אשראי
          </motion.div>

          {/* CTAs styled as a video player's own controls, sitting where a
              scrubber's play/next buttons would sit — not a generic button
              pair. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#f2a53c] text-[#241503] font-bold text-lg hover:bg-[#f7bf6e] transition-colors"
                >
                  <Play size={18} fill="currentColor" strokeWidth={0} />
                  התחילו ללמוד בחינם
                </Link>
              </motion.div>
            </MagneticButton>
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/pricing"
                  className="block px-7 py-3.5 rounded-full border border-[#f3efe4]/25 text-[#f3efe4] font-medium text-lg hover:bg-[#f3efe4]/5 transition-colors"
                >
                  לצפייה במסלולים
                </Link>
              </motion.div>
            </MagneticButton>
          </motion.div>
          </div>

          {/* The live correction — the mechanism, dramatized. A real caption
              card, not a chat bubble: the mistake captions in, strikes
              through, and the fix captions in beneath it in the same
              grammar the whole hero already taught you to read. Sits
              beside the copy on desktop so it's inside the first
              viewport, not scrolled past. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
            className="mt-14 lg:mt-0 rounded-2xl px-5 py-5 sm:px-7 sm:py-6 bg-black/40 backdrop-blur-md border-y border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#f2a53c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2a53c] animate-pulse" />
                מורה AI מתקן עכשיו
              </span>
              <EnglishText as="span" className="timecode text-xs text-[#f3efe4]/40">
                B1 · 00:24
              </EnglishText>
            </div>
            <div className="caption-stack">
              <EnglishText as="p" className="caption-track-en text-lg leading-relaxed text-[#f3efe4]">
                I <span className="line-through decoration-2 decoration-[#f87171]/70 text-[#f3efe4]/50">have went</span>{" "}
                have gone to the store yesterday.
              </EnglishText>
              <p className="caption-track-he text-sm leading-relaxed text-[#5ee6e1]">
                &quot;went&quot; לא מתחבר ל-have — הצורה הנכונה: <EnglishText as="span">gone</EnglishText>.
              </p>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
