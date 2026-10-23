import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";
import { siteOpenGraph } from "@/lib/og/meta";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";

const DESCRIPTION = `פותחים חשבון ב-Saylo ומתחילים במבחן רמה. ${TRIAL_DAYS} ימי ניסיון בחינם, בלי כרטיס אשראי.`;

export const metadata: Metadata = {
  title: "יצירת חשבון | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/signup" },
  openGraph: siteOpenGraph("יצירת חשבון ב-Saylo", DESCRIPTION, "/signup"),
};

export default function SignupPage() {
  return <SignupForm />;
}
