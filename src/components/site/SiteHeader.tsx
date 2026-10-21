import Link from "next/link";
import Image from "next/image";
import { NAV } from "@/lib/site";
import type { Company } from "@/lib/content/types";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import HeaderShell from "./HeaderShell";

export default function SiteHeader({ company, extraNav = [] }: { company: Company; extraNav?: { href: string; label: string }[] }) {
  const phone = company.phones[0];
  const nav = [...NAV.slice(0, -1), ...extraNav, NAV[NAV.length - 1]];
  return (
    <HeaderShell>
      <div className="site-header__bar wrap flex items-center justify-between gap-4">
        {/* Reversed logo (white wordmark, red gear) sized to fill the bar. */}
        <Link
          href="/"
          className="site-logo group flex h-full shrink-0 items-center py-2 transition-opacity duration-300 hover:opacity-90"
          aria-label={`${company.name} — home`}
        >
          <Image
            src="/brand/logo-on-dark.webp"
            alt={company.name}
            width={480}
            height={208}
            priority
            className="site-logo__img h-full w-auto"
            sizes="(min-width: 1024px) 200px, 150px"
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={nav} />
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/quote" className="btn btn-secondary-ink btn-sm hidden xl:inline-flex">
            Request a Quote
          </Link>
          {phone ? (
            <a href={`tel:${phone.e164}`} className="btn btn-primary btn-sm hidden sm:inline-flex" aria-label={`Call ${phone.display}`}>
              <span className="live-dot" aria-hidden="true" />
              {phone.display}
            </a>
          ) : null}
          <MobileMenu items={nav} phone={phone ?? null} whatsapp={company.whatsapp} />
        </div>
      </div>
    </HeaderShell>
  );
}
