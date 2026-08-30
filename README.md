# Saylo

אתר ללימוד אנגלית מותאם אישית — מבחן רמה, מסלול לימוד אישי לפי CEFR, מורה AI שמכיר את החולשות והחוזקות שלכם, ותרגול דיבור וכתיבה עם משוב אמיתי. הבאקנד הוא Supabase (auth, database), ה-AI מבוסס Claude (Anthropic), והתשלומים דרך Stripe.

זהו פרויקט חדש ונפרד מ-FOMO (אפליקציית התאמת המסיבות בתיקייה השכנה) — לא קשור אליו.

## הרצה מקומית

1. `npm install`
2. להעתיק את `.env.local.example` ל-`.env.local` ולמלא את כל המפתחות (Supabase, Anthropic, Stripe) — ראו הערות בקובץ עצמו לאיפה להשיג כל אחד.
3. להריץ את [`supabase/schema.sql`](supabase/schema.sql) מול פרויקט Supabase **חדש** (SQL Editor → New query), ואת קבצי `supabase/seed/*.sql` לפי הסדר המספרי כדי לטעון תוכן לימוד לדוגמה.
4. Authentication → Providers: לוודא ש-Email מופעל. Google (אופציונלי) דורש client ID/secret משלכם תחת אותה מסך.
5. `npm run dev` ולפתוח http://localhost:3002
6. `npm test` להרצת הטסטים האוטומטיים (לוגיקת מנויים/לבבות).

## מצב נוכחי

שלבים 1–9 בנויים ומאומתים: יסודות ומערכת עיצוב (כולל מצב כהה/בהיר ועיצוב עם אנימציות תגובתיות בכל האתר), אוצר מילים ודקדוק, תרגילים וגיימיפיקציה וחזרה חכמה (SRS), קריאה והאזנה, AI (מבחן רמה / Writing Coach / המלצות מורה), דיבור עם AI (תרחישים + שיחה חופשית + אישור הורה לקטינים), מנויים/תשלומים דרך Stripe (ניסיון חינם, מגבלת "לבבות" לתוכנית החינמית, שדרוג לפרימיום), לוח ניהול (Admin CMS) ב-`/admin`, **תרגול הגייה חי עם ניקוד** דרך Azure AI Speech (Pronunciation Assessment — זמין למנויי פרימיום, ראו `src/components/PronunciationRecorder.tsx`), **התראות** — תזכורות רצף במייל (Resend) ו-Web Push, מופעלות דרך cron יומי (`vercel.json` + `/api/cron/reminders`), ו-**PWA** (ניתן להתקין את האתר כאפליקציה — `manifest.ts`, אייקונים דינמיים, service worker).

עדיין לא בנוי (הוחלט לדחות עד שיהיה צורך אמיתי): פיצ'ר "דיווח משתמש" ידני (כרגע מנהלים בלבד יכולים לסמן שיחות לבדיקה).

## פריסה (Deployment)

Vercel הוא הפתרון הטבעי ל-Next.js:

1. לוודא שהריפו דחוף ל-GitHub.
2. ב-[vercel.com](https://vercel.com) → New Project → לייבא את הריפו.
3. בהגדרות הפרויקט ב-Vercel (Environment Variables) להוסיף את כל המשתנים מ-`.env.local`.
4. ב-Stripe: להגדיר webhook endpoint אמיתי שמצביע על `https://<הדומיין שלכם>/api/webhooks/stripe` ולעדכן את `STRIPE_WEBHOOK_SECRET` בהתאם (הערך הנוכחי הוא זמני, מ-`stripe listen` לפיתוח מקומי).
5. ב-Resend: לאמת דומיין שליחה (resend.com/domains) — בלי זה אפשר לשלוח מיילים רק לכתובת שנרשמתם איתה ל-Resend, לא למשתמשים אמיתיים.
6. `vercel.json` כבר מגדיר cron יומי ל-`/api/cron/reminders` — ברגע שמשתנה הסביבה `CRON_SECRET` מוגדר בפרויקט ב-Vercel, זה עובד אוטומטית (Vercel מצרף אותו כ-Bearer token).
7. Deploy.

## מבנה הפרויקט

- `src/app/(marketing)` — דף נחיתה ומחירים (ציבורי)
- `src/app/(auth)` — הרשמה, התחברות, איפוס סיסמה
- `src/app/(app)` — כל מסכי הלמידה (מוגן, דורש התחברות)
- `src/app/(admin)/admin` — לוח ניהול (מוגן, דורש `profiles.is_admin = true`)
- `src/app/consent/[token]` — עמוד אישור הורה (ציבורי, ללא התחברות)
- `src/app/api/ai/*` — נקודות קצה ל-AI (Claude)
- `src/app/api/stripe/*`, `src/app/api/webhooks/stripe` — checkout ו-webhook
- `src/proxy.ts` — הגנת נתיבים (Next 16 middleware)
- `src/lib/` — כל הלוגיקה העסקית, מחולקת לפי תחום (ai, srs, gamification, subscriptions, speech, exercises...)
- `src/types/database.ts` — טיפוסי הטבלאות
- `supabase/schema.sql` — הסכמה המלאה — להתקנה מאפס
- `supabase/migrations/` — שינויים תוספתיים, ממוספרים לפי סדר הרצה
- `supabase/seed/` — תוכן לימוד לדוגמה (אוצר מילים, דקדוק, תרגילים, תרחישי שיחה...)
