"use client";

import Link from "next/link";
import PenMark from "@/components/PenMark";
import { useAuth } from "@/context/AuthProvider";

export default function LandingFinalCta() {
  // Same reasoning as LandingHero's CTA: a signed-in visitor should never
  // be sent back through /signup.
  const { session } = useAuth();
  const ctaHref = session ? "/dashboard" : "/signup";

  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-6xl font-black leading-[1.08]">
          בעוד כעשר דקות
          <br />
          תדעו את <PenMark>הרמה שלכם</PenMark>
        </h2>
        <p className="mt-6 text-lg text-muted leading-relaxed">
          ומיד אחריהן תחכה לכם תוכנית יומית שבנויה עליה. שלושה ימים חינם, בלי כרטיס אשראי.
        </p>
        <Link
          href={ctaHref}
          className="game-press mt-9 inline-flex items-center justify-center px-10 py-4 rounded-md bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors"
        >
          התחילו ללמוד בחינם
        </Link>
        {!session && (
          <p className="mt-5 text-muted">
            רוצים קודם לנסות?{" "}
            <Link href="/try" className="font-bold text-foreground underline decoration-card-border decoration-2 underline-offset-4 hover:decoration-foreground">
              שיעור ניסיון של כ-3 דקות, בלי הרשמה
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
