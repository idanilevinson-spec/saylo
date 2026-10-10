import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let session: object | null = null;
vi.mock("@/context/AuthProvider", () => ({ useAuth: () => ({ session }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import PracticeLink from "./PracticeLink";

const render = () =>
  renderToStaticMarkup(
    <PracticeLink signedInHref="/grammar/wish-if-only" signedInLabel="לתרגל באפליקציה" className="cta">
      להתחיל בחינם
    </PracticeLink>,
  );

describe("PracticeLink", () => {
  it("sends a visitor to sign up", () => {
    session = null;
    const html = render();
    expect(html).toContain('href="/signup"');
    expect(html).toContain("להתחיל בחינם");
  });

  it("sends a signed-in learner to the same material in the app", () => {
    session = { user: { id: "u1" } };
    const html = render();
    expect(html).toContain('href="/grammar/wish-if-only"');
    expect(html).toContain("לתרגל באפליקציה");
    expect(html).not.toContain("/signup");
  });
});
