import Breadcrumbs, { type Crumb } from "./Breadcrumbs";

// Inner-page header: breadcrumbs, a plain-language title and one sentence of
// context on the steel ground, closed by a hairline. The page content below
// carries the photographs; the header stays quiet.
export default function PageHero({
  crumbs,
  label,
  title,
  lede,
  children,
}: {
  crumbs: Crumb[];
  label?: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative border-b border-line bg-ink">
      <div className="wrap pb-14 pt-10 lg:pb-20 lg:pt-14">
        <Breadcrumbs items={crumbs} onInk />
        <div className="mt-10 max-w-4xl lg:mt-14">
          {label ? <p className="label">{label}</p> : null}
          <h1 className="mt-3 text-[2.5rem] sm:text-6xl lg:text-[4.25rem]">{title}</h1>
          {lede ? <p className="mt-6 max-w-[60ch] text-lg text-steel-text sm:text-xl">{lede}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
