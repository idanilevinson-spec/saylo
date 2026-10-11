"use client";

import { useRef } from "react";
import EnglishText from "@/components/EnglishText";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/reducedMotion";

// A rundown, not a card grid — segment numbers are earned here (a real
// broadcast rundown IS numbered order), unlike the banned decorative
// 01/02/03 the old direction refused.
const STEPS = [
  {
    en: "About ten minutes, four skills.",
    he: "שאלות באוצר מילים, דקדוק, קריאה והאזנה. בסוף מקבלים רמה לכל מיומנות בנפרד, כי קריאה ודיבור לא תמיד באותה רמה.",
    title: "מבחן רמה",
  },
  {
    en: "A plan for today.",
    he: "שישה תרגילים קצרים: דקדוק, מילים, קריאה, האזנה, כתיבה ושיחה. כל אחד ברמה שלכם במיומנות שלו.",
    title: "התוכנית היומית",
  },
  {
    en: "Talk, and get corrected.",
    he: "בכתב או בקול. המורה ממשיך את השיחה ומתקן את הטעות שחשובה, לא כל פסיק.",
    title: "שיחה עם המורה",
  },
  {
    en: "Mistakes come back.",
    he: "מילה שטעיתם בה חוזרת אליכם למחרת, ואחר כך במרווחים הולכים וגדלים, עד שהיא נשארת.",
    title: "חזרה חכמה",
  },
];

// The line where a segment goes on air: a little above the middle of the
// screen, where the eye actually rests while reading down a page.
const CUE = "top 55%";
const CUE_END = "bottom 55%";

export default function LandingSteps() {
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();

  // Reading down the rundown cues each segment like a control-room sheet:
  // the segment you're on lights in the logo blue, the ones you've passed
  // settle to muted, the ones ahead stay unlit. A playhead on the rail
  // tracks how far through the four you are. Everything is readable before
  // any of this runs — the unlit state is the server-rendered default.
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-segment]", list);
      const set = (row: HTMLElement, state: "ahead" | "live" | "done") => {
        row.dataset.segment = state;
      };

      rows.forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: CUE,
          end: CUE_END,
          onEnter: () => set(row, "live"),
          onEnterBack: () => set(row, "live"),
          onLeave: () => set(row, "done"),
          onLeaveBack: () => set(row, "ahead"),
        });
      });

      // The playhead follows the scroll position directly — it's a gauge,
      // not an animation, but with reduced motion it stays out entirely.
      if (!reduced) {
        gsap.fromTo(
          "[data-playhead]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list, start: CUE, end: CUE_END, scrub: 0.3 },
          }
        );
      }
    },
    { scope: listRef, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section className="px-4 py-20 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">סדר היום</h2>
        <p className="mt-3 mb-10 max-w-xl text-lg text-muted leading-relaxed">מה קורה מהרגע שנרשמים: ארבעה שלבים, ורק הראשון הוא חד-פעמי.</p>

        <div ref={listRef} className="relative">
          {/* The rail and its playhead, on the reading-start edge. */}
          <span aria-hidden="true" className="absolute inset-y-0 start-0 w-0.5 bg-card-border" />
          <span aria-hidden="true" data-playhead className="absolute inset-y-0 start-0 w-0.5 origin-top bg-primary" style={{ transform: "scaleY(0)" }} />
          <ol className="divide-y divide-card-border border-y border-card-border">
            {STEPS.map((step, i) => (
              <li key={step.title} data-segment="ahead" className="group flex items-center gap-5 sm:gap-8 py-6 ps-4 sm:ps-6">
                <span
                  aria-hidden="true"
                  className="chyron shrink-0 w-14 sm:w-16 text-4xl sm:text-5xl text-center text-card-border transition-colors duration-300 group-data-[segment=live]:text-primary group-data-[segment=done]:text-muted"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <EnglishText as="p" className="caption-track-en text-lg font-bold text-foreground">
                    {step.en}
                  </EnglishText>
                  <p className="mt-1 text-sm text-primary-hover font-bold">{step.title}</p>
                  <p className="mt-2 text-muted leading-relaxed max-w-md">{step.he}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
