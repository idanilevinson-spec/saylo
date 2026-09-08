"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

export default function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-primary-ink">מוכנים להתחיל?</h2>
        <p className="mt-4 text-primary-ink/80 text-lg leading-relaxed">
          מבחן הרמה לוקח פחות מ־10 דקות. תדעו בדיוק איפה אתם עומדים, ולאן ללכת מכאן.
        </p>
        <MagneticButton className="mt-8 inline-block">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="flex items-center gap-2.5 px-10 py-4 rounded-lg bg-background text-foreground font-bold text-lg hover:bg-background-2 transition-colors"
            >
              <Play size={18} fill="currentColor" strokeWidth={0} />
              התחילו ללמוד בחינם
            </Link>
          </motion.div>
        </MagneticButton>
      </motion.div>
    </section>
  );
}
