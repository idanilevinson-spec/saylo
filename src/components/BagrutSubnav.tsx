"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

const TABS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/bagrut", label: "סקירה", match: (p) => p === "/bagrut" },
  { href: "/bagrut/track/3", label: "3 יח״ל", match: (p) => p.startsWith("/bagrut/track/3") },
  { href: "/bagrut/track/4", label: "4 יח״ל", match: (p) => p.startsWith("/bagrut/track/4") },
  { href: "/bagrut/track/5", label: "5 יח״ל", match: (p) => p.startsWith("/bagrut/track/5") },
  { href: "/bagrut/skills", label: "מיומנויות", match: (p) => p.startsWith("/bagrut/skills") },
  { href: "/bagrut/exam-guide", label: "לקראת הבחינה", match: (p) => p.startsWith("/bagrut/exam-guide") },
];

// The Bagrut area's own navigation, under the site navbar on every
// /bagrut page — so the area reads as one place with its own sections.
export default function BagrutSubnav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-card-border bg-background-2/60">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
        <Link href="/bagrut" className="hidden sm:inline-flex shrink-0 items-center gap-1.5 py-3 text-sm font-black tracking-tight">
          <GraduationCap size={17} aria-hidden="true" className="text-primary" />
          אזור הבגרות
        </Link>
        <nav aria-label="אזור הבגרות" className="-mx-4 sm:mx-0 flex flex-1 gap-1 overflow-x-auto px-4 sm:px-0 py-2 [scrollbar-width:none]">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`game-press shrink-0 inline-flex items-center min-h-9 px-3 rounded-lg text-sm font-medium transition-[background-color,color,transform] duration-150 ${
                  active ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
