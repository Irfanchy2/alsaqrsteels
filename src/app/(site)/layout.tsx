import { getCompany, getServices } from "@/lib/content";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MobileContactBar from "@/components/site/MobileContactBar";
import PageViews from "@/components/site/PageViews";
import BackToTop from "@/components/site/BackToTop";
import RevealObserver from "@/components/site/RevealObserver";
import { IllustrationDefs } from "@/components/ui/Illustration";
import { JsonLd, organizationLd } from "@/components/site/JsonLd";
import Assistant from "@/components/assistant/AssistantLazy";
import WeldSparks from "@/components/site/WeldSparks";

// Public pages are served from cache and refreshed on every admin save; this
// is the fallback so no page is ever more than a minute behind the CMS.
export const revalidate = 60;
// Run server work next to the database (Supabase, Tokyo).
export const preferredRegion = "hnd1";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [company, services] = await Promise.all([getCompany(), getServices()]);
  return (
    <div className="site-theme">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <IllustrationDefs />
      <SiteHeader company={company} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter company={company} services={services} />
      <div className="h-28 bg-ink lg:hidden" aria-hidden="true" />
      <MobileContactBar company={company} />
      <Assistant services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
      <PageViews />
      <BackToTop />
      <RevealObserver />
      <WeldSparks />
      <JsonLd data={organizationLd(company)} />
    </div>
  );
}
