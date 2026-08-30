"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";

const TABS = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/content", label: "תוכן" },
  { href: "/admin/moderation", label: "בקרת תוכן" },
  { href: "/admin/analytics", label: "אנליטיקס" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile?.is_admin) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  if (loading || !profile?.is_admin) {
    return <div className="max-w-5xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  const tabClass = (href: string) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
    }`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">ניהול המערכת</h1>
      <nav className="mt-4 flex flex-wrap items-center gap-1 bg-card/60 border border-card-border rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className={tabClass(tab.href)}>
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
