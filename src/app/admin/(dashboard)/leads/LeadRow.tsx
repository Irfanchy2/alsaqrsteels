"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "../../actions";
import type { Lead } from "@/lib/types";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"];

export default function LeadRow({ lead }: { lead: Lead }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-line align-top">
      <td className="py-4 pr-4">
        <p className="font-semibold text-sm">{lead.name}</p>
        {lead.company && <p className="text-xs text-lo2">{lead.company}</p>}
        <p className="text-xs text-lo2 mt-1">
          {new Date(lead.created_at).toLocaleDateString("en-GB")}
        </p>
      </td>
      <td className="py-4 pr-4 text-sm">
        {lead.email && <p>{lead.email}</p>}
        {lead.phone && <p>{lead.phone}</p>}
      </td>
      <td className="py-4 pr-4 text-sm max-w-sm">
        {lead.project_type && (
          <p className="font-mono text-xs uppercase text-lo2 mb-1">{lead.project_type}</p>
        )}
        <p className="text-lo">{lead.description}</p>
      </td>
      <td className="py-4">
        <select
          defaultValue={lead.status}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateLeadStatus(lead.id, e.target.value))
          }
          className="border border-line bg-surface text-xs px-2 py-1.5"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
