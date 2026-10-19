import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/components/site/JsonLd";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items, onInk = false }: { items: Crumb[]; onInk?: boolean }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.12em]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={onInk ? "text-on-ink" : "text-ink"}>
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={c.href}
                      className={`inline-flex min-h-8 items-center underline-offset-4 hover:underline ${onInk ? "text-on-ink-muted" : "text-steel-text"}`}
                    >
                      {c.name}
                    </Link>
                    <span aria-hidden="true" className={onInk ? "text-on-ink-muted" : "text-steel"}>
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}
