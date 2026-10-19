"use client";

// Privacy-safe event tracking: event name, page path (no query string) and a
// few whitelisted, non-personal properties. Never pass names, phone numbers,
// emails or free text here. The server and the database both re-check this.
export type TrackEvent =
  | { name: "page_view"; props: { ref?: string; device: "mobile" | "tablet" | "desktop"; new?: boolean } }
  | { name: "contact_click"; props: { channel: "phone" | "whatsapp" | "email" | "maps" } }
  | { name: "quote_start"; props?: { service?: string } }
  | { name: "assistant_open"; props?: Record<string, never> }
  | { name: "assistant_handoff"; props?: { service?: string } };

export function track(event: TrackEvent) {
  try {
    const body = JSON.stringify({
      name: event.name,
      path: window.location.pathname,
      props: event.props ?? {},
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    // Tracking must never break the page.
  }
}
