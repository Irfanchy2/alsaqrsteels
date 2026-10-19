"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type AdminNavItem = { href: string; label: string };

// Desktop: fixed sidebar list. Phone/tablet: a compact top bar with the
// current section and a Menu button that opens a full-height drawer.
export default function AdminNav({
  items,
  email,
  role,
  signOut,
}: {
  items: AdminNavItem[];
  email: string;
  role: string;
  signOut: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  const current = items.find((i) => active(i.href))?.label ?? "Admin";

  useEffect(() => setOpen(false), [pathname]);

  // Instant feedback on every Save/Add button: show "Saving…" and block a
  // double submit while the server works. Restored when the page reloads
  // with the result (path or ?saved= changes) or after a safety timeout.
  const search = useSearchParams();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const restore = () => {
      setSaving(false);
      document.querySelectorAll<HTMLButtonElement>("button[data-saving-label]").forEach((b) => {
        b.textContent = b.dataset.savingLabel ?? b.textContent;
        b.disabled = false;
        delete b.dataset.savingLabel;
      });
    };
    restore();
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form.closest("main") || e.defaultPrevented) return;
      setSaving(true);
      window.setTimeout(() => {
        form.querySelectorAll<HTMLButtonElement>('button:not([type="button"])').forEach((b) => {
          b.dataset.savingLabel = b.textContent ?? "";
          b.textContent = "Saving…";
          b.disabled = true;
        });
      }, 0);
      window.setTimeout(restore, 15000);
    };
    document.addEventListener("submit", onSubmit);
    return () => document.removeEventListener("submit", onSubmit);
  }, [pathname, search]);

  const list = (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            prefetch
            aria-current={active(item.href) ? "page" : undefined}
            className="admin-nav-link flex min-h-11 items-center px-3 text-[0.95rem] lg:min-h-9 lg:text-sm"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {saving ? <span aria-hidden="true" className="admin-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-flame" /> : null}
      {/* Phone / tablet bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line-ink bg-ink px-4 text-on-ink lg:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-amber">Al Saqr admin</p>
          <p className="truncate text-sm font-semibold">{current}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="flex h-10 items-center gap-2 border border-line-ink px-3 font-mono text-xs uppercase tracking-[0.12em]"
        >
          <span aria-hidden="true" className="grid gap-[3px]">
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
            <span className="block h-[2px] w-4 bg-current" />
          </span>
          Menu
        </button>
      </div>

      {/* Drawer */}
      <div
        id="admin-drawer"
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/60 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          aria-label="Admin"
          className={`absolute inset-y-0 start-0 flex w-[82%] max-w-xs flex-col bg-ink text-on-ink shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-line-ink px-4">
            <p className="font-display text-lg font-bold">Al Saqr admin</p>
            <button type="button" onClick={() => setOpen(false)} className="h-10 px-2 text-2xl leading-none" aria-label="Close menu">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-3">{list}</div>
          <div className="border-t border-line-ink px-4 py-4 text-sm">
            <p className="truncate text-on-ink-muted">{email}</p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-amber">{role}</p>
            <div className="mt-3 flex items-center gap-4">
              <Link href="/" target="_blank" className="text-on-ink-muted underline">
                View website ↗
              </Link>
              {signOut}
            </div>
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden border-e border-line-ink bg-ink text-on-ink lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col">
        <div className="px-5 py-6">
          <p className="font-display text-lg font-bold">Al Saqr admin</p>
          <p className="mt-1 truncate text-xs text-on-ink-muted">{email}</p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-amber">{role}</p>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
          {list}
        </nav>
        <div className="space-y-1 px-3 py-5 text-sm">
          <Link href="/" className="block px-3 py-2 text-on-ink-muted hover:text-on-ink" target="_blank">
            View website ↗
          </Link>
          <div className="px-3 py-2">{signOut}</div>
        </div>
      </aside>
    </>
  );
}
