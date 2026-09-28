# אפיון: מחברת הטעויות המאוחדת

סטטוס: טיוטה לאישור. לא נכתב קוד. תאריך: 28.9.2026.

## 1. הבעיה

היום יש **שלושה** מקומות נפרדים שיודעים על טעויות של לומד, ואף אחד לא מזין את השני:

| מקור | היכן | מה יש היום |
|---|---|---|
| מילים | `srs_items` + מנוע SM2 (`sm2.ts`) | תור חזרה אמיתי, מבוסס מרווחים, עובד היטב ב-`/review`. |
| דקדוק | `skill_levels` | רק רמת CEFR נוכחית לפי כישור. אין זיכרון "אילו נושאי דקדוק ספציפיים" קשים. |
| דפוסי עברית | `learner_pattern_observations` (Pattern Coach, 2026-09-21) | סופר הופעות בלבד. אין תזמון חזרה, רק מסך "הדפוסים שלי" עם תרגול חד-פעמי. |

**המטרה:** לומד עם 10 דקות פנויות מקבל **תור אחד**, שמערבב את שלושת הסוגים לפי מה שהכי דחוף לחזור עליו עכשיו — לא שלושה מסכים נפרדים.

## 2. החלטת עיצוב מרכזית: טבלה חדשה, לא הרחבת `srs_items`

`srs_items` היום: `profile_id, vocabulary_item_id, ease_factor, interval_days, repetitions, due_at`, עם `unique(profile_id, vocabulary_item_id)` ומסך `/review` שכבר משתמש בה בכבדות.

**לא משנים את הטבלה הזו.** במקום זאת, טבלה חדשה גנרית `mistake_review_items`, באותו דפוס בדיוק כמו `content_reports` (target_type/target_id) ש-Pattern Coach כבר אימץ:

```sql
create table public.mistake_review_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('vocabulary', 'grammar_topic', 'pattern')),
  item_ref text not null,        -- vocabulary_item_id / grammar_topic_id / pattern_code
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, item_type, item_ref)
);
```

**למה לא לאחד עם `srs_items` הקיימת:** מעבר לעמודה גנרית (`item_type`/`item_ref` במקום `vocabulary_item_id`) הוא מיגרציה על טבלה חיה שבה תלוי מסך פעיל, עם סיכון לשבור את חזרת המילים הקיימת. טבלה חדשה מייבאת סיכון אפס לזרימה הקיימת, ואפשר למזג את השתיים מאוחר יותר אם ירצו.

**מנוע הניקוד זהה.** `sm2.ts` כבר גנרי (`Sm2State` → `correct: boolean`), ומשמש כמו שהוא לשלושת הסוגים.

## 3. מאיפה מגיעות שורות חדשות

| סוג | מתי נוצרת/מתעדכנת שורה |
|---|---|
| `vocabulary` | ללא שינוי — ממשיך לחיות רק ב-`srs_items` הישן, לא כפול. |
| `grammar_topic` | כשלומד עונה לא נכון על תרגיל דקדוק (`ExercisePlayer`, `exercise.type` בנושא דקדוק): `upsert` לפי `grammar_topic_id` עם `correct=false`. תשובה נכונה על תרגיל מאותו נושא נספרת `correct=true` (מקדמת את התור, לא מוחקת אותו). |
| `pattern` | מ-`recordPatternObservations` הקיים (Pattern Coach): כל תיוג AI מאומת (`validateAiPatterns`) גם קורא ל-`sm2` על השורה המתאימה ב-`pattern_code`, לא רק סופר הופעה. |

**חשוב:** אין כאן קריאת AI נוספת. הכל נתלה על אירועים שכבר קיימים (`recordAttempt`, `recordPatternObservations`).

## 4. מה זה אומר "לחזור" על כל סוג

- **מילה:** בדיוק כמו היום — פלאשקארד/תרגיל מילון.
- **נושא דקדוק:** מגישים תרגיל אחד קיים מאותו `grammar_topic_id` (מתוך מאגר התרגילים הקיים, אין צורך בתוכן חדש).
- **דפוס עברית:** מגישים פריט אחד מתוך `getReviewedDrill(pattern_code)` — **ולכן שלב הזה תלוי בכך שדפוסי התרגול כבר אושרו** (ראו `docs/specs/hebrew-pattern-coach.md` §7, עדיין `reviewed: false` על כולם נכון ל-2026-09-28).

## 5. מסך התור המאוחד

- **כניסה:** `/review` הקיים משתנה, או נוסף `/review` חדש עם השם `/mistakes` (להחליט, ראו §7).
- **שאילתה:** `select * from mistake_review_items where profile_id = ? and due_at <= now() order by due_at limit 20`, בשילוב עם התור הקיים של `srs_items` (שתי שאילתות, ממוזגות ומעורבבות בקוד — לא UNION SQL, כדי לא לסבך RLS).
- **תצוגה:** לפי `item_type` מוצג הרכיב המתאים (Flashcard / תרגיל דקדוק / תרגול דפוס), בתוך ה"מעטפת" הקיימת של `/review` (התקדמות, ניקוד).

## 6. הגנות

- **RLS:** אותו דפוס כמו `learner_pattern_observations` — `select` בלבד למשתמש על השורה שלו, **כתיבה רק מהשרת/מהלקוח דרך פונקציה מבוקרת**, לא upsert חופשי. להחליט: תרגילי דקדוק כבר נכתבים היום מהלקוח (`recordAttempt.ts` רץ בדפדפן) — אימוץ אותה רמת אמון (לא שירות-role) הגיוני כאן, כי זה בדיוק כמו XP/streak: נתון קוסמטי, לא רגיש.
- **בדיקות:** לוגיקת המיזוג/מיון של התור, ולוגיקת ה-upsert לכל סוג — פונקציות טהורות שניתנות לבדיקה, באותו סגנון כמו `computeNextStreak`.

## 7. שאלות פתוחות לבעלים

1. **שם המסך:** להרחיב את `/review` הקיים או לפתוח מסך נפרד?
2. **סדר עדיפות בתור:** מה קודם כשיש גם מילים שפג תוקפן וגם דפוס דחוף? הצעה: לפי `due_at` בלבד (המנוע כבר קובע דחיפות), לא לפי סוג.
3. **תלות בדפוסי התרגול המאושרים** (Pattern Coach): הסעיף הזה לא יכול לעבוד במלואו עד שהתוכן שם יאושר. אפשר להתחיל בלי `pattern` (רק מילים+דקדוק), ולהוסיף דפוסים אחרי האישור.

## 8. סדר עבודה מוצע

| שלב | מה | גודל |
|---|---|---|
| 1 | מיגרציה `mistake_review_items` + בדיקות RLS | קטן |
| 2 | כתיבת שורת `grammar_topic` מתוך `recordAttempt` + בדיקות | בינוני |
| 3 | חיבור `pattern` מתוך `recordPatternObservations` (רק אחרי אישור התרגול) | קטן |
| 4 | מסך תור מאוחד | בינוני-גדול |
| 5 | בדיקות מיזוג/מיון | קטן |

**היקף כולל: גדול.** מומלץ לאשר את §2 (הטבלה הנפרדת) ואת §7 (השאלות) לפני שמתחילים בקוד.
