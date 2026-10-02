"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { isValidEmail, normalizePhone } from "@/lib/support/contact";
import {
  SUPPORT_CHANNEL_LABELS,
  SUPPORT_CHANNELS,
  SUPPORT_TOPIC_LABELS,
  SUPPORT_TOPICS,
  type SupportChannel,
  type SupportTopic,
} from "@/lib/support/topics";
import { EMAIL_INPUT } from "@/lib/utils/inputProps";

const TEL_INPUT = { type: "tel", inputMode: "tel", autoComplete: "tel" } as const;
const NAME_INPUT = { autoComplete: "name", autoCapitalize: "words" } as const;

interface SupportCallbackFormProps {
  conversationId: string | null;
  visitorToken: string;
  initialTopic: SupportTopic;
  initialMessage: string;
  defaultEmail: string;
  pagePath: string;
  onCancel?: () => void;
}

type Errors = Partial<Record<"name" | "email" | "phone" | "message" | "consent" | "form", string>>;

const fieldClass =
  "w-full px-3 py-2 rounded-lg border border-card-border bg-background text-base sm:text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 aria-[invalid=true]:border-danger";

const SERVER_ERRORS: Record<string, string> = {
  invalid_email: "כתובת האימייל לא נראית תקינה.",
  invalid_phone: "מספר הטלפון לא נראה תקין.",
  missing_contact: "חסר פרט ליצירת קשר בדרך שבחרתם.",
  rate_limited: "נשלחו כבר כמה פניות מהמכשיר הזה היום. אפשר לכתוב לנו גם במייל.",
};

// The hand-off from the assistant to a person. Lives inside the chat, under
// the answer that offered it, so the person never loses the conversation to
// fill it in. The transcript is attached on the server (only if this browser
// owns it), so they don't have to retell the story.
export default function SupportCallbackForm({
  conversationId,
  visitorToken,
  initialTopic,
  initialMessage,
  defaultEmail,
  pagePath,
  onCancel,
}: SupportCallbackFormProps) {
  const id = useId();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<SupportChannel>(defaultEmail ? "email" : "phone");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<SupportTopic>(initialTopic);
  const [message, setMessage] = useState(initialMessage);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  if (reference) {
    return (
      <div role="status" className="mt-2 rounded-lg border border-card-border bg-background p-3.5 text-sm">
        <p className="flex items-center gap-2 font-bold">
          <CheckCircle2 size={18} className="text-success shrink-0" aria-hidden="true" />
          הפנייה התקבלה
        </p>
        <p className="mt-1.5 leading-relaxed text-muted">
          נחזור אליכם {channel === "email" ? "במייל" : channel === "whatsapp" ? "בוואטסאפ" : "בטלפון"} בהקדם האפשרי. מספר
          הפנייה: <span dir="ltr" className="font-mono text-foreground select-all">{reference}</span>
        </p>
      </div>
    );
  }

  const usesPhone = channel !== "email";

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "איך לפנות אליכם?";
    if (!usesPhone && !isValidEmail(email.trim())) next.email = "צריך כתובת אימייל תקינה, למשל name@example.com.";
    if (usesPhone && !normalizePhone(phone)) next.phone = "צריך מספר טלפון תקין, למשל 050-1234567.";
    if (!message.trim()) next.message = "כתבו בקצרה במה אפשר לעזור.";
    if (!consent) next.consent = "צריך לאשר כדי שנוכל לשמור את הפרטים ולחזור אליכם.";
    return next;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users
      // land on it instead of hunting for it.
      const first = (["name", "email", "phone", "message", "consent"] as const).find((k) => found[k]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          visitorToken,
          name: name.trim(),
          email: usesPhone ? (email.trim() || undefined) : email.trim(),
          phone: usesPhone ? phone.trim() : undefined,
          preferredChannel: channel,
          topic,
          message: message.trim(),
          pagePath,
          consent: true,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setErrors({ form: SERVER_ERRORS[data.error ?? ""] ?? "השליחה לא הצליחה. נסו שוב בעוד רגע." });
        return;
      }
      setReference(data.reference);
    } catch {
      setErrors({ form: "אין חיבור לאינטרנט כרגע. בדקו את החיבור ונסו שוב." });
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="mt-1 text-xs text-danger">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={`${id}-title`}
      className="relative mt-2 rounded-lg border border-card-border bg-background p-3.5 text-sm"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-primary" />
      <h3 id={`${id}-title`} className="font-bold">
        נחזור אליכם
      </h3>
      <p className="mt-0.5 text-xs text-muted">השיחה עד עכשיו תצורף לפנייה, אין צורך לספר הכול מחדש.</p>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor={`${id}-name`} className="block text-xs font-medium mb-1">
            שם
          </label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={fieldClass}
            {...NAME_INPUT}
          />
          {errorText("name")}
        </div>

        <fieldset>
          <legend className="block text-xs font-medium mb-1">איך נחזור אליכם?</legend>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-card-border p-1">
            {SUPPORT_CHANNELS.map((c) => (
              <label
                key={c}
                className={`text-center text-xs py-1.5 rounded-md cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60 ${
                  channel === c ? "bg-primary text-primary-ink font-medium" : "text-muted hover:text-foreground hover:bg-background-2"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-channel`}
                  value={c}
                  checked={channel === c}
                  onChange={() => setChannel(c)}
                  className="sr-only"
                />
                {SUPPORT_CHANNEL_LABELS[c]}
              </label>
            ))}
          </div>
        </fieldset>

        {usesPhone ? (
          <div>
            <label htmlFor={`${id}-phone`} className="block text-xs font-medium mb-1">
              מספר טלפון
            </label>
            <input
              id={`${id}-phone`}
              value={phone}
              onChange={(e) => setPhone(e.target.value.slice(0, 30))}
              dir="ltr"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
              className={`${fieldClass} text-start`}
              {...TEL_INPUT}
            />
            {errorText("phone")}
          </div>
        ) : (
          <div>
            <label htmlFor={`${id}-email`} className="block text-xs font-medium mb-1">
              אימייל
            </label>
            <input
              id={`${id}-email`}
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 254))}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${id}-email-error` : undefined}
              className={`${fieldClass} text-start`}
              {...EMAIL_INPUT}
            />
            {errorText("email")}
          </div>
        )}

        <div>
          <label htmlFor={`${id}-topic`} className="block text-xs font-medium mb-1">
            נושא
          </label>
          <select
            id={`${id}-topic`}
            value={topic}
            onChange={(e) => setTopic(e.target.value as SupportTopic)}
            className={fieldClass}
          >
            {SUPPORT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {SUPPORT_TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-message`} className="block text-xs font-medium mb-1">
            במה אפשר לעזור?
          </label>
          <textarea
            id={`${id}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            rows={3}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
            className={`${fieldClass} resize-none`}
          />
          {errorText("message")}
        </div>

        {/* Honeypot: hidden from people and from assistive tech; bots fill it. */}
        <div aria-hidden="true" className="absolute -start-[9999px] w-px h-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer">
            <input
              id={`${id}-consent`}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
              className="mt-0.5 accent-[var(--color-primary)]"
            />
            <span>
              מאשרים ש-Saylo תשמור את הפרטים ואת השיחה כדי לחזור אליכם בנוגע לפנייה הזו בלבד. פרטים ב
              <Link href="/privacy#support" className="text-primary hover:underline" target="_blank">
                מדיניות הפרטיות
              </Link>
              .
            </span>
          </label>
          {errorText("consent")}
        </div>
      </div>

      {errors.form && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {errors.form}
        </p>
      )}

      <div className="mt-3.5 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
        >
          {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {submitting ? "שולח…" : "שליחה"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-foreground">
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}
