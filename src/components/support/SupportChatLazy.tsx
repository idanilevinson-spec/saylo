"use client";

import dynamic from "next/dynamic";

// The help chat is mounted on every page, but it renders nothing until the
// signed-in state is known (see SupportChat), and its panel brings in the
// whole Markdown stack (react-markdown, remark, micromark). Loaded as its
// own chunk after the page instead of in the shared bundle every visitor
// downloads before the page can respond, so the first page view does not
// pay for a chat most visitors never open.
const SupportChat = dynamic(() => import("./SupportChat"), { ssr: false });

export default function SupportChatLazy() {
  return <SupportChat />;
}
