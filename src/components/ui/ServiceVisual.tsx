import Image from "next/image";
import type { Service } from "@/lib/content/types";
import { servicePhoto } from "@/lib/content/stock";

// The service's CMS photograph, or a stock photograph of the discipline when
// none has been uploaded yet.
export default function ServiceVisual({
  service,
  className = "",
  sizes = "(min-width: 1024px) 30vw, 100vw",
  priority = false,
}: {
  service: Service;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const photo = servicePhoto(service);
  return (
    <div className={`photo-zoom relative overflow-hidden bg-ink-2 ${className}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
    </div>
  );
}
