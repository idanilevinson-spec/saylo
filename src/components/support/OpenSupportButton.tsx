"use client";

import { LifeBuoy } from "lucide-react";
import { openSupportChat } from "./supportClient";

// For pages that point people to help (/support): opens the floating support
// widget instead of sending them away to their mail app.
export default function OpenSupportButton({ form = false, label }: { form?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={() => openSupportChat({ form })}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium hover:bg-primary-hover transition-colors"
    >
      <LifeBuoy size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
