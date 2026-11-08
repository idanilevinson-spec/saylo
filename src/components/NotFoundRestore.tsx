"use client";

import { useEffect } from "react";

// When a content page (e.g. /english-grammar/<unknown>) calls notFound(),
// Next.js streams the 404 without the inline head scripts that set the
// theme before paint, and without the not-found metadata: the page came up
// light for a learner on dark mode, titled just "Saylo". This puts both
// back once the page is running. Normal 404s already have them, so it does
// nothing there.
export default function NotFoundRestore({ title }: { title: string }) {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.getAttribute("data-theme")) {
      let theme = "dark";
      try {
        if (localStorage.getItem("theme") === "light") theme = "light";
      } catch {}
      html.setAttribute("data-theme", theme);
    }
    if (document.title !== title) document.title = title;
  }, [title]);
  return null;
}
