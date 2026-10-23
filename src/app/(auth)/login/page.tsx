import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { siteOpenGraph } from "@/lib/og/meta";

const DESCRIPTION = "התחברות לחשבון Saylo: ממשיכים מאיפה שעצרתם בתוכנית היומית ובשיחה עם המורה.";

export const metadata: Metadata = {
  title: "התחברות | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/login" },
  openGraph: siteOpenGraph("התחברות ל-Saylo", DESCRIPTION, "/login"),
};

export default function LoginPage() {
  return <LoginForm />;
}
