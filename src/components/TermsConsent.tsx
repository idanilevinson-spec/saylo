"use client";

import Link from "next/link";

interface TermsConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TermsConsent({ checked, onChange }: TermsConsentProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted leading-relaxed">
        אנחנו אוספים רק את הפרטים הדרושים לפתיחת החשבון: כינוי, גיל, אימייל וסיסמה (או התחברות דרך Google או Apple).
        מסירת הפרטים אינה חובה על פי דין, אבל בלעדיהם אי אפשר לפתוח חשבון. מתחת לגיל 18 נדרש אישור הורה להקלטת
        קול ולשיחה עם מורה ה-AI.
      </p>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-5 h-5 shrink-0 accent-primary"
        />
        <span>
          קראתי את{" "}
          <Link href="/terms" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">
            תנאי השימוש
          </Link>{" "}
          ואת{" "}
          <Link href="/privacy" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">
            מדיניות הפרטיות
          </Link>
          , והם מקובלים עליי
          <span className="sr-only"> (נפתחים בלשונית חדשה)</span>
        </span>
      </label>
    </div>
  );
}
