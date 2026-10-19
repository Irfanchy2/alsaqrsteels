"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Success message after a save: slides in at the bottom-right, then removes
// itself (and the ?saved= from the address) so a refresh does not repeat it.
export default function Toast({ message }: { message: string }) {
  const [show, setShow] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 4500);
    const clean = window.setTimeout(() => {
      const p = new URLSearchParams(params.toString());
      p.delete("saved");
      router.replace(p.size ? `${pathname}?${p}` : pathname, { scroll: false });
    }, 5000);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(clean);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <div
      role="status"
      className={`fixed bottom-5 end-5 z-[70] flex max-w-sm items-start gap-3 rounded-lg border border-ok/30 bg-white p-4 text-sm text-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-ok text-white">
        ✓
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{message}</p>
        <p className="mt-0.5 text-steel-text">
          Live on the website within a minute.{" "}
          <a href="/" target="_blank" className="font-semibold text-ink underline">
            View ↗
          </a>
        </p>
      </div>
      <button type="button" onClick={() => setShow(false)} className="-me-1 -mt-1 px-1 text-lg leading-none text-steel-text hover:text-ink" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
