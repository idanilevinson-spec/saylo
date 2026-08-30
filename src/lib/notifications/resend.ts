import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

export async function sendStreakReminderEmail(to: string, displayName: string): Promise<boolean> {
  const resend = getClient();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: "Saylo <reminders@saylo.app>",
    to,
    subject: "🔥 אל תשברו את הרצף שלכם היום",
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #4f46e5;">היי ${displayName},</h1>
        <p>עוד לא תרגלתם אנגלית היום — 5 דקות מספיקות כדי לשמור על הרצף שלכם ב-Saylo.</p>
        <a href="https://saylo.app/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          לתרגול עכשיו
        </a>
      </div>
    `,
  });

  return !error;
}
