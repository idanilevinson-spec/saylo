import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import {
  BUSINESS_ADDRESS,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
  BUSINESS_REGISTRATION,
  CONTACT_EMAIL,
  LEGAL_UPDATED,
} from "@/lib/legal/siteInfo";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export default function LegalPage({ title, children }: LegalPageProps) {
  return (
    <>
      <section className="px-4 pt-16 pb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">עודכן לאחרונה: {LEGAL_UPDATED}</p>
        <div className="mt-8 space-y-8 text-foreground leading-relaxed">{children}</div>
      </section>
      <SiteFooter />
    </>
  );
}

interface LegalSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-muted">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc list-inside space-y-1.5">{children}</ul>;
}

export function PhoneLink() {
  if (!BUSINESS_PHONE) return null;
  return (
    <a href={`tel:${BUSINESS_PHONE_TEL}`} dir="ltr" className="inline-block text-primary hover:underline">
      {BUSINESS_PHONE}
    </a>
  );
}

export function EmailLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
      {CONTACT_EMAIL}
    </a>
  );
}

// The seller details a consumer is entitled to see before buying online.
export function BusinessDetails() {
  return (
    <LegalList>
      <li>שם העסק: {BUSINESS_NAME}</li>
      {BUSINESS_REGISTRATION && <li>{BUSINESS_REGISTRATION}</li>}
      {BUSINESS_ADDRESS && <li>כתובת: {BUSINESS_ADDRESS}</li>}
      {BUSINESS_PHONE && (
        <li>
          טלפון: <PhoneLink />
        </li>
      )}
      <li>
        אימייל: <EmailLink />
      </li>
    </LegalList>
  );
}
