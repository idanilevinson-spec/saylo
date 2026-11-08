import type { ReactNode } from "react";

// How every public hub opens (grammar, vocabulary, reading, idioms,
// writing, Bagrut, the level test, pricing): the title and intro set like a
// chapter opening, closed by a rule. One component so the hubs can't drift
// apart. Detail and reading pages don't use it; they open quietly on the text.
export default function HubHeader({
  title,
  children,
  center = false,
}: {
  title: ReactNode;
  children?: ReactNode;
  // Pricing opens centred over its cards; the hubs read from the start.
  center?: boolean;
}) {
  return (
    <div className="px-4 pt-12 sm:pt-16">
      <div className={`max-w-4xl mx-auto border-b border-foreground/15 pb-8 sm:pb-10 ${center ? "text-center" : ""}`}>
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.08]">{title}</h1>
        {children}
      </div>
    </div>
  );
}
