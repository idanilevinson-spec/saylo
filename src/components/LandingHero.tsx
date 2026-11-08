"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LandingNotebook from "@/components/LandingNotebook";
import AppStoreButton from "@/components/AppStoreButton";
import PenMark from "@/components/PenMark";
import { useAuth } from "@/context/AuthProvider";

export default function LandingHero() {
  // A signed-in visitor (e.g. bouncing back to "/" from a bookmark or a
  // share link) lands on /signup uselessly otherwise — /dashboard is always
  // the right target either way, since the proxy-level placement gate sends
  // anyone who hasn't finished the level test there automatically.
  const { session } = useAuth();
  const ctaHref = session ? "/dashboard" : "/signup";

  return (
    <section className="px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 items-center">
        {/* The page opens on a sentence, set like a book's title page: no
            card around it, no badge above it. The red pen marks the one
            phrase it turns on. */}
        <div className="rise-in">
          <h1 className="text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-7xl sm:leading-[1.04] font-black">
            המורה לאנגלית
            <br />
            שזוכר את <PenMark>הטעויות שלכם</PenMark>
          </h1>
          <p className="mt-7 max-w-lg text-lg sm:text-xl text-muted leading-relaxed">
            קודם מבחן רמה קצר. אחר כך תרגול יומי ברמה שלכם, ומורה שמדבר איתכם באנגלית ומתקן אתכם תוך כדי.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
            <Link
              href={ctaHref}
              className="game-press inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors"
            >
              התחילו ללמוד בחינם
            </Link>
            {/* A visitor can try a few minutes first (/try); someone
                already signed in gets the plans instead. */}
            <Link
              href={session ? "/pricing" : "/try"}
              className="group inline-flex items-center justify-center sm:justify-start gap-1.5 font-bold text-foreground underline decoration-card-border decoration-2 underline-offset-[6px] hover:decoration-foreground transition-[text-decoration-color]"
            >
              {session ? "לכל המסלולים" : "או שיעור ניסיון, בלי הרשמה"}
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </div>
          <AppStoreButton className="mt-6" />
        </div>

        {/* The signature moment: the mistakes notebook, filling itself
            in. Not a screenshot of the product but its real mechanism
            (a mistake corrected, explained and saved), one page per
            mistake, inside the first viewport on desktop. */}
        <div className="rise-in" style={{ animationDelay: "0.12s" }}>
          <LandingNotebook />
        </div>
      </div>
    </section>
  );
}
