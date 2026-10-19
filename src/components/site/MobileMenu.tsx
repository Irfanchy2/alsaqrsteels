"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import WhatsAppButton from "./WhatsAppButton";

type Item = { href: string; label: string };

export default function MobileMenu({
  items,
  phone,
  whatsapp,
}: {
  items: Item[];
  phone: { display: string; e164: string } | null;
  whatsapp: string | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center border border-line-ink text-on-ink transition-colors hover:border-amber hover:text-amber lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
          <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        className="m-0 ms-auto h-dvh max-h-none w-full max-w-sm bg-ink p-0 text-on-ink on-ink"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[4.5rem] items-center justify-between border-b border-line-ink px-5">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-on-ink-muted">Menu</span>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-line-ink"
              aria-label="Close menu"
              onClick={() => ref.current?.close()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
            <ul>
              <li>
                <Link href="/" className="flex min-h-14 items-center border-b border-line-ink font-display text-2xl font-extrabold uppercase [font-stretch:78%]">
                  Home
                </Link>
              </li>
              {items.map((item, i) => (
                <li key={item.href} className="fade-up" style={{ ["--d" as string]: `${80 + i * 60}ms` }}>
                  <Link
                    href={item.href}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    className="flex min-h-14 items-center justify-between border-b border-line-ink font-display text-2xl font-extrabold uppercase [font-stretch:78%] aria-[current=page]:text-accent-on-ink"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-normal text-amber">0{i + 1}</span>
                      {item.label}
                    </span>
                    <span aria-hidden="true" className="text-on-ink-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-line-ink p-5">
            <Link href="/quote" className="btn btn-primary w-full">
              Request a Quote
            </Link>
            <div className="grid grid-cols-2 gap-3">
              {phone ? (
                <a href={`tel:${phone.e164}`} className="btn btn-secondary-ink btn-sm">
                  Call
                </a>
              ) : null}
              {whatsapp ? <WhatsAppButton number={whatsapp} className="btn btn-secondary-ink btn-sm" /> : null}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
