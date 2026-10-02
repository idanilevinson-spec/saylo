// Shared by the assistant's offer_callback_form tool, the request form and
// the admin screen — and must match the check constraint on
// support_requests.topic (migration 042).
export const SUPPORT_TOPICS = ["billing", "technical", "account", "content", "privacy", "school", "other"] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

export const SUPPORT_TOPIC_LABELS: Record<SupportTopic, string> = {
  billing: "תשלום ומנוי",
  technical: "תקלה טכנית",
  account: "חשבון והתחברות",
  content: "טעות בתוכן",
  privacy: "פרטיות ומידע אישי",
  school: "מורים ובתי ספר",
  other: "אחר",
};

export const SUPPORT_CHANNELS = ["email", "phone", "whatsapp"] as const;

export type SupportChannel = (typeof SUPPORT_CHANNELS)[number];

export const SUPPORT_CHANNEL_LABELS: Record<SupportChannel, string> = {
  email: "אימייל",
  phone: "שיחת טלפון",
  whatsapp: "וואטסאפ",
};

// Shared by the widget's composer and the chat route's validation.
export const SUPPORT_MAX_MESSAGE_LENGTH = 1000;
