"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GraduationCap } from "lucide-react";

const TABS: { href: string; label: string; match: (p: string) => boolean }[] = [
  // A questionnaire and its practice sets (/bagrut/E, /bagrut/E/4) are
  // reached from the overview, so it stays the marked tab there.
  { href: "/bagrut", label: "סקירה", match: (p) => p === "/bagrut" || /^\/bagrut\/[A-G](\/|$)/i.test(p) },
  { href: "/bagrut/track/3", label: "3 יח״ל", match: (p) => p.startsWith("/bagrut/track/3") },
  { href: "/bagrut/track/4", label: "4 יח״ל", match: (p) => p.startsWith("/bagrut/track/4") },
  { href: "/bagrut/track/5", label: "5 יח״ל", match: (p) => p.startsWith("/bagrut/track/5") },
  { href: "/bagrut/skills", label: "מיומנויות", match: (p) => p.startsWith("/bagrut/skills") },
  { href: "/bagrut/oral", label: "בעל פה", match: (p) => p.startsWith("/bagrut/oral") },
  { href: "/bagrut/exam-guide", label: "לקראת הבחינה", match: (p) => p.startsWith("/bagrut/exam-guide") },
];

// The Bagrut area's own navigation, under the site navbar on every
// /bagrut page — so the area reads as one place with its own sections.
export default function BagrutSubnav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  // On a phone the tabs run off the edge; keep the current one in view.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);
  return (
    <div className="border-b border-card-border bg-background-2/60">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
        <Link href="/bagrut" className="hidden sm:inline-flex shrink-0 items-center gap-1.5 pe-3 me-1 border-e border-card-border text-sm font-black tracking-tight">
          <GraduationCap size={17} aria-hidden="true" className="text-primary" />
          אזור הבגרות
        </Link>
        {/* The fade at the far edge shows a phone user there are more tabs. */}
        <nav
          ref={navRef}
          aria-label="אזור הבגרות"
          className="-mx-4 sm:mx-0 flex flex-1 gap-1 overflow-x-auto ps-4 pe-10 sm:px-0 [scrollbar-width:none] [mask-image:linear-gradient(to_left,transparent,black_2.5rem)] sm:[mask-image:none]"
        >
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative shrink-0 inline-flex items-center min-h-12 px-3 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 ${
                  active ? "font-bold text-foreground" : "font-medium text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                {/* The active tab sits on the area's edge, like a folder tab. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors duration-150 ${active ? "bg-primary" : "bg-transparent"}`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
