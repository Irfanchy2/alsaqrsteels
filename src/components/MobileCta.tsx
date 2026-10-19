import { getSiteSettings } from "@/lib/data";

export default async function MobileCta() {
  const settings = await getSiteSettings();
  const phone = settings?.phone_1 ?? "";
  const whatsapp = settings?.whatsapp ?? "";
  const waMsg = encodeURIComponent(
    `Hello ${settings?.company_name ?? ""}, I would like to request a quotation for a project.`
  );
  const waUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${waMsg}` : "";

  return (
    <>
      <div
        className={`fixed bottom-0 inset-x-0 z-40 grid ${
          waUrl ? "grid-cols-3" : "grid-cols-2"
        } md:hidden`}
      >
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-center gap-2 bg-ink text-white font-mono text-[0.75rem] font-semibold uppercase tracking-wide py-3.5"
          >
            Call Now
          </a>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 bg-whatsapp text-ink font-mono text-[0.75rem] font-semibold uppercase tracking-wide py-3.5"
            aria-label="Chat on WhatsApp"
          >
            WhatsApp
          </a>
        )}
        <a
          href="/contact"
          className="flex items-center justify-center gap-2 bg-torch text-white font-mono text-[0.75rem] font-semibold uppercase tracking-wide py-3.5"
        >
          Get A Quote
        </a>
      </div>
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener"
          className="hidden md:flex fixed right-8 bottom-8 z-40 w-13 h-13 rounded-full bg-whatsapp text-ink items-center justify-center shadow-lg"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 14.9 3.6 13.5 3.6 12 3.6 7.4 7.4 3.6 12 3.6S20.4 7.4 20.4 12 16.6 20.2 12 20.2zm5-6.6c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-3-.3-.5.3-.4.7-1.4.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.6 1.2 2.8c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.6-.4z" />
          </svg>
        </a>
      )}
    </>
  );
}
