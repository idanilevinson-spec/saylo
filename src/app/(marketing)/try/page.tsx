import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/og/meta";
import SiteFooter from "@/components/SiteFooter";
import HubHeader from "@/components/HubHeader";
import TryLesson from "@/components/try/TryLesson";
import { getTryLevels } from "@/lib/content/tryLesson";
import { COURSE_UNITS } from "@/lib/content/course";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";

// A taster lesson anyone can take without an account: six real questions
// from the course, checked on the spot. The questions are fetched on the
// server (cached) and graded in the browser; nothing is stored.

const DESCRIPTION =
  "שיעור אנגלית קצר בחינם, בלי הרשמה: שש שאלות אמיתיות מהמסלול של Saylo, עם בדיקה מיידית והסבר על כל טעות.";

export const metadata: Metadata = {
  title: "שיעור ניסיון באנגלית בחינם | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/try" },
  openGraph: pageOpenGraph("שיעור ניסיון באנגלית בחינם", DESCRIPTION, "/try"),
};

// Rebuilt at most hourly, like the cached questions under it.
export const revalidate = 3600;

export default async function TryPage() {
  const levels = await getTryLevels();

  return (
    <>
      <HubHeader title="שיעור טעימה, בלי הרשמה">
        <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
          שש שאלות מהיחידה הראשונה במסלול, כמו שהן באפליקציה: בודקים כל תשובה מיד, ומסבירים כל טעות. לוקח כשלוש דקות.
        </p>
      </HubHeader>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {levels.length > 0 ? (
          <TryLesson levels={levels} unitCount={COURSE_UNITS.length} trialDays={TRIAL_DAYS} />
        ) : (
          <p className="mt-8 text-muted">השיעור לא זמין כרגע. נסו שוב בעוד כמה דקות.</p>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
