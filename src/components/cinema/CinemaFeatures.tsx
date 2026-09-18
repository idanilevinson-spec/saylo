"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Check, MessageCircle, Target, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import BackgroundVideo from "@/components/cinema/BackgroundVideo";
import WordsPullUpMultiStyle from "@/components/cinema/WordsPullUpMultiStyle";

const FEATURES_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E1E0CC]";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  items: string[];
  href: string;
  cta: string;
}

// Every line here is a shipped capability from PRODUCT.md — nothing
// aspirational, no numbers, no claims about results.
const CARDS: FeatureCard[] = [
  {
    icon: Target,
    title: "מסלול שנבנה סביבכם",
    items: [
      "מבחן רמה לפי תקן CEFR",
      "רמה נפרדת לכל אחד משישה תחומים",
      "מסלולים לפי מטרה: עבודה, טיולים, ראיונות, לימודים",
    ],
    href: "/placement",
    cta: "למבחן הרמה",
  },
  {
    icon: MessageCircle,
    title: "מורה AI שמקשיב",
    items: [
      "שיחה קולית בזמן אמת, או צ'אט בקצב שלכם",
      "ציון הגייה מבוסס זיהוי דיבור",
      "זוכר את הטעויות שחוזרות אצלכם",
    ],
    href: "/speaking",
    cta: "לשיחה עם המורה",
  },
  {
    icon: Brain,
    title: "חזרה ברגע הנכון",
    items: [
      "מילים חוזרות בדיוק כשעמדתם לשכוח אותן",
      "אוצר מילים ודקדוק מ-A1 עד C2",
      "האזנה וקריאה לפי הרמה שלכם",
    ],
    href: "/review",
    cta: "לחזרה חכמה",
  },
];

export default function CinemaFeatures() {
  const { session } = useAuth();
  // Anyone signed out lands on signup first — every feature page otherwise
  // waits on a profile that will never arrive.
  const dest = (href: string) => (session ? href : "/signup");

  return (
    <section id="features" className="relative min-h-screen overflow-hidden bg-black px-4 py-20 md:px-6 md:py-28">
      <div aria-hidden="true" className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <h2
          className="mx-auto mb-14 max-w-3xl text-center text-3xl leading-[1.1] sm:text-4xl md:mb-20 md:text-5xl lg:text-6xl"
          style={{ color: "#E1E0CC" }}
        >
          <WordsPullUpMultiStyle
            segments={[
              { text: "כל מה שצריך כדי לדבר.", className: "font-normal", dir: "rtl" },
              { text: "Nothing you don't.", className: "font-serif italic", dir: "ltr", lang: "en" },
            ]}
          />
        </h2>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-1 lg:grid-cols-4">
          <motion.li
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative min-h-[320px] overflow-hidden rounded-2xl bg-[#212121] sm:col-span-2 lg:col-span-1 lg:min-h-0"
          >
            <BackgroundVideo src={FEATURES_VIDEO} className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p className="absolute inset-x-0 bottom-0 p-5 text-sm text-[#E1E0CC] md:p-6 md:text-base">
              לומדים, מתאמנים, ומדברים. הכל במקום אחד.
            </p>
          </motion.li>

          {CARDS.map((card, i) => (
            <motion.li
              key={card.title}
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: (i + 1) * 0.15 }}
              className="flex flex-col rounded-2xl bg-[#212121] p-6 md:p-7"
            >
              <card.icon size={28} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-medium text-[#E1E0CC] md:text-2xl">{card.title}</h3>

              <ul className="mt-5 flex-1 space-y-3">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-[#a3a397]">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={dest(card.href)}
                className={`group mt-8 inline-flex items-center gap-2 self-start rounded text-sm text-primary transition-colors hover:text-white ${FOCUS}`}
              >
                {card.cta}
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col items-center gap-4 text-center md:mt-24">
          <p className="text-sm text-[#a3a397] md:text-base">
            3 ימי ניסיון חינם, בלי כרטיס אשראי. אחר כך בוחרים מסלול, ומבטלים מתי שרוצים.
          </p>
          <Link
            href={session ? "/dashboard" : "/signup"}
            className={`group inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pe-1.5 ps-5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:text-base ${FOCUS}`}
          >
            {session ? "המשיכו ללמוד" : "התחילו ללמוד בחינם"}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
              <ArrowLeft size={18} className="text-[#E1E0CC]" aria-hidden="true" />
            </span>
          </Link>
          <Link href="/pricing" className={`rounded text-sm text-[#a3a397] underline-offset-4 hover:text-[#E1E0CC] hover:underline ${FOCUS}`}>
            לכל המסלולים והמחירים
          </Link>
        </div>
      </div>
    </section>
  );
}
