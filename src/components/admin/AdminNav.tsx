"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type AdminNavItem = { href: string; label: string; icon?: string; group?: string };

// The admin shell, laid out like the Shopify admin: a dark top bar (logo,
// search across every admin section, account menu), a light sidebar on
// desktop (a drawer on phones), and the page content centred on a grey canvas.
export default function AdminNav({
  items,
  email,
  role,
  signOut,
  children,
}: {
  items: AdminNavItem[];
  email: string;
  role: string;
  signOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

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
    <div className="space-y-4">
      {Object.entries(groups).map(([group, entries]) => (
        <div key={group || "main"}>
          {group ? <p className="px-3 pb-1 text-[0.72rem] font-semibold text-[#616161]">{group}</p> : null}
          <ul className="space-y-px">
            {entries.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  aria-current={active(item.href) ? "page" : undefined}
                  className="admin-nav-link flex min-h-10 items-center gap-2.5 px-3 text-[0.9rem] lg:min-h-8 lg:text-[0.8125rem]"
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
      {saving ? <span aria-hidden="true" className="admin-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-[#005bd3]" /> : null}

      {/* Top bar */}
      <header className="admin-topbar sticky top-0 z-40 flex h-14 items-center gap-3 px-3 text-white sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label="Open menu"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/admin" className="flex flex-none items-center gap-2.5 lg:w-[13.25rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" width={28} height={28} className="rounded-md bg-white p-0.5" />
          <span className="hidden text-[0.9rem] font-semibold sm:inline">Al Saqr admin</span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-center">
          <AdminSearch items={items} />
        </div>
        <a href="/" target="_blank" rel="noopener" title="View website" className="hidden h-9 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] text-white/85 hover:bg-white/10 hover:text-white md:flex">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 3h7v7M21 3l-9 9M19 14v6H4V5h6" />
          </svg>
          View website
        </a>
        <AccountMenu email={email} role={role} signOut={signOut} />
      </header>

      {/* Drawer (phones and tablets) */}
      <div id="admin-drawer" className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <nav
          aria-label="Admin"
          className={`admin-sidebar absolute inset-y-0 start-0 flex w-[82%] max-w-xs flex-col shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <p className="font-semibold">Al Saqr admin</p>
            <button type="button" onClick={() => setOpen(false)} className="h-10 w-10 rounded-lg text-2xl leading-none hover:bg-black/5" aria-label="Close menu">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">{list}</div>
        </nav>
      </div>

      <div className="lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="admin-sidebar hidden lg:sticky lg:top-14 lg:flex lg:h-[calc(100dvh-3.5rem)] lg:w-60 lg:shrink-0 lg:flex-col">
          <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2 py-3">
            {list}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </>
  );
}

// Search box in the top bar: type to find any admin section, use the arrow
// keys and Enter to open it. Ctrl/⌘ + K jumps to the box from anywhere.
function AdminSearch({ items }: { items: AdminNavItem[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [i, setI] = useState(0);

  const all = useMemo(
    () => [
      ...items.map((it) => ({ href: it.href, label: it.label, hint: it.group || "Home", icon: it.icon })),
      { href: "/admin/projects/new", label: "Add a new project", hint: "Action", icon: "projects" },
      { href: "/admin/blog/new", label: "Write a new blog post", hint: "Action", icon: "blog" },
      { href: "/admin/enquiries?status=new", label: "New enquiries", hint: "Action", icon: "inbox" },
    ],
    [items]
  );
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (t ? all.filter((r) => `${r.label} ${r.hint}`.toLowerCase().includes(t)) : all).slice(0, 8);
  }, [q, all]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setQ("");
    setFocus(false);
    input.current?.blur();
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-[36rem]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={input}
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setI(0);
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => window.setTimeout(() => setFocus(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setI((n) => Math.min(n + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setI((n) => Math.max(n - 1, 0));
          } else if (e.key === "Enter" && results[i]) {
            e.preventDefault();
            go(results[i].href);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setFocus(false);
            input.current?.blur();
          }
        }}
        placeholder="Search"
        aria-label="Search the admin"
        role="combobox"
        aria-expanded={focus}
        aria-controls="admin-search-results"
        className="h-9 w-full rounded-lg border border-white/15 bg-[#303030] pl-9 pr-14 text-[0.8125rem] text-white placeholder:text-white/60 hover:bg-[#3a3a3a] focus:border-white/40 focus:bg-[#3a3a3a] focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/20 px-1.5 py-0.5 font-sans text-[0.68rem] text-white/60 sm:block">
        Ctrl K
      </kbd>
      {focus ? (
        <ul id="admin-search-results" role="listbox" className="absolute inset-x-0 top-11 z-50 overflow-hidden rounded-xl bg-white py-1.5 text-[#303030] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          {results.length ? (
            results.map((r, n) => (
              <li key={r.href + r.label} role="option" aria-selected={n === i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setI(n)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[0.8125rem] ${n === i ? "bg-[#f1f1f1]" : ""}`}
                >
                  <span className="text-[#616161]">
                    <NavIcon name={r.icon ?? "pages"} />
                  </span>
                  <span className="flex-1">{r.label}</span>
                  <span className="text-xs text-[#8a8a8a]">{r.hint}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-[0.8125rem] text-[#616161]">Nothing found for “{q}”.</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

// Avatar button with the signed-in account, its role and sign-out.
function AccountMenu({ email, role, signOut }: { email: string; role: string; signOut: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const initial = (email[0] ?? "A").toUpperCase();
  const name = email.split("@")[0];
  return (
    <div ref={box} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 items-center gap-2 rounded-lg px-1.5 hover:bg-white/10 sm:pe-2.5"
      >
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5a1f] text-[0.8rem] font-bold text-black">
          {initial}
        </span>
        <span className="hidden max-w-[9rem] truncate text-[0.8125rem] sm:inline">{name}</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl bg-white text-[#303030] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <div className="border-b border-[#e3e3e3] px-4 py-3">
            <p className="truncate text-[0.8125rem] font-semibold">{email}</p>
            <p className="text-xs text-[#616161]">{role === "admin" ? "Admin (full access)" : "Editor"}</p>
          </div>
          <div className="py-1.5 text-[0.8125rem]">
            <Link href="/admin/security" role="menuitem" className="block px-4 py-2 hover:bg-[#f1f1f1]">
              Sign-in security
            </Link>
            <a href="/" target="_blank" rel="noopener" role="menuitem" className="block px-4 py-2 hover:bg-[#f1f1f1]">
              View website ↗
            </a>
          </div>
          <div className="admin-signout border-t border-[#e3e3e3] px-4 py-2.5 text-[0.8125rem]">{signOut}</div>
        </div>
      ) : null}
    </div>
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
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4M12 15v2",
  team: "M16 11a4 4 0 1 0 0-8M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 15a6 6 0 0 1 6 6",
};
function NavIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      <path d={ICONS[name] ?? ICONS.pages} />
    </svg>
  );
}
