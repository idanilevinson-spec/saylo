"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

// data-theme is the single source of truth (also set by the no-flash inline
// script in layout.tsx before React ever mounts), so we read it directly
// instead of duplicating theme-resolution logic in a second place.
function getSnapshot(): Theme {
  return (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  listeners.forEach((listener) => listener());
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "עברו למצב בהיר" : "עברו למצב כהה"}
      title={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
