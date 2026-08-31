"use client";

import { motion } from "framer-motion";
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

const SMALL_FEATURES = [
  { icon: BookOpen, title: "אוצר מילים לפי נושא", body: "ממספרים ובגדים ועד Business ו-Technology." },
  { icon: PenLine, title: "דקדוק מלא", body: "מסלול שלם מ-A1 ועד C2, בלי לדלג." },
  { icon: Headphones, title: "האזנה", body: "שיחות, חדשות ופודקאסטים לפי רמה." },
  { icon: BookOpenText, title: "קריאה חכמה", body: "לחיצה על מילה = פירוש, תרגום והגייה." },
];

const WIDE_FEATURE = {
  icon: Brain,
  title: "חזרה חכמה",
  body: "המערכת זוכרת מה שכחתם, ומחזירה לכם בדיוק את זה ברגע הנכון — לא לפני, לא אחרי.",
};

const SMALL_FEATURES_2 = [
  { icon: Gamepad2, title: "גיימיפיקציה", body: "XP, רצף ימים ותגי הישג." },
  { icon: Target, title: "מסלולים לפי מטרה", body: "עבודה, טיולים, ראיונות או לימודים." },
];

export default function LandingFeatures() {
  return (
    <section className="px-4 py-24 bg-background-2">
      <div className="max-w-5xl mx-auto">
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
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col justify-between"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 65% 55% at 100% 0%, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 0% 100%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 55%)",
              }}
            />
            <div className="relative">
              <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Phone size={26} strokeWidth={2} />
              </span>
              <h3 className="mt-4 text-xl font-bold">דיבור עם AI — עכשיו גם בקול</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed max-w-xs">
                תרגלו מצבים אמיתיים — ראיון עבודה, מסעדה, שדה תעופה — בשיחה קולית חופשית, כמו שיחת טלפון
                אמיתית עם מורה שמקשיב ומגיב אליכם.
              </p>
            </div>
            <div className="relative flex items-center gap-2 text-xs font-medium text-primary">
              <MessageCircle size={14} />
              גם בהקלדה, אם אתם מעדיפים
            </div>
          </motion.div>

          {SMALL_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
              className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-3 font-bold text-sm">{f.title}</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{f.body}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="col-span-2 flex items-center gap-4 bg-accent/5 border border-accent/25 rounded-2xl p-5 hover:border-accent/45 hover:shadow-md transition-all"
          >
            <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
              <WIDE_FEATURE.icon size={22} strokeWidth={2} />
            </span>
            <div>
              <h3 className="font-bold">{WIDE_FEATURE.title}</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">{WIDE_FEATURE.body}</p>
            </div>
          </motion.div>

          {SMALL_FEATURES_2.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.36 + i * 0.06 }}
              className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-3 font-bold text-sm">{f.title}</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
