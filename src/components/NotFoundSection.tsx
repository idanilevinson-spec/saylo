"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Most dead links point inside one of the public libraries (an old grammar
// lesson, a renamed reading). Send people back to that library first, not
// only to the home page.
const SECTIONS: { prefix: string; href: string; label: string }[] = [
  { prefix: "/english-grammar/", href: "/english-grammar", label: "לכל נושאי הדקדוק" },
  { prefix: "/english-vocabulary/", href: "/english-vocabulary", label: "לכל נושאי אוצר המילים" },
  { prefix: "/english-idioms/", href: "/english-idioms", label: "לכל הביטויים" },
  { prefix: "/english-reading/", href: "/english-reading", label: "לכל קטעי הקריאה" },
  { prefix: "/english-writing/", href: "/english-writing", label: "לכל נושאי החיבור" },
  { prefix: "/english-bagrut/", href: "/english-bagrut", label: "לכל שאלוני הבגרות" },
];

export default function NotFoundSection() {
  const pathname = usePathname() ?? "";
  const section = SECTIONS.find((s) => pathname.startsWith(s.prefix));
  if (!section) return null;
  return (
    <Link
      href={section.href}
      className="lit-plate mt-8 flex items-center justify-between gap-3 rounded-lg border border-primary/60 bg-card px-5 py-4 font-bold hover:border-primary transition-colors"
    >
      {section.label}
      <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-primary" />
    </Link>
  );
}
