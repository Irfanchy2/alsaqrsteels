"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Assistant = dynamic(() => import("./Assistant"), { ssr: false });

// The Project Assistant is not needed for the first paint, so its code loads
// once the browser is idle (or after 2.5 s at the latest). This keeps the
// main thread free while the page becomes interactive.
export default function AssistantLazy(props: { services: { slug: string; title: string }[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (n: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);
  return ready ? <Assistant {...props} /> : null;
}
