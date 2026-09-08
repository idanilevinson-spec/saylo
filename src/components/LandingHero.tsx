"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MagneticButton from "@/components/MagneticButton";
import LandingCorrectionDemo from "@/components/LandingCorrectionDemo";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-primary-soft">
      {/* One uniform blue field, the exact hue sampled from the real
          Saylo logo — no second "channel" color. A softened tint, not
          flat full-saturation: a small button earns full intensity, a
          whole section reads as glaring at the same strength. */}

      {/* The studio ground breathes — a slow, quiet ambient wash rather
          than a flat digital field. Raised from the shader-portal
          challenger's full-bleed commitment, translated to something this
          budget can actually build: no WebGL, one soft animated glow. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 15% 15%, color-mix(in srgb, var(--primary-ink) 16%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="relative px-4 py-16 sm:py-20">
        <div className="relative max-w-6xl mx-auto">
          {/* The one LIVE flag on the page — never repeated as a HUD
              element threaded through every section (that was the retired
              timecode mistake). */}
          <div className="flex items-center gap-2 mb-8">
            <span aria-hidden="true" className="live-dot w-2 h-2 rounded-full bg-primary" />
            <EnglishText as="span" className="chyron text-xs text-foreground tracking-[0.15em]">
              Live
            </EnglishText>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-card rounded-lg shadow-2xl p-6 sm:p-9"
            >
              {/* The card's edge, a broadcast-graphic detail. */}
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 rounded-s-lg bg-primary" />

              <EnglishText as="h1" className="chyron text-4xl sm:text-6xl text-foreground">
                The English you
                <br />
                always wanted<span className="text-primary">.</span>
              </EnglishText>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold leading-snug text-primary-hover">
                סוף סוף, ברור.
              </h2>
              <p className="mt-5 max-w-xl text-muted leading-relaxed">
                מבחן רמה אישי, מסלול לימוד שמתאים בדיוק לחוזקות ולחולשות שלכם, ומורה AI שזוכר כל מילה שקשה לכם.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <MagneticButton>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors"
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
                      className="block text-center px-7 py-3.5 rounded-lg border border-card-border text-foreground font-medium text-lg hover:bg-background-2 transition-colors"
                    >
                      לכל המסלולים
                    </Link>
                  </motion.div>
                </MagneticButton>
              </div>
            </motion.div>

            {/* The signature moment: not a screenshot of the product but
                the product's real mechanism, playing live and looping
                through a handful of real mistakes — inside the first
                viewport on desktop, not scrolled past. */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingCorrectionDemo />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
