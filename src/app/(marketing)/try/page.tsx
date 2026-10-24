import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import HubHeader from "@/components/HubHeader";
import TrialLesson from "@/components/TrialLesson";
import { pageOpenGraph } from "@/lib/og/meta";
import { getTrialLesson, TRIAL_TRACKS } from "@/lib/content/trialLesson";

const DESCRIPTION =
  "שיעור אנגלית קצר בחינם, בלי הרשמה: שש שאלות אוצר מילים ודקדוק מהיחידה הראשונה ברמה שתבחרו, עם בדיקה מיידית ותשובה נכונה אחרי כל שאלה.";

export const metadata: Metadata = {
  title: "שיעור ניסיון באנגלית בחינם, בלי הרשמה | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/try" },
  openGraph: pageOpenGraph("שיעור ניסיון באנגלית בחינם", DESCRIPTION, "/try"),
};

interface PageProps {
  searchParams: Promise<{ level?: string }>;
}

// A few minutes of the real thing before the signup form: pick a level,
// answer six questions from the first unit there, see what an account adds.
export default async function TryPage({ searchParams }: PageProps) {
  const requested = (await searchParams).level;
  const track = TRIAL_TRACKS.find((t) => t.key === requested) ?? TRIAL_TRACKS[1];
  const lesson = await getTrialLesson(track.level);

  return (
    <>
      <HubHeader title="שיעור ניסיון, בלי הרשמה">
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          כ-3 דקות. שש שאלות מהיחידה הראשונה במסלול, ברמה שתבחרו, עם בדיקה מיידית אחרי כל תשובה. בלי חשבון ובלי כרטיס
          אשראי.
        </p>
      </HubHeader>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <nav aria-label="בחירת רמה" className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-muted">הרמה:</span>
          {TRIAL_TRACKS.map((t) => {
            const active = t.key === track.key;
            return (
              <Link
                key={t.key}
                href={`/try?level=${t.key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`game-press inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-bold transition-colors ${
                  active ? "border-primary bg-primary text-primary-ink" : "border-card-border bg-card hover:border-primary/50"
                }`}
              >
                {t.labelHe}
                <span className="font-content text-xs opacity-80" dir="ltr">
                  {t.level}
                </span>
              </Link>
            );
          })}
        </nav>

        {lesson ? (
          <>
            <p className="mt-6 text-sm text-muted">
              בסוף היחידה &quot;{lesson.unitTitleHe}&quot; תוכלו {lesson.goalHe}.
            </p>
            <div className="mt-4">
              <TrialLesson key={track.key} lesson={lesson} />
            </div>
          </>
        ) : (
          <p className="mt-8 rounded-lg border border-card-border bg-card px-4 py-3">
            השיעור לא זמין כרגע.{" "}
            <Link href="/english-level-test" className="font-bold text-primary hover:underline">
              למבחן הרמה
            </Link>
          </p>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
