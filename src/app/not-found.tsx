import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import NotFoundContent from "@/components/site/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Unmatched URLs anywhere on the site get the full site chrome.
export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
