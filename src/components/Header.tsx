import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import SafeImage from "@/components/SafeImage";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/certifications", label: "Certifications" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
];

export default async function Header() {
  const settings = await getSiteSettings();
  const phone = settings?.phone_1 ?? "";

  return (
    <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-10 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <SafeImage
            src={settings?.logo_url}
            alt={settings?.company_name ?? "Al Saqr Al Ahmar"}
            variant="logo"
            width={140}
            height={40}
            imgClassName="h-9 w-auto"
            className="text-[1.05rem]"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 font-mono text-[0.8rem] uppercase tracking-wide">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-lo hover:text-hi transition-colors py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-torch after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center bg-ink text-white font-mono text-[0.8rem] font-semibold px-4 py-2.5 tracking-wide hover:bg-torch transition-colors"
            >
              {phone}
            </a>
          )}
        </div>

        <details className="lg:hidden relative">
          <summary className="list-none cursor-pointer border border-line px-3 py-2 text-hi">
            <span className="sr-only">Menu</span>
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </summary>
          <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-line shadow-lg py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 font-mono text-[0.8rem] uppercase tracking-wide text-lo hover:text-hi hover:bg-surface2"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
