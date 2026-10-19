import type { Metadata } from "next";
import { getCompany } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Website Terms",
  description: "Terms for using the Al Saqr Al Ahmar Welding and Blacksmith LLC website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const company = await getCompany();
  return (
    <>
      <PageHero crumbs={[{ name: "Terms", href: "/terms" }]} label="Legal" title="Website terms" lede="Last updated: 26 September 2026" />
      <section className="py-14 lg:py-20">
        <div className="wrap">
          <div className="prose">
            <p>
              These terms apply to your use of this website, operated by {company.name}. By using the site you accept
              them.
            </p>

            <h2>Information on this site</h2>
            <p>
              The content describes our services and past work in general terms. It is not an offer, a specification or
              engineering advice, and it may change without notice.
            </p>

            <h2>Enquiries and quotations</h2>
            <p>
              Sending a request through the website does not create a contract. Prices, programmes, technical
              responsibilities and terms apply only when confirmed in a written quotation or agreement issued by our
              staff.
            </p>

            <h2>Project Assistant</h2>
            <p>
              The Project Assistant is an automated AI tool that helps you find information and prepare an enquiry. Its
              replies may be incomplete or wrong. It cannot give prices, delivery commitments, engineering decisions or
              approvals — those are provided only by our staff, in writing.
            </p>

            <h2>Files you send</h2>
            <p>
              Send only files you are entitled to share. We use them to review and respond to your enquiry, as described
              in our privacy notice.
            </p>

            <h2>Acceptable use</h2>
            <p>
              Please don&apos;t misuse the site — for example by submitting false or automated requests, uploading harmful
              files, or attempting to access areas that are not public.
            </p>

            <h2>Intellectual property</h2>
            <p>
              Text, photographs, drawings and logos on this site belong to {company.name} or are used with permission.
              Please ask before reusing them.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms: {company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : null}
              {company.phones[0] ? <> · {company.phones[0].display}</> : null}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
