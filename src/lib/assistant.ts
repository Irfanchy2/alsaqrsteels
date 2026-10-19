export type ChatMessage = { role: "user" | "assistant"; content: string };

export type EnquirySummary = {
  service: string;
  location: string;
  scope: string;
  dimensions: string;
  quantities: string;
  targetDate: string;
  openQuestions: string[];
};

// Session key used to hand an edited summary to the quote form.
export const HANDOFF_KEY = "asq-assistant-handoff";

export const ASSISTANT_LIMITS = {
  maxMessages: 24,
  maxUserChars: 1000,
  maxOutputTokens: 700,
};

// Strings that look like contact details — the chat asks before sending them.
export const CONTACT_PATTERN = /([^\s@]+@[^\s@]+\.[^\s@]{2,})|(\+?\d[\d\s()-]{7,}\d)/;
