import Link from "next/link";
import type { Metadata } from "next";
import { getCompany } from "@/lib/content";
import SubmittedDetails from "@/components/quote/SubmittedDetails";

export const metadata: Metadata = {
  title: "Request received",
  robots: { index: false, follow: false },
};

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const company = await getCompany();
  const reference = ref && /^[A-Z]{3,4}-[0-9A-Z-]{4,20}$/.test(ref) ? ref : null;
  const phone = company.phones[0];

  if (!reference) {
    // Visited directly, without a saved request: don't pretend anything was sent.
    return (
      <section className="py-24">
        <div className="wrap max-w-2xl">
          <p className="label">Request a quote</p>
          <h1 className="mt-4 text-4xl font-bold">No request to show</h1>
          <p className="mt-4 text-lg text-steel-text">
            This page confirms a request after it has been saved. If you meant to send one, please use the quote form.
          </p>
          <Link href="/quote" className="btn btn-primary mt-8">
            Go to the quote form
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="drawing-grid py-20 lg:py-28">
      <div className="wrap">
        <div className="max-w-3xl border-2 border-ink bg-card">
          <div className="flex items-center gap-3 border-b-2 border-ink bg-ok px-6 py-4 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            <p className="font-semibold">Request saved</p>
          </div>
          <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-bold sm:text-4xl">Thank you — we have your request</h1>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-steel-text">Your reference</p>
            <p className="mt-1 font-mono text-3xl font-medium tracking-wide sm:text-4xl">{reference}</p>
            <p className="mt-6 text-lg">
              Our team will review your request and contact you using the details you provided. Please quote the
              reference above if you call or message us about it.
            </p>
            <SubmittedDetails reference={reference} />
            <div className="mt-8 flex flex-wrap gap-3">
              {phone ? (
                <a href={`tel:${phone.e164}`} className="btn btn-secondary">
                  Call {phone.display}
                </a>
              ) : null}
              <Link href="/projects" className="btn btn-secondary">
                Explore Our Projects
              </Link>
              <Link href="/" className="link-arrow self-center ps-2">
                Back to home <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
