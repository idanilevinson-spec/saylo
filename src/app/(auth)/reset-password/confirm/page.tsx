import type { Metadata } from "next";
import ResetPasswordConfirmForm from "@/components/ResetPasswordConfirmForm";

export const metadata: Metadata = {
  title: "בחירת סיסמה חדשה — Saylo",
};

export default function ResetPasswordConfirmPage() {
  return <ResetPasswordConfirmForm />;
}
