"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import LandingNotebook from "@/components/LandingNotebook";
import AppStoreButton from "@/components/AppStoreButton";
import { useAuth } from "@/context/AuthProvider";

// Strong custom ease-out — the built-in framer-motion/CSS easings read as
// weak/default; this is the curve emil-design-eng recommends for anything
// entering the screen.
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function LandingHero() {
  // A signed-in visitor (e.g. bouncing back to "/" from a bookmark or a
  // share link) lands on /signup uselessly otherwise — /dashboard is always
  // the right target either way, since the proxy-level placement gate sends
  // anyone who hasn't finished the level test there automatically.
  const { session } = useAuth();
  const ctaHref = session ? "/dashboard" : "/signup";

  return (
    <section className="relative isolate overflow-hidden bg-background-2 [--horizon-top:58%] [--horizon-width:120rem] lg:[--horizon-top:70%]">
      {/* Pilot (2026-10-24): the opening stands on the same lit horizon as
          the hub headers and the product tour, instead of the flat blue
          field. The headline card and the notebook sit in front of the
          planet's rim; it rises once on load (.hero-horizon). */}
      <span aria-hidden="true" className="horizon hero-horizon" />

      <div className="relative px-4 py-16 sm:py-20">
        <div className="relative max-w-6xl mx-auto">
          {/* The one LIVE flag on the page — never repeated as a HUD
              element threaded through every section (that was the retired
              timecode mistake). */}
          <div className="flex items-center gap-2 mb-8">
            <span aria-hidden="true" className="live-dot w-2 h-2 rounded-full bg-primary" />
            <EnglishText as="span" className="chyron text-xs text-primary-hover tracking-[0.15em]">
              Live
            </EnglishText>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="rise-in lit-plate relative rounded-lg p-6 sm:p-9">
              {/* The card's edge, a broadcast-graphic detail. */}
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 rounded-s-lg bg-primary" />

              <EnglishText as="h1" className="chyron text-4xl sm:text-6xl text-foreground">
                The English you
                <br />
                always wanted<span className="text-primary">.</span>
              </EnglishText>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold leading-snug text-primary-hover">
                מתחילים מהרמה שלכם.
              </h2>
              <p className="mt-5 max-w-xl text-muted leading-relaxed">
                קודם מבחן רמה קצר. אחר כך תרגול יומי ברמה שלכם, ומורה שמדבר איתכם באנגלית ומתקן אתכם תוך
                כדי.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16, ease: EASE_OUT }}
                >
                  <Link
                    href={ctaHref}
                    className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors"
                  >
                    <Play size={18} fill="currentColor" strokeWidth={0} />
                    התחילו ללמוד בחינם
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16, ease: EASE_OUT }}
                >
                  {/* A visitor can try a few minutes first (/try); someone
                      already signed in gets the plans instead. */}
                  <Link
                    href={session ? "/pricing" : "/try"}
                    className="block text-center px-7 py-3.5 rounded-lg border border-card-border text-foreground font-medium text-lg hover:bg-background-2 transition-colors"
                  >
                    {session ? "לכל המסלולים" : "שיעור ניסיון, בלי הרשמה"}
                  </Link>
                </motion.div>
              </div>
              <AppStoreButton className="mt-4" />
            </div>

            {/* The signature moment: the mistakes notebook, filling itself
                in. Not a screenshot of the product but its real mechanism
                (a mistake corrected, explained and saved), one page per
                mistake, inside the first viewport on desktop. */}
            <div className="rise-in" style={{ animationDelay: "0.15s" }}>
              <LandingNotebook />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
