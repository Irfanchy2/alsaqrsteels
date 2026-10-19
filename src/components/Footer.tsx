import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import SafeImage from "@/components/SafeImage";

const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/certifications", label: "Certifications" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Blog" },
];

const COMPANY_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/admin/login", label: "Admin Login" },
];

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="on-dark pt-20 pb-10">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-12 pb-14 border-b border-line-inv">
          <div>
            <SafeImage
              src={settings?.logo_url}
              alt={settings?.company_name ?? "Al Saqr Al Ahmar"}
              variant="logo"
              width={160}
              height={44}
              imgClassName="h-10 w-auto"
              wrapperClassName="inline-flex bg-white p-1 mb-4"
              className="text-[1.15rem] mb-4"
            />
            <p className="text-lo-inv text-sm leading-relaxed max-w-[36ch]">
              {settings?.tagline}
            </p>
            {settings?.phone_1 && (
              <p className="text-hi-inv font-mono font-semibold mt-4">
                {settings.phone_1}
              </p>
            )}
          </div>
          <div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-torch-dim">
              Site
            </span>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-lo-inv hover:text-hi-inv text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-torch-dim">
              Company
            </span>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-lo-inv hover:text-hi-inv text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between gap-2 text-xs text-lo2-inv">
          <p>
            © {new Date().getFullYear()} {settings?.company_name}. All rights
            reserved.
          </p>
          {settings?.address && <p>{settings.address}</p>}
        </div>
      </div>
    </footer>
  );
}
