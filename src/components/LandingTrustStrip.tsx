"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

// A one-line trust signal, not a hero decoration — the "no credit card"
// promise earns its own quiet strip directly under the frame instead of
// competing with the headline for attention.
export default function LandingTrustStrip() {
  return (
    <div className="border-b border-card-border bg-background-2">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm text-muted"
      >
        <ShieldCheck size={16} className="text-accent shrink-0" />
        3 ימים ראשונים חינם, בלי כרטיס אשראי
      </motion.p>
    </div>
  );
}
