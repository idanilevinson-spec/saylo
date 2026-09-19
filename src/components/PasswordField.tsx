"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "dir" | "className">;

// A show/hide toggle makes typing a password on a phone far less error-prone.
export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        dir="ltr"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
        aria-pressed={visible}
        className="absolute right-0 inset-y-0 w-11 flex items-center justify-center rounded-lg text-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary"
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
