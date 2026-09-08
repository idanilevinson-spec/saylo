import type { Metadata } from "next";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "איפוס סיסמה — Saylo",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
