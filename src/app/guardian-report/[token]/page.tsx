import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";
import GuardianReportDecision from "@/components/GuardianReportDecision";
import { createClient } from "@/lib/supabase/serverClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "דוח פעילות תקופתי — Saylo",
};

interface GuardianReportConsentInfo {
  minor_display_name: string;
  guardian_email: string;
  status: string;
}

export default async function GuardianReportConsentPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_guardian_report_consent_info", { p_token: token });
  const info = (data as GuardianReportConsentInfo[] | null)?.[0];
  if (!info) notFound();

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center">בקשה לדוח פעילות תקופתי</h1>

      <div className="mt-6 bg-card border border-card-border rounded-lg p-6">
        <p className="leading-relaxed">
          <strong>{info.minor_display_name}</strong> מבקש/ת את אישורכם לקבל מדי פעם, במייל, סיכום קצר של הפעילות
          שלו/ה ב-<strong>Saylo</strong>: כמה פעילויות השלים/ה, הרצף הנוכחי ורמת האנגלית הכללית.
        </p>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          זו בקשה נפרדת מאישור השימוש בקול ובמורה ה-AI, אם ניתן בעבר. הדוח לא כולל תוכן שיחות, טעויות ספציפיות, או
          כל פרט אישי אחר מעבר לסיכום הכללי שתואר למעלה, ואפשר להפסיק לקבל אותו בכל עת דרך קישור בכל מייל. אפשר
          לפנות אלינו בכל שאלה: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>. פרטים ב
          <Link href="/privacy" className="text-primary hover:underline">
            מדיניות הפרטיות
          </Link>
          .
        </p>
      </div>

      <GuardianReportDecision token={token} initialStatus={info.status} />
    </div>
  );
}
