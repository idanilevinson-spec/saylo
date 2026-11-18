import Link from "next/link";

// The year Saylo's reading texts and Bagrut sets were first published.
// Fixed, not the current year: a copyright line names when a work was made.
const FIRST_PUBLISHED = 2026;

// Small print under a text written for Saylo: who it belongs to and that it
// may not be copied. Only under texts that are Saylo's own work (the
// reading library, the Bagrut practice sets and skill examples), never
// under something a learner wrote or the teacher generated on the spot.
export default function TextRights({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-muted ${className}`}>
      <span dir="ltr">© {FIRST_PUBLISHED} Saylo</span>. הטקסט נכתב במקור עבור Saylo, וכל הזכויות בו שמורות. אין
      להעתיק, להפיץ, לפרסם או להשתמש בו לאימון מערכות בינה מלאכותית בלי אישור בכתב.{" "}
      <Link href="/terms#intellectual-property" className="underline underline-offset-2 hover:text-foreground">
        תנאי השימוש
      </Link>
    </p>
  );
}
