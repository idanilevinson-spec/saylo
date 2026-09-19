import Link from "next/link";
import Image from "next/image";
import EnglishText from "@/components/EnglishText";

const LINKS = [
  { href: "/pricing", label: "מסלולים" },
  { href: "/privacy", label: "פרטיות" },
  { href: "/privacy#cookies", label: "עוגיות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/refunds", label: "ביטולים והחזרים" },
  { href: "/support", label: "תמיכה" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/login", label: "התחברות" },
];

// Seller details (name, business number, address) live on the pages tied to a
// purchase: pricing, terms and refunds. Nothing personal is repeated here.
export default function SiteFooter() {
  return (
    <footer className="border-t border-card-border px-4 py-10 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-6 text-sm text-muted">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={24} height={24} className="rounded-md" />
          <EnglishText as="span" className="font-bold text-foreground">
            saylo
          </EnglishText>
        </div>
        <nav aria-label="ניווט תחתון" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors py-1">
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="text-center">
          © {new Date().getFullYear()} <EnglishText as="span">Saylo</EnglishText>. כל הזכויות שמורות
        </span>
      </div>
    </footer>
  );
}
