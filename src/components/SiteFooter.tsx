import Link from "next/link";
import Image from "next/image";
import EnglishText from "@/components/EnglishText";

export default function SiteFooter() {
  return (
    <footer className="border-t border-card-border px-4 py-10 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={24} height={24} className="rounded-md" />
          <EnglishText as="span" className="font-bold text-foreground">
            saylo
          </EnglishText>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            מסלולים
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            התחברות
          </Link>
        </nav>
        <span>
          © {new Date().getFullYear()} כל הזכויות שמורות ל-
          <EnglishText as="span">SAYLO</EnglishText> לימודי אנגלית
        </span>
      </div>
    </footer>
  );
}
