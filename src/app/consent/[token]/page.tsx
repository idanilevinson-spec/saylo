import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";
import ConsentDecision from "@/components/ConsentDecision";
import { createClient } from "@/lib/supabase/serverClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "בקשת אישור הורה — Saylo",
};

interface ConsentInfo {
  minor_display_name: string;
  minor_age: number;
  guardian_email: string;
  status: string;
}

export default async function ConsentPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_guardian_consent_info", { p_token: token });
  const info = (data as ConsentInfo[] | null)?.[0];
  if (!info) notFound();

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center">בקשת אישור הורה</h1>

      <div className="mt-6 bg-card border border-card-border rounded-lg p-6">
        <p className="leading-relaxed">
          <strong>{info.minor_display_name}</strong> (גיל {info.minor_age}) מבקש/ת את אישורכם להשתמש בתכונת תרגול
          השיחה עם AI באתר <strong>Saylo</strong>.
        </p>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          השיחה יכולה להתנהל בכתב וגם בקול. בשיחה קולית הקול נשלח ל-Microsoft Azure לצורך תמלול, וההקלטה עצמה אינה
          נשמרת אצלנו; נשמר תמלול השיחה. הודעות השיחה נשלחות לספק ה-AI (Anthropic) כדי לייצר תשובות, בלי הכינוי
          והאימייל של {info.minor_display_name}. אפשר לפנות אלינו בכל עת בבקשה לעיין במידע, לתקן אותו או למחוק אותו:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
          . פרטים מלאים ב
          <Link href="/privacy" className="text-primary hover:underline">
            מדיניות הפרטיות
          </Link>
          .
        </p>
      </div>

      <ConsentDecision token={token} initialStatus={info.status} />
    </div>
  );
}
