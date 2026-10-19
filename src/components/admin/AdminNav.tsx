"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type AdminNavItem = { href: string; label: string; icon?: string; group?: string };

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

  const groups = items.reduce<Record<string, AdminNavItem[]>>((acc, it) => {
    (acc[it.group ?? ""] ??= []).push(it);
    return acc;
  }, {});
  const list = (
    <div className="space-y-5">
      {Object.entries(groups).map(([group, entries]) => (
        <div key={group || "main"}>
          {group ? <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-on-ink-muted/70">{group}</p> : null}
          <ul className="space-y-0.5">
            {entries.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  aria-current={active(item.href) ? "page" : undefined}
                  className="admin-nav-link flex min-h-11 items-center gap-3 rounded-md px-3 text-[0.95rem] lg:min-h-9 lg:text-sm"
                >
                  {item.icon ? <NavIcon name={item.icon} /> : null}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
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
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-flame">{role === "admin" ? "Admin" : "Editor"}</p>
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
      <aside className="hidden border-e border-line-ink bg-ink text-on-ink lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5"><img src="/icon.png" alt="" width={28} height={28} className="rounded" /><p className="font-display text-lg font-bold">Al Saqr admin</p></div>
          <p className="mt-3 truncate text-xs text-on-ink-muted">{email}</p>
          <p className="mt-2 inline-block rounded-full bg-flame/15 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-flame">{role === "admin" ? "Admin" : "Editor"}</p>
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

// Small line icons for the sidebar (24px grid, currentColor).
const ICONS: Record<string, string> = {
  dashboard: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",
  pages: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8",
  inbox: "M3 13l3-9h12l3 9v7H3zM3 13h5l1 3h6l1-3h5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  projects: "M3 7h18v13H3zM8 7V4h8v3",
  blog: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5",
  services: "M14 7l3-3 3 3-3 3M4 20l9-9M7 4l2 2-3 3-2-2z",
  faq: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01",
  clients: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  cert: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1",
  docs: "M14 2H6v20h12V6zM14 2v4h4",
  company: "M3 21h18M5 21V7l7-4 7 4v14M9 10h1M14 10h1M9 14h1M14 14h1",
  motion: "M13 2 3 14h9l-1 8 10-12h-9z",
  team: "M16 11a4 4 0 1 0 0-8M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 15a6 6 0 0 1 6 6",
};
function NavIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none opacity-80">
      <path d={ICONS[name] ?? ICONS.pages} />
    </svg>
  );
}
