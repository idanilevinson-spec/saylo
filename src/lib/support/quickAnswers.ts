import "server-only";
import { PRICING_PLANS, TRIAL_DAYS, monthlyEquivalent } from "@/lib/subscriptions/plans";
import { DAILY_CONVERSATION_LIMIT, DAILY_WRITING_LIMIT } from "@/lib/legal/siteInfo";
import { REGEN_INTERVAL_MS } from "@/lib/subscriptions/hearts";
import type { readAccountStatus } from "./tools";
import type { QuickReplyId } from "./quickReplies";

// Fixed answers to the suggested questions (see quickReplies.ts for why
// they skip the AI). Every fact here also appears in knowledgeBase.ts and
// comes from the same constants, so the instant answer and the AI's answer
// to the same question can't disagree. Hebrew is gender-neutral throughout
// (plural or impersonal), like everything else the assistant says.

export type AccountStatus = Awaited<ReturnType<typeof readAccountStatus>>;

export interface QuickAnswerContext {
  signedIn: boolean;
  isNativeApp: boolean;
  // Present only when signed in and the answer needs it.
  account: AccountStatus | null;
}

const HEART_REGEN_HOURS = REGEN_INTERVAL_MS / (60 * 60 * 1000);
const cheapest = PRICING_PLANS.reduce((a, b) => (a.totalPrice < b.totalPrice ? a : b));
const annual = PRICING_PLANS.find((p) => p.months === 12);

const SIGN_IN_FIRST = "כדי לבדוק את זה צריך קודם [להתחבר](/login). אחרי ההתחברות אפשר לשאול שוב כאן.";

const APPLE_CANCEL = 'מנוי שנרכש באפליקציית ה-iPhone מבטלים בהגדרות ה-iPhone ← השם שלכם ← "מינויים" ← Saylo, לפחות 24 שעות לפני סוף התקופה.';

const WEB_CANCEL =
  'מבטלים בעצמכם ב[פרופיל](/profile), בכפתור "ביטול המנוי". הביטול נכנס לתוקף בסוף התקופה ששולמה, ועד אז הגישה נשארת מלאה ולא יהיה חיוב נוסף. עד סוף התקופה אפשר גם לבטל את הביטול.';

export function formatDateHe(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  });
}

export function needsAccount(id: QuickReplyId): boolean {
  return id === "my_subscription" || id === "no_hearts" || id === "teacher_unavailable" || id === "conversation_limit";
}

function planLabel(code: string | null | undefined): string | null {
  const months = { monthly: 1, bimonthly: 2, quarterly: 3, biannual: 6, annual: 12 }[code ?? ""];
  return PRICING_PLANS.find((p) => p.months === months)?.label ?? null;
}

function subscriptionAnswer(account: AccountStatus): string {
  const sub = account.subscription;
  if (sub.status === "none" || !("billing_provider" in sub)) {
    return `אין בחשבון מנוי פעיל. אפשר לבחור מסלול ב[מסלולים ומחירים](/pricing), החל מ-₪${cheapest.totalPrice} לחודש.`;
  }
  const viaApple = sub.billing_provider === "apple";
  const plan = planLabel(sub.plan);

  if (sub.status === "trialing" && sub.has_premium_features_now) {
    const ends = sub.trial_ends_at ? ` עד ${formatDateHe(sub.trial_ends_at)}` : "";
    return `אתם בתקופת הניסיון${ends}. היא כוללת את כל תכונות המנוי חוץ משיחה עם מורה ה-AI, ובסופה אין חיוב אוטומטי. כדי להמשיך אחריה בוחרים מסלול ב[מסלולים ומחירים](/pricing).`;
  }

  if (sub.status === "active" && sub.has_premium_features_now) {
    const planText = plan ? ` במסלול ה${plan}` : "";
    const source = viaApple ? ", שנרכש דרך Apple" : "";
    const end = sub.current_period_end ? formatDateHe(sub.current_period_end) : null;
    if (sub.cancellation_scheduled) {
      return `המנוי שלכם${planText}${source} פעיל, והחידוש שלו בוטל. הגישה המלאה נשארת${end ? ` עד ${end}` : " עד סוף התקופה ששולמה"}, ואחר כך לא יהיה חיוב נוסף. עד אז אפשר לבטל את הביטול ב[פרופיל](/profile).`;
    }
    const renewal = end ? ` הוא יתחדש אוטומטית ב-${end}.` : "";
    return `המנוי שלכם${planText}${source} פעיל, כולל שיחה עם מורה ה-AI.${renewal} ${viaApple ? APPLE_CANCEL : 'אפשר לבטל את החידוש בכל עת ב[פרופיל](/profile), בכפתור "ביטול המנוי".'}`;
  }

  if (sub.status === "past_due") {
    return `התשלום האחרון על המנוי לא עבר, ולכן הגישה לתכונות המנוי מוגבלת. ${viaApple ? "כדאי לבדוק את אמצעי התשלום בהגדרות ה-Apple ID." : "אפשר להשאיר פרטים ונעזור לסדר את זה."}`;
  }

  // canceled / expired, or a trial / period whose date has passed.
  return `אין כרגע מנוי פעיל בחשבון${sub.status === "trialing" ? " — תקופת הניסיון הסתיימה" : ""}. אפשר לחדש ב[מסלולים ומחירים](/pricing).`;
}

function heartsAnswer(account: AccountStatus): string {
  if (account.subscription.has_premium_features_now) {
    return "יש לכם מנוי פעיל או תקופת ניסיון, ולכן אין הגבלת לבבות: טעויות בתרגילים לא עולות לבבות.";
  }
  const hearts = typeof account.hearts === "object" && account.hearts ? account.hearts : null;
  const now = hearts ? ` כרגע יש לכם ${hearts.current} מתוך ${hearts.max}.` : "";
  return `בלי מנוי פעיל, כל טעות בתרגיל עולה לב, ולב אחד חוזר כל ${HEART_REGEN_HOURS} שעות.${now} במנוי אין הגבלת לבבות — המסלולים ב[מסלולים ומחירים](/pricing).`;
}

function teacherAnswer(account: AccountStatus): string {
  const sub = account.subscription;
  if (!sub.has_ai_teacher_conversation_now) {
    if (sub.status === "trialing" && sub.has_premium_features_now) {
      return "שיחה עם מורה ה-AI, בטקסט ובקול, זמינה רק במנוי בתשלום ולא בתקופת הניסיון. אפשר לבחור מסלול ב[מסלולים ומחירים](/pricing).";
    }
    return "שיחה עם מורה ה-AI, בטקסט ובקול, זמינה במנוי בתשלום, ואין כרגע מנוי פעיל בחשבון. אפשר לבחור מסלול ב[מסלולים ומחירים](/pricing).";
  }
  if (account.age_band && account.age_band !== "adult" && account.parental_consent_status !== "granted") {
    return "מתחת לגיל 18, שיחה עם מורה ה-AI דורשת אישור של הורה או אפוטרופוס. במסך שמופיע בעמוד [מורה AI](/speaking) מזינים את האימייל של ההורה, וההורה מקבל קישור לאישור.";
  }
  if (!account.ai_consent_given) {
    return "לפני השיחה הראשונה צריך לאשר את שליחת ההודעות לספק ה-AI. בעמוד [מורה AI](/speaking) יופיע מסך קצר עם ההסבר וכפתור אישור.";
  }
  const used = account.fair_use_last_24h.ai_teacher_conversations_started;
  if (used >= DAILY_CONVERSATION_LIMIT) {
    return `ב-24 השעות האחרונות התחלתם ${used} שיחות, וזו המגבלה היומית (${DAILY_CONVERSATION_LIMIT}). המגבלה מתאפסת בהדרגה, 24 שעות אחרי כל שיחה.`;
  }
  return "לפי החשבון, השיחה עם מורה ה-AI אמורה להיות זמינה לכם: יש מנוי פעיל ולא הגעתם למגבלה היומית. כדאי לרענן את הדף ולנסות שוב ב[מורה AI](/speaking). אם זה עדיין לא עובד, אפשר ללחוץ \"לדבר עם אדם\" ונבדוק.";
}

export function buildQuickAnswer(id: Exclude<QuickReplyId, "talk_to_person">, ctx: QuickAnswerContext): string {
  switch (id) {
    case "plans_difference": {
      const lines = PRICING_PLANS.map(
        (p) => `- ${p.label}: ₪${p.totalPrice}${p.months > 1 ? ` (כ-₪${monthlyEquivalent(p)} לחודש)` : ""}`
      ).join("\n");
      const apple = ctx.isNativeApp ? "\n\nבאפליקציית ה-iPhone הרכישה נעשית דרך Apple, במחיר שמוצג ב-App Store." : "";
      return `כל המסלולים כוללים את אותן תכונות. ההבדל הוא רק באורך התקופה ובמחיר:\n\n${lines}\n\nמשלמים מראש בתשלום אחד, והמנוי מתחדש אוטומטית לאותה תקופה עד שמבטלים.${apple}`;
    }
    case "cancel_anytime":
      return `כן. ${ctx.isNativeApp ? `${APPLE_CANCEL} מנוי שנרכש באתר: ${WEB_CANCEL}` : WEB_CANCEL} פרטים על החזרים ב[מדיניות ביטולים והחזרים](/refunds).`;
    case "how_to_cancel":
      return ctx.isNativeApp ? `${APPLE_CANCEL}\n\nמנוי שנרכש באתר: ${WEB_CANCEL}` : `${WEB_CANCEL}\n\n${APPLE_CANCEL}`;
    case "trial":
      return `כל חשבון חדש מקבל ${TRIAL_DAYS} ימי ניסיון חינם, בלי כרטיס אשראי ובלי חיוב אוטומטי בסופם. הניסיון כולל את כל תכונות המנוי, חוץ משיחה עם מורה ה-AI בטקסט ובקול, שזמינה רק במנוי בתשלום.`;
    case "emails_off":
      return 'ב[פרופיל](/profile), בחלק "התראות", אפשר לכבות כל אחד בנפרד: תזכורות, דוח שבועי ודוח חודשי. מיילי שירות, כמו איפוס סיסמה, ממשיכים להישלח.';
    case "delete_account":
      return 'ב[פרופיל](/profile), בתחתית העמוד, לוחצים "מחיקת החשבון" ומאשרים. החשבון וכל הנתונים נמחקים לצמיתות ואי אפשר לשחזר אותם. מנוי שנרכש ב-App Store לא מתבטל במחיקה, ולכן קודם מבטלים אותו בהגדרות ה-Apple ID.';
    case "microphone":
      return [
        "כמה דברים לבדוק:",
        "",
        ctx.isNativeApp
          ? "1. הרשאת מיקרופון: בהגדרות ה-iPhone ← Saylo ← להפעיל מיקרופון."
          : "1. הרשאת מיקרופון: לאשר לאתר גישה למיקרופון בהגדרות הדפדפן (בדרך כלל דרך סמל המנעול ליד הכתובת).",
        "2. לסגור אפליקציות אחרות שמשתמשות במיקרופון, כמו שיחה או הקלטה.",
        "3. לרענן את הדף ולהתחיל את התרגיל מחדש.",
        "4. מתחת לגיל 18, הקלטת קול דורשת אישור של הורה או אפוטרופוס.",
        "",
        'אם זה עדיין לא עובד, אפשר ללחוץ "לדבר עם אדם" ונבדוק.',
      ].join("\n");
    case "conversation_limit": {
      const base = `כן. אפשר להתחיל עד ${DAILY_CONVERSATION_LIMIT} שיחות חדשות עם מורה ה-AI ב-24 שעות, ועד ${DAILY_WRITING_LIMIT} הגשות כתיבה לבדיקה. המגבלה מתאפסת בהדרגה, 24 שעות אחרי כל שימוש.`;
      const used = ctx.account?.fair_use_last_24h.ai_teacher_conversations_started;
      return typeof used === "number" ? `${base} ב-24 השעות האחרונות התחלתם ${used} מתוך ${DAILY_CONVERSATION_LIMIT}.` : base;
    }
    case "what_is_saylo":
      return "Saylo היא פלטפורמה ללימוד אנגלית לדוברי עברית. מתחילים במבחן רמה, ומשם מקבלים מסלול אישי של תרגול באוצר מילים, דקדוק, קריאה, האזנה, כתיבה ודיבור, עם מורה AI שזוכר את הטעויות שחוזרות אצלכם. אפשר להתחיל ב[הרשמה](/signup), עם ניסיון חינם.";
    case "price":
      return `המסלולים מתחילים מ-₪${cheapest.totalPrice} לחודש${annual ? `, והשנתי עולה ₪${annual.totalPrice} (כ-₪${monthlyEquivalent(annual)} לחודש)` : ""}. כל חשבון חדש מקבל ${TRIAL_DAYS} ימי ניסיון חינם, בלי כרטיס אשראי. כל המסלולים ב[מסלולים ומחירים](/pricing).`;
    case "kids":
      return "כן. Saylo מתאימה לילדים, לבני נוער ולמבוגרים, ומבחן הרמה מתאים את התרגול לרמה של כל אחד. מתחת לגיל 18, הקלטת קול ושיחה עם מורה ה-AI דורשות אישור של הורה או אפוטרופוס, שמקבל קישור לאישור במייל.";
    case "my_subscription":
      return ctx.account ? subscriptionAnswer(ctx.account) : SIGN_IN_FIRST;
    case "no_hearts":
      return ctx.account ? heartsAnswer(ctx.account) : SIGN_IN_FIRST;
    case "teacher_unavailable":
      return ctx.account ? teacherAnswer(ctx.account) : SIGN_IN_FIRST;
  }
}
