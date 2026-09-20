import "server-only";
import { Resend } from "resend";
import type { ScoreSummary } from "@/lib/reports/buildScoreSummary";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Every optional email says why it was sent and how to stop it.
const OPT_OUT_FOOTER = `<p style="margin-top: 24px; font-size: 12px; color: #6b7280;">קיבלתם מייל זה כי הפעלתם אותו בהגדרות הפרופיל. כדי להפסיק לקבל אותו, כבו אותו ב<a href="https://saylolearn.com/profile" style="color: #0066d6;">הגדרות הפרופיל</a>.</p>`;

// A one-off transactional message the minor asked for, so it carries no
// opt-out link: it explains who triggered it and that ignoring it changes
// nothing.
export async function sendGuardianConsentEmail(
  to: string,
  minorDisplayName: string,
  consentUrl: string
): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const name = minorDisplayName.trim() ? escapeHtml(minorDisplayName.trim()) : "מי שנרשמ/ה";
  const { error } = await resend.emails.send({
    from: "Saylo <consent@saylolearn.com>",
    to,
    subject: "בקשת אישור הורה ל-Saylo",
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0066d6;">בקשת אישור הורה</h1>
        <p><strong>${name}</strong> נרשמ/ה ל-Saylo, אפליקציה ללימוד אנגלית, והזינ/ה את כתובת המייל שלכם כדי לבקש את אישורכם, כהורים או כאפוטרופוסים, לתכונות שמקליטות קול ומשוחחות עם מורה AI.</p>
        <p>בקישור תראו מה בדיוק מאושר ואיך המידע מטופל, ותוכלו לאשר או לדחות.</p>
        <a href="${escapeHtml(consentUrl)}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #0066d6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          לצפייה בבקשה ולהחלטה
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">קיבלתם מייל זה כי מישהו הזין את כתובתכם בבקשה לאישור הורה. אם הבקשה לא מוכרת לכם, אפשר להתעלם ממנו: בלי אישור, התכונות האלה לא יופעלו. שאלות: <a href="mailto:${CONTACT_EMAIL}" style="color: #0066d6;">${CONTACT_EMAIL}</a>.</p>
      </div>
    `,
  });

  return !error;
}

export async function sendStreakReminderEmail(to: string, displayName: string): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "Saylo <reminders@saylolearn.com>",
    to,
    subject: "אל תשברו את הרצף שלכם היום",
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0066d6;">היי ${escapeHtml(displayName)},</h1>
        <p>עוד לא תרגלתם אנגלית היום — 5 דקות מספיקות כדי לשמור על הרצף שלכם ב-Saylo.</p>
        <a href="https://saylolearn.com/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #0066d6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          לתרגול עכשיו
        </a>
        ${OPT_OUT_FOOTER}
      </div>
    `,
  });

  return !error;
}

// Shared by sendWeeklyReportEmail/sendMonthlyReportEmail — same numbers
// buildScoreSummary hands the progress page's own history panel, so the
// email can never show something different from what a learner sees when
// they click through.
function reportEmailHtml(displayName: string, summary: ScoreSummary, periodLabel: string): string {
  const rows = summary.items
    .slice(0, 10)
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.typeLabel}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: left; color: #6b7280;">${item.detail}</td>
        </tr>`
    )
    .join("");

  const emptyState = `<p style="color: #6b7280;">אין עדיין פעילות ${periodLabel} — עוד לא מאוחר להתחיל.</p>`;

  return `
    <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #0066d6;">היי ${escapeHtml(displayName)},</h1>
      <p>הנה הדוח ${periodLabel} שלכם ב-Saylo:</p>

      <div style="display: flex; gap: 12px; margin: 20px 0;">
        <div style="flex: 1; background: #f9fafb; border-radius: 12px; padding: 14px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700;">${summary.testsCount}</div>
          <div style="font-size: 12px; color: #6b7280;">פעילויות</div>
        </div>
        <div style="flex: 1; background: #f9fafb; border-radius: 12px; padding: 14px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700;">${summary.averageScore !== null ? `${summary.averageScore}%` : "—"}</div>
          <div style="font-size: 12px; color: #6b7280;">ציון ממוצע</div>
        </div>
        <div style="flex: 1; background: #f9fafb; border-radius: 12px; padding: 14px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700;">${summary.xpEarned}</div>
          <div style="font-size: 12px; color: #6b7280;">XP</div>
        </div>
      </div>

      ${summary.items.length === 0 ? emptyState : `<table style="width: 100%; border-collapse: collapse;">${rows}</table>`}

      <a href="https://saylolearn.com/progress" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0066d6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
        לכל ההתקדמות שלי
      </a>
      ${OPT_OUT_FOOTER}
    </div>
  `;
}

export async function sendWeeklyReportEmail(to: string, displayName: string, summary: ScoreSummary): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "Saylo <reports@saylolearn.com>",
    to,
    subject: "הדוח השבועי שלכם ב-Saylo",
    html: reportEmailHtml(displayName, summary, "השבוע"),
  });

  return !error;
}

export async function sendMonthlyReportEmail(to: string, displayName: string, summary: ScoreSummary): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "Saylo <reports@saylolearn.com>",
    to,
    subject: "הדוח החודשי שלכם ב-Saylo",
    html: reportEmailHtml(displayName, summary, "החודש"),
  });

  return !error;
}
