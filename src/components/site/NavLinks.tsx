"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

// Mono nav on graphite. Hover draws an amber rule; the current page keeps it
// with a small index marker.
export default function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-0.5">
      {items.map((item, i) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative inline-flex min-h-11 items-center gap-1.5 px-2.5 font-mono xl:px-3.5 text-[0.8rem] tracking-[0.06em] transition-colors hover:text-on-ink ${
                active ? "text-on-ink" : "text-on-ink-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`hidden text-[0.62rem] transition-colors xl:inline ${active ? "text-amber" : "text-on-ink-muted/60 group-hover:text-amber"}`}
              >
                0{i + 1}
              </span>
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2.5 bottom-1.5 xl:inset-x-3.5 h-[2px] origin-left bg-amber transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
