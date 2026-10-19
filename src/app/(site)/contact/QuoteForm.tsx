"use client";

import { useActionState } from "react";
import { submitLead, type LeadFormState } from "./actions";

const initialState: LeadFormState = { ok: false, message: "" };

export default function QuoteForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  if (state.ok) {
    return (
      <div className="bg-surface border border-line p-8">
        <p className="font-display font-semibold text-lg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        name="name"
        required
        placeholder="Your name *"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <input
        name="company"
        placeholder="Company"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <input
        name="phone"
        placeholder="Phone"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <input
        name="project_type"
        placeholder="Project type (e.g. structural steel, pipeline)"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch sm:col-span-2"
      />
      <input
        name="location"
        placeholder="Site / location"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <input
        name="required_by"
        placeholder="Required by"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch"
      />
      <textarea
        name="description"
        required
        rows={5}
        placeholder="Describe your project *"
        className="border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:border-torch sm:col-span-2"
      />
      {state.message && !state.ok && (
        <p className="sm:col-span-2 text-torch-text text-sm">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 inline-flex items-center justify-center bg-torch text-white font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-7 py-4 hover:bg-torch-dim transition-colors disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request a quote"}
      </button>
    </form>
  );
}
