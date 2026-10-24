import type { ReactNode } from "react";

// How every public hub opens (grammar, vocabulary, reading, idioms,
// writing, Bagrut, the level test): the title and intro standing on the
// lit horizon. One component so the hubs can't drift apart. Detail and
// reading pages don't use it; they open quietly on the text.
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
    <div className="relative isolate overflow-hidden bg-background-2 px-4 pt-12 pb-24 sm:pb-28 [--horizon-top:calc(100%-5rem)] [--horizon-width:84rem]">
      <span aria-hidden="true" className="horizon" />
      <div className={`max-w-4xl mx-auto ${center ? "text-center" : ""}`}>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{title}</h1>
        {children}
      </div>
    </div>
  );
}
