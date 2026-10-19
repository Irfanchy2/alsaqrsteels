"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HANDOFF_KEY } from "@/lib/assistant";

// Short "start a quote" card for the home page. It does not submit anything:
// it carries what the visitor typed into the full quote form (in this tab's
// session storage only), where they add contact details and drawings and
// review before sending.
export default function QuickStart({ services }: { services: { slug: string; title: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState("");
  const [scope, setScope] = useState("");

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          sessionStorage.setItem(
            HANDOFF_KEY,
            JSON.stringify({
              source: "quick-start",
              ...(name.trim() ? { name: name.trim().slice(0, 120) } : {}),
              ...(company.trim() ? { company: company.trim().slice(0, 160) } : {}),
              ...(service ? { service } : {}),
              ...(scope.trim() ? { scope: scope.trim().slice(0, 4000) } : {}),
            })
          );
        } catch {}
        router.push(service ? `/quote?service=${encodeURIComponent(service)}` : "/quote");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qs-name" className="field-label">
            Name
          </label>
          <input id="qs-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="qs-company" className="field-label">
            Company <span className="font-normal text-steel-text">(optional)</span>
          </label>
          <input
            id="qs-company"
            className="input"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company / site"
          />
        </div>
      </div>
      <div>
        <label htmlFor="qs-service" className="field-label">
          Service
        </label>
        <select id="qs-service" className="input" value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">Choose a service…</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="qs-scope" className="field-label">
          Project details
        </label>
        <textarea
          id="qs-scope"
          className="input !min-h-28"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="Scope, location, timeline…"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Continue to full request <span aria-hidden="true">→</span>
      </button>
      <p className="text-xs text-steel-text">
        Nothing is sent yet. Next you add your phone or email and any drawings, then review before sending.
      </p>
    </form>
  );
}
