"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import EnglishText from "@/components/EnglishText";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollProgress from "@/components/ScrollProgress";

const AUTHED_LINKS = [
  { href: "/dashboard", label: "לוח בקרה" },
  { href: "/placement", label: "מבחן רמה" },
  { href: "/learn", label: "מסלול לימוד" },
  { href: "/vocabulary", label: "אוצר מילים" },
  { href: "/grammar", label: "דקדוק" },
  { href: "/reading", label: "קריאה" },
  { href: "/games", label: "משחקים" },
];

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = profile?.is_admin ? [...AUTHED_LINKS, { href: "/admin", label: "ניהול" }] : AUTHED_LINKS;

  const linkClass = (href: string) => {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    return `px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
    }`;
  };

  const mobileLinkClass = (href: string) => {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    return `px-3 py-2.5 rounded-lg text-sm transition-colors ${
      active ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
    }`;
  };

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-card-border bg-background/90 backdrop-blur relative"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <ScrollProgress />
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 leading-tight" onClick={() => setMenuOpen(false)}>
          <Image src="/logo-mark.png" alt="" width={32} height={32} className="rounded-lg" />
          <span>
            <EnglishText
              as="span"
              className="block text-xl font-bold tracking-tight bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent"
            >
              saylo
            </EnglishText>
            <EnglishText as="span" className="block text-[10px] text-muted font-medium -mt-0.5">
              Speak. Learn. Grow.
            </EnglishText>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {session && (
            <nav className="hidden md:flex items-center gap-1 bg-card/60 border border-card-border rounded-xl p-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/profile" className={linkClass("/profile")}>
                {profile?.display_name ?? "פרופיל"}
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-lg text-sm text-muted hover:text-danger transition-colors"
              >
                התנתקות
              </button>
            </nav>
          )}

          {!session && pathname !== "/login" && (
            <div className="flex items-center gap-2">
              <Link href="/login" className={linkClass("/login")}>
                התחברות
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-ink hover:bg-primary-hover transition-colors"
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

      {session && menuOpen && (
        <nav className="md:hidden border-t border-card-border bg-background px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={mobileLinkClass(link.href)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/profile" className={mobileLinkClass("/profile")} onClick={() => setMenuOpen(false)}>
            {profile?.display_name ?? "פרופיל"}
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3 py-2.5 rounded-lg text-sm text-right text-muted hover:text-danger transition-colors"
          >
            התנתקות
          </button>
        </nav>
      )}
    </header>
  );
}
