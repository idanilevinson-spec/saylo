"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import BackgroundVideo from "@/components/cinema/BackgroundVideo";
import WordsPullUp from "@/components/cinema/WordsPullUp";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E1E0CC]";

export default function CinemaHero() {
  const { session } = useAuth();

  const navItems = [
    { href: "#about", label: "איך זה עובד" },
    { href: "#features", label: "יכולות" },
    { href: "/pricing", label: "מחירים" },
    session ? { href: "/dashboard", label: "לוח בקרה" } : { href: "/login", label: "התחברות" },
  ];

  return (
    <section className="h-[100svh] min-h-[620px] p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <BackgroundVideo src={HERO_VIDEO} className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"
        />

        <nav
          aria-label="ניווט ראשי"
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-2xl bg-black px-4 py-2 md:rounded-b-3xl md:px-8"
        >
          <ul className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm md:gap-12 lg:gap-14">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block whitespace-nowrap rounded px-1 py-1.5 text-[rgba(225,224,204,0.8)] transition-colors hover:text-[#E1E0CC] ${FOCUS}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* The grid is laid out left-to-right on purpose — brand word on the
            left, copy on the right, exactly as designed — while the Hebrew
            column keeps its own rtl direction. */}
        <div dir="ltr" className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-6 md:px-10 md:pb-8">
          <div className="grid grid-cols-12 items-end gap-4 md:gap-6">
            <h1
              className="col-span-12 pb-[0.06em] text-[26vw] font-medium leading-[0.85] tracking-[-0.07em] sm:text-[24vw] md:text-[22vw] lg:col-span-8 lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]"
              style={{ color: "#E1E0CC" }}
            >
              <WordsPullUp text="Saylo" showAsterisk />
              <span className="sr-only"> — לומדים אנגלית בקצב שלכם</span>
            </h1>

            <div dir="rtl" className="col-span-12 flex flex-col items-start gap-5 pb-2 lg:col-span-4 lg:pb-[2vw]">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
                className="text-sm text-primary/90 [text-shadow:0_1px_14px_rgba(0,0,0,0.75)] md:text-base"
                style={{ lineHeight: 1.2 }}
              >
                מבחן רמה אישי, מסלול לימוד שמתאים בדיוק לחוזקות ולחולשות שלכם, ומורה AI שזוכר כל מילה שקשה לכם.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
              >
                <Link
                  href={session ? "/dashboard" : "/signup"}
                  className={`group inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pe-1.5 ps-5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:text-base ${FOCUS}`}
                >
                  {session ? "המשיכו ללמוד" : "התחילו ללמוד בחינם"}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowLeft size={18} className="text-[#E1E0CC]" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
