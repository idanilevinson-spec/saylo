import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

      <div className="mt-6 bg-card border border-card-border rounded-2xl p-6">
        <p className="leading-relaxed">
          <strong>{info.minor_display_name}</strong> (גיל {info.minor_age}) מבקש/ת את אישורכם להשתמש בתכונת תרגול
          השיחה עם AI באתר <strong>Saylo</strong>.
        </p>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          התכונה כרגע מבוססת טקסט בלבד (כתיבה וקריאה, בלי הקלטת קול). אם בעתיד תתווסף אפשרות דיבור עם מיקרופון,
          יידרש אישור נפרד לכך.
        </p>
      </div>

      <ConsentDecision token={token} initialStatus={info.status} />
    </div>
  );
}
