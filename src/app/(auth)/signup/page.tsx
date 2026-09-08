import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "יצירת חשבון — Saylo",
};

export default function SignupPage() {
  return <SignupForm />;
}
