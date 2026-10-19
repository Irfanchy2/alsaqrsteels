"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Company } from "@/lib/content/types";
import { track } from "@/lib/track";
import WhatsAppButton from "./WhatsAppButton";

// Fixed contact bar for phones: the three ways to reach the company, always
// one thumb away.
export default function MobileContactBar({ company }: { company: Company }) {
  const pathname = usePathname();
  const phone = company.phones[0];
  const onQuote = pathname.startsWith("/quote");
  return (
    <div
      data-no-print
      className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line-ink bg-ink text-on-ink lg:hidden"
      style={{
        gridTemplateColumns: `repeat(${[phone, company.whatsapp, !onQuote].filter(Boolean).length}, minmax(0, 1fr))`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {phone ? (
        <a
          href={`tel:${phone.e164}`}
          onClick={() => track({ name: "contact_click", props: { channel: "phone" } })}
          className="flex min-h-14 items-center justify-center gap-2 text-sm font-semibold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
          </svg>
          Call
        </a>
      ) : null}
      {company.whatsapp ? (
        <WhatsAppButton
          number={company.whatsapp}
          className="flex min-h-14 items-center justify-center gap-2 border-s border-line-ink text-sm font-semibold"
        />
      ) : null}
      {!onQuote ? (
        <Link href="/quote" className="flex min-h-14 items-center justify-center whitespace-nowrap bg-flame px-2 text-sm font-semibold text-white">
          Get a quote
        </Link>
      ) : null}
    </div>
  );
}
