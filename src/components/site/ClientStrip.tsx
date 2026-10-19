import Image from "next/image";
import type { ClientLogo } from "@/lib/content";

// Client logos carried over from the previous alsaqrsteels.com, on light
// plates so each mark keeps its own colours. A still row: the logos are the
// evidence, they do not need to move.
export default function ClientStrip({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;
  return (
    <section aria-labelledby="clients-title" className="border-b border-line bg-paper py-12 lg:py-14">
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-center">
        <h2 id="clients-title" className="text-xl text-steel-text lg:col-span-3 lg:text-2xl">
          Trusted on sites for
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-9 lg:grid-cols-7">
          {logos.map((c) => (
            <li key={c.logo.src} className="flex h-20 items-center justify-center rounded-sm bg-[#ecebe7] px-4">
              <Image
                src={c.logo.src}
                alt={c.logo.alt}
                width={c.logo.width}
                height={c.logo.height}
                sizes="160px"
                className="max-h-11 w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
