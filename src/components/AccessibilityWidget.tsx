"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Accessibility, X, Plus, Minus, RotateCcw } from "lucide-react";

export interface A11yPrefs {
  fontScale: 100 | 110 | 125 | 140;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readingSpacing: boolean;
  stopAnimations: boolean;
}

export const DEFAULT_A11Y_PREFS: A11yPrefs = {
  fontScale: 100,
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  readingSpacing: false,
  stopAnimations: false,
};

const FONT_STEPS: A11yPrefs["fontScale"][] = [100, 110, 125, 140];

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`flex w-10 h-6 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          checked ? "bg-primary justify-end" : "bg-card-border justify-start"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-background shadow" />
      </button>
    </div>
  );
}

interface AccessibilityWidgetProps {
  prefs: A11yPrefs;
  setPrefs: Dispatch<SetStateAction<A11yPrefs>>;
}

// A floating accessibility control — required in practice for Israeli sites
// alongside AA contrast, full keyboard support and an accessibility
// statement (תקנות שוויון זכויות לאנשים עם מוגבלות / ת"י 5568). Lets a
// visitor adjust things an OS-level setting can't reach for them: text
// size, contrast, motion, and reading spacing, without leaving the page.
export default function AccessibilityWidget({ prefs, setPrefs }: AccessibilityWidgetProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [open]);

  function stepFont(direction: 1 | -1) {
    setPrefs((p) => {
      const i = FONT_STEPS.indexOf(p.fontScale);
      const next = FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, i + direction))];
      return { ...p, fontScale: next };
    });
  }

  function toggle(key: keyof Omit<A11yPrefs, "fontScale">) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="a11y-panel"
        aria-label="תפריט נגישות"
        className="fixed bottom-4 end-4 z-[60] w-12 h-12 rounded-full bg-primary text-primary-ink shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Accessibility size={24} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-label="אפשרויות נגישות"
          className="fixed bottom-20 end-4 z-[60] w-72 max-w-[calc(100vw-2rem)] bg-card border border-card-border rounded-lg shadow-2xl p-4"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">אפשרויות נגישות</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="סגירת תפריט נגישות"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>גודל טקסט</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepFont(-1)}
                  disabled={prefs.fontScale === FONT_STEPS[0]}
                  aria-label="הקטנת טקסט"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-card-border hover:bg-background-2 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-xs text-muted" aria-live="polite">
                  {prefs.fontScale}%
                </span>
                <button
                  type="button"
                  onClick={() => stepFont(1)}
                  disabled={prefs.fontScale === FONT_STEPS[FONT_STEPS.length - 1]}
                  aria-label="הגדלת טקסט"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-card-border hover:bg-background-2 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <ToggleRow label="ניגודיות גבוהה" checked={prefs.highContrast} onChange={() => toggle("highContrast")} />
            <ToggleRow label="גווני אפור" checked={prefs.grayscale} onChange={() => toggle("grayscale")} />
            <ToggleRow label="הדגשת קישורים" checked={prefs.underlineLinks} onChange={() => toggle("underlineLinks")} />
            <ToggleRow
              label="ריווח קריאה מוגדל"
              checked={prefs.readingSpacing}
              onChange={() => toggle("readingSpacing")}
            />
            <ToggleRow label="עצירת אנימציות" checked={prefs.stopAnimations} onChange={() => toggle("stopAnimations")} />
          </div>

          <button
            type="button"
            onClick={() => setPrefs(DEFAULT_A11Y_PREFS)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-card-border text-muted text-xs font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            <RotateCcw size={13} /> איפוס הגדרות
          </button>

          <p className="mt-3 text-[11px] text-muted leading-relaxed">
            נתקלתם בבעיית נגישות?{" "}
            <a href="/accessibility" className="text-primary hover:underline">
              הצהרת הנגישות שלנו
            </a>
          </p>
        </div>
      )}
    </>
  );
}
