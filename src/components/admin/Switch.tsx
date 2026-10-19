"use client";

import { useState } from "react";

// Accessible on/off switch that submits "on" like a checkbox.
export default function Switch({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <input type="checkbox" name={name} checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-none rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-flame peer-focus-visible:ring-offset-2 ${
          on ? "bg-flame" : "bg-line-strong"
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[1.375rem]" : "translate-x-0.5"}`} />
      </span>
      <span>
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="block text-sm text-steel-text">{hint}</span> : null}
      </span>
    </label>
  );
}
