"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EnglishText from "@/components/EnglishText";
import MagneticButton from "@/components/MagneticButton";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";

const bestValue = PRICING_PLANS[PRICING_PLANS.length - 1];

export default function LandingPricingTeaser() {
  return (
    <section className="px-4 py-24 bg-background-2">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="caption-bar rounded-2xl px-7 py-8 sm:px-10 sm:py-10 text-center"
        >
          <EnglishText as="span" className="timecode text-xs text-muted">
            {bestValue.badge}
          </EnglishText>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">3 ימים חינם, בלי התחייבות</h2>

          <div className="caption-stack mt-5 items-center">
            <p className="caption-track-en text-muted">
              then{" "}
              <EnglishText as="span" className="font-bold text-primary">
                ₪{monthlyEquivalent(bestValue)}
              </EnglishText>
              /mo
            </p>
            <p className="caption-track-he text-sm text-accent">במסלול השנתי</p>
          </div>

          <MagneticButton className="mt-8 inline-block">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/pricing"
                className="block px-8 py-3.5 rounded-full bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors"
              >
                לכל המסלולים
              </Link>
            </motion.div>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
