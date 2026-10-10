import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "התחברות — Saylo",
};

export default function LoginPage() {
  return <LoginForm />;
}
