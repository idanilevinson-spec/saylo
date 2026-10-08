"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Target,
  Map,
  BookOpen,
  PenLine,
  BookOpenText,
  MessageCircle,
  Gamepad2,
  GraduationCap,
  User,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import EnglishText from "@/components/EnglishText";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollProgress from "@/components/ScrollProgress";

// Same client-mounted idiom as OfflineBanner's useSyncExternalStore (not a
// setState-in-effect) — true only after hydration, so the mobile menu's
// createPortal target (document.body) is never touched during SSR.
function subscribeNever() {
  return () => {};
}
function getMountedSnapshot() {
  return true;
}
function getServerMountedSnapshot() {
  return false;
}

// Icons mirror the same concept-to-icon mapping the dashboard's module
// groups already use (Target for placement, Map for the learning path,
// BookOpen for vocabulary, etc.) — the mobile nav reuses the vocabulary
// the rest of the app already taught the learner, rather than inventing
// its own.
// mobileOnly: kept in the phone menu but left out of the desktop bar, which
// has room for only so many items — the placement test is a one-off that
// the dashboard already points to.
const AUTHED_LINKS: { href: string; label: string; icon: LucideIcon; mobileOnly?: boolean }[] = [
  { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/placement", label: "מבחן רמה", icon: Target, mobileOnly: true },
  { href: "/learn", label: "מסלול לימוד", icon: Map },
  // Its own area (sub-navigation in bagrut/layout.tsx): for the many
  // learners whose real goal is the matriculation exam, not general English.
  { href: "/bagrut", label: "בגרות", icon: GraduationCap },
  { href: "/vocabulary", label: "אוצר מילים", icon: BookOpen },
  { href: "/grammar", label: "דקדוק", icon: PenLine },
  { href: "/reading", label: "קריאה", icon: BookOpenText },
  { href: "/speaking", label: "מורה AI", icon: MessageCircle },
  { href: "/games", label: "משחקים", icon: Gamepad2 },
];

function MobileNavRow({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-ink" : "text-foreground hover:bg-background-2"
      }`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
          active ? "bg-primary-ink/15" : "bg-background-2"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1">{label}</span>
      <ChevronLeft size={16} className={active ? "opacity-70" : "text-muted"} />
    </Link>
  );
}

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  // The panel below is portaled to <body> (see return), so this only
  // guards against the SSR/client markup mismatch a portal would
  // otherwise cause on first render.
  const mounted = useSyncExternalStore(subscribeNever, getMountedSnapshot, getServerMountedSnapshot);

  // Exposes the navbar's real rendered height (safe-area padding, mobile
  // menu open/closed, font metrics and all) as a CSS var, so any page that
  // needs "exactly the viewport below the navbar, no scroll" can size
  // itself with calc(100dvh - var(--navbar-h)) instead of guessing a fixed
  // rem value — a guess that's wrong on notch/Dynamic Island devices, where
  // this header's own safe-area-inset-top padding makes it taller than a
  // no-notch estimate accounts for.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [menuOpen]);

  const links = profile?.is_admin
    ? [...AUTHED_LINKS, { href: "/admin", label: "ניהול", icon: ShieldCheck }]
    : AUTHED_LINKS;

  // Full-screen takeover locks the dashboard behind it from scrolling, the
  // way a native app's own menu would — without this, the page underneath
  // keeps scrolling along with the open menu on a long dashboard.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  const linkClass = (href: string) =>
    `shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive(href) ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
    }`;

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b-2 border-accent bg-background/90 backdrop-blur relative"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <ScrollProgress />
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 leading-tight shrink-0" onClick={() => setMenuOpen(false)}>
          <Image src="/logo-mark.png" alt="" width={32} height={32} className="rounded-lg" />
          <span>
            <EnglishText as="span" className="block text-xl font-black tracking-tight text-primary">
              saylo
            </EnglishText>
            <EnglishText as="span" className="hidden sm:block text-[10px] text-muted font-medium -mt-0.5">
              Speak. Learn. Grow.
            </EnglishText>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {session && (
            <nav className="hidden md:flex items-center gap-1 bg-card/60 border border-card-border rounded-xl p-1 min-w-0 overflow-x-auto [scrollbar-width:none]">
              {links.filter((link) => !("mobileOnly" in link && link.mobileOnly)).map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/profile" className={linkClass("/profile")}>
                {profile?.display_name ?? "פרופיל"}
              </Link>
              <button
                onClick={handleSignOut}
                className="shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-sm text-muted hover:text-danger transition-colors"
              >
                התנתקות
              </button>
            </nav>
          )}

          {!session && pathname !== "/login" && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/login" className={`${linkClass("/login")} whitespace-nowrap px-2 sm:px-3`}>
                התחברות
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap px-3 py-2 sm:px-4 rounded-lg text-sm font-medium bg-primary text-primary-ink hover:bg-primary-hover transition-colors"
              >
                התחילו חינם
              </Link>
            </div>
          )}

          <ThemeToggle />

          {session && (
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={menuOpen}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {mounted &&
        createPortal(
          // Portaled to <body>: the header above has `backdrop-blur`
          // (a `backdrop-filter`), which — like `filter`/`transform` —
          // establishes a new containing block for `position: fixed`
          // descendants. Left nested inside <header>, this panel's
          // "fixed, full height below the header" sizing resolves
          // against the header's own ~60px box instead of the
          // viewport and collapses to nothing. Portaling out of that
          // subtree is the standard fix, not a layout workaround.
          <AnimatePresence>
            {session && menuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-background overflow-y-auto"
                style={{ top: "var(--navbar-h)" }}
              >
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
                  {links.map((link) => (
                    <MobileNavRow
                      key={link.href}
                      {...link}
                      active={isActive(link.href)}
                      onClick={() => setMenuOpen(false)}
                    />
                  ))}
                </div>

                <div className="max-w-6xl mx-auto mt-2 border-t border-card-border px-4 py-4 flex flex-col gap-1">
                  <MobileNavRow
                    href="/profile"
                    label={profile?.display_name ?? "פרופיל"}
                    icon={User}
                    active={isActive("/profile")}
                    onClick={() => setMenuOpen(false)}
                  />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-danger/10">
                      <LogOut size={18} />
                    </span>
                    <span className="flex-1 text-right">התנתקות</span>
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
