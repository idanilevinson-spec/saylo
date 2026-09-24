"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

// Shown once, right after a successful account deletion redirects here (see
// profile/page.tsx). Makes the end of that flow visible instead of a silent
// drop onto the homepage — the confirmation App Review's account-deletion
// requirement expects to actually see.
export default function AccountDeletedNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(() => searchParams.get("accountDeleted") === "1");

  useEffect(() => {
    if (!visible) return;
    // Strip the param so a refresh or share of this URL doesn't re-show it.
    router.replace("/", { scroll: false });
    // Only ever meant to run once, right after mounting with the param
    // present — not on every re-render while still visible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-3 top-3 z-[60] sm:inset-x-auto sm:start-4 sm:max-w-md"
        >
          <div className="flex items-start gap-3 bg-card border border-card-border rounded-lg shadow-2xl p-4">
            <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm leading-relaxed flex-1">החשבון וכל הנתונים שלו נמחקו לצמיתות.</p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="סגירה"
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
