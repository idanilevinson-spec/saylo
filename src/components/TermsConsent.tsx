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
        מסירת הפרטים אינה חובה על פי דין, אבל בלעדיהם אי אפשר לפתוח חשבון. מתחת לגיל 18 נדרש אישור הורה לשיחה עם
        מורה ה-AI.
      </p>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-5 h-5 shrink-0 accent-primary"
        />
        <span>
          קראתי ואני מסכים/ה ל
          <Link href="/terms" target="_blank" rel="noopener" className="text-primary hover:underline">
            תנאי השימוש
          </Link>{" "}
          ול
          <Link href="/privacy" target="_blank" rel="noopener" className="text-primary hover:underline">
            מדיניות הפרטיות
          </Link>
          <span className="sr-only"> (נפתחים בלשונית חדשה)</span>
        </span>
      </label>
    </div>
  );
}
