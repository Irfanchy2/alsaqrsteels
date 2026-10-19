import { SITE_URL } from "@/lib/site";
import type { Company } from "@/lib/content/types";
import { WORK_PHOTOS } from "@/lib/content/seed";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here once "<" is escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Only verified, company-published facts. Opening hours are omitted until the
// conflicting versions are resolved (see docs/CHECKLIST.md).
export function organizationLd(company: Company) {
  const street = company.address.replace(/,\s*Abu Dhabi,\s*UAE$/i, "");
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: company.name,
    url: SITE_URL,
    logo: `${SITE_URL}${company.logoUrl}`,
    image: WORK_PHOTOS.steelFrame.src.startsWith("http")
      ? WORK_PHOTOS.steelFrame.src
      : `${SITE_URL}${WORK_PHOTOS.steelFrame.src}`,
    description: company.tagline,
    ...(company.establishedYear ? { foundingDate: String(company.establishedYear) } : {}),
    ...(company.phones[0] ? { telephone: company.phones[0].e164 } : {}),
    ...(company.email ? { email: company.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: "Abu Dhabi",
      addressCountry: "AE",
    },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    sameAs: [company.facebookUrl, company.instagramUrl].filter(Boolean),
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
