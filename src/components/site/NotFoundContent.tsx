import Link from "next/link";
import Illustration from "@/components/ui/Illustration";

export default function NotFoundContent() {
  return (
    <section className="on-ink relative overflow-hidden py-20 lg:py-28">
      <div className="yard-grid absolute inset-0" aria-hidden="true" />
      <div className="wrap relative grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="label">Error 404</p>
          <h1 className="mt-5 text-5xl sm:text-7xl">This page isn&apos;t on the drawing</h1>
          <p className="mt-5 max-w-[56ch] text-lg text-on-ink-muted">
            The link may be old or mistyped. Pages from our previous website have moved — try one of these instead.
          </p>
          <ul className="mt-8 grid max-w-xl gap-px border border-line-ink bg-line-ink sm:grid-cols-2">
            {[
              ["/services", "Services"],
              ["/projects", "Projects"],
              ["/about", "About the company"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href} className="bg-ink-2">
                <Link href={href} className="flex min-h-14 items-center justify-between px-5 font-semibold transition-colors hover:bg-ink-3 hover:text-flame">
                  {label} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote" className="btn btn-primary">
              Request a Quote
            </Link>
            <Link href="/" className="btn btn-secondary-ink">
              Home page
            </Link>
          </div>
        </div>
        <div className="relative lg:col-span-5" aria-hidden="true">
          <p className="text-center font-display text-[9rem] font-extrabold leading-none text-flame [font-stretch:70%] sm:text-[13rem]">404</p>
          <Illustration name="cnc" className="mx-auto -mt-8 w-full max-w-sm text-on-ink-muted opacity-50" />
        </div>
      </div>
    </section>
  );
}
