import { getCompany, getServices, getMotion, getCustomPages } from "@/lib/content";
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
import MotionControl from "@/components/site/MotionControl";
import ScrollFx from "@/components/site/ScrollFx";

// Public pages are served from cache and refreshed on every admin save; this
// is the fallback so no page is ever more than a minute behind the CMS.
export const revalidate = 60;
// Run server work next to the database (Supabase, Tokyo).
export const preferredRegion = "hnd1";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [company, services, motion, customPages] = await Promise.all([getCompany(), getServices(), getMotion(), getCustomPages()]);
  const extraNav = customPages.filter((p) => p.inMenu).map((p) => ({ href: `/${p.slug}`, label: p.title }));
  const on = motion.enabled;
  // Each switched-off effect adds a class that disables it in CSS.
  const fx = [
    "site-theme",
    on ? "" : "motion-off",
    on && motion.cursor ? "weld-cursor" : "",
    on && motion.ticker ? "" : "no-ticker",
    on && motion.reveals ? "" : "no-reveals",
    on && motion.headingSpark ? "fx-heading" : "",
    on && motion.tilt ? "fx-tilt" : "",
    on && motion.scrollFx ? "fx-scroll" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={fx}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <IllustrationDefs />
      <SiteHeader company={company} extraNav={extraNav} />
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
      {on && (motion.sparks || (motion.trail && motion.cursor)) ? (
        <WeldSparks sparks={motion.sparks} trail={motion.trail && motion.cursor} />
      ) : null}
      {on ? <MotionControl speed={motion.speed} tilt={motion.tilt} /> : null}
      {on && motion.scrollFx ? <ScrollFx /> : null}
      <JsonLd data={organizationLd(company)} />
    </div>
  );
}
