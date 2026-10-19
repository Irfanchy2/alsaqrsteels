"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

// Counts a page view on every navigation. Cookie-free: a per-tab flag marks
// the first view of a visit; only the referring site's host name is sent.
export default function PageViews() {
  const pathname = usePathname();
  useEffect(() => {
    let isNew = false;
    let ref: string | undefined;
    try {
      isNew = !sessionStorage.getItem("asq-visit");
      if (isNew) {
        sessionStorage.setItem("asq-visit", "1");
        const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        if (host && host !== window.location.hostname.replace(/^www\./, "")) ref = host;
      }
    } catch {
      // Storage blocked: still count the view.
    }
    const w = window.innerWidth;
    track({ name: "page_view", props: { ref, device: w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop", new: isNew || undefined } });
  }, [pathname]);
  return null;
}
