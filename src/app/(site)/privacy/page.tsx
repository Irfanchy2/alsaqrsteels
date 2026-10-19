import type { Metadata } from "next";
import { getCompany } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How Al Saqr Al Ahmar Welding and Blacksmith LLC handles information sent through this website.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const company = await getCompany();
  return (
    <>
      <PageHero image={null} crumbs={[{ name: "Privacy", href: "/privacy" }]} label="Legal" title="Privacy notice" lede="Last updated: 26 September 2026" />
      <section className="py-14 lg:py-20">
        <div className="wrap">
          <div className="prose">
            <p>
              This notice explains what information {company.name} (&ldquo;we&rdquo;) receives through this website, why,
              and what choices you have. It applies to this website only.
            </p>

            <h2>Information you send us</h2>
            <p>When you request a quote we receive the details you enter:</p>
            <ul>
              <li>your name, and optionally your company;</li>
              <li>a phone number and/or email address;</li>
              <li>the service, project location, scope, dimensions, quantities and target date you describe;</li>
              <li>any drawings, bills of quantities or photographs you attach (PDF, JPG or PNG).</li>
            </ul>
            <p>
              We use this information only to review your enquiry, contact you about it, prepare a quotation and keep a
              record of the enquiry. Attachments are stored in private storage that only authorised staff can access.
              We do not sell your information or use it for unrelated marketing.
            </p>

            <h2>Project Assistant (AI)</h2>
            <p>
              The optional Project Assistant is an AI tool. If you choose to use it, the messages you type are sent to
              our AI provider (Anthropic) to generate replies. We ask you to agree to this before the first message,
              and we ask you not to include personal details or confidential documents in the chat. The assistant can
              prepare a summary that you can edit; nothing is sent to our team unless you submit it through the quote
              form.
            </p>

            <h2>WhatsApp, phone and email</h2>
            <p>
              If you contact us by WhatsApp, phone or email, that service&apos;s own terms and privacy policy also apply.
              The website shows you the WhatsApp message before it opens so you can review it.
            </p>

            <h2>Usage information</h2>
            <p>
              To understand how the site is used we record page views with Vercel Web Analytics, which does not use
              cookies, and a small number of events such as &ldquo;quote submitted&rdquo; or &ldquo;phone number
              clicked&rdquo;. These events contain the page address and the type of action only — never your name,
              contact details or message. To limit abuse of the quote form, we keep a one-way hashed version of your
              network address for up to two days.
            </p>

            <h2>Who processes the information</h2>
            <p>
              The website is hosted by Vercel. Enquiries and files are stored with Supabase. Email notifications to our
              staff are sent through an email delivery provider. These providers process information on our behalf.
            </p>

            <h2>How long we keep it</h2>
            <p>
              We keep enquiries and attachments for as long as needed to respond, to carry out any resulting work, and to
              meet our legal and business record-keeping obligations. You can ask us to delete an enquiry that did not
              lead to any work.
            </p>

            <h2>Your choices</h2>
            <p>
              You can ask to see, correct or delete the information you sent us
              {company.email ? (
                <>
                  {" "}by emailing <a href={`mailto:${company.email}`}>{company.email}</a>
                </>
              ) : null}
              {company.phones[0] ? <> or calling {company.phones[0].display}</> : null}. Please quote your enquiry
              reference if you have one.
            </p>

            <h2>Contact</h2>
            <p>
              {company.name}
              <br />
              {company.address}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
