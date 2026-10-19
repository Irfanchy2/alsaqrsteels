"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/content/types";
import ProjectCard from "@/components/ui/ProjectCard";

type Filters = { service: string; sector: string; status: string; emirate: string };
const EMPTY: Filters = { service: "", sector: "", status: "", emirate: "" };

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export default function ProjectExplorer({
  projects,
  serviceNames,
}: {
  projects: Project[];
  serviceNames: Record<string, string>;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);

  // Read initial filters from the URL (?service=…&sector=…), and keep the URL
  // in sync so filtered views can be shared.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFilters({
      service: q.get("service") ?? "",
      sector: q.get("sector") ?? "",
      status: q.get("status") ?? "",
      emirate: q.get("emirate") ?? "",
    });
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    (Object.keys(filters) as (keyof Filters)[]).forEach((k) => filters[k] && q.set(k, filters[k]));
    const next = `${window.location.pathname}${q.toString() ? `?${q}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [filters]);

  const options = useMemo(
    () => ({
      service: uniq(projects.flatMap((p) => p.services)).map((v) => ({ value: v, label: serviceNames[v] ?? v })),
      sector: uniq(projects.map((p) => p.sector)).map((v) => ({ value: v, label: v })),
      status: uniq(projects.map((p) => p.status)).map((v) => ({ value: v, label: v === "completed" ? "Completed" : "Ongoing" })),
      emirate: uniq(projects.map((p) => p.emirate)).map((v) => ({ value: v, label: v })),
    }),
    [projects, serviceNames]
  );

  const visible = projects.filter(
    (p) =>
      (!filters.service || p.services.includes(filters.service)) &&
      (!filters.sector || p.sector === filters.sector) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.emirate || p.emirate === filters.emirate)
  );
  const active = Object.values(filters).some(Boolean);

  const groups: { key: keyof Filters; label: string }[] = [
    { key: "service", label: "Service" },
    { key: "sector", label: "Sector" },
    { key: "emirate", label: "Emirate" },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      <form
        className="grid gap-4 border-y-2 border-ink border-t-flame py-5 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter projects"
      >
        {groups.map((g) =>
          options[g.key].length > 1 || filters[g.key] ? (
            <div key={g.key}>
              <label htmlFor={`f-${g.key}`} className="field-label font-mono !text-xs uppercase tracking-[0.14em] text-steel-text">
                {g.label}
              </label>
              <select
                id={`f-${g.key}`}
                className="input"
                value={filters[g.key]}
                onChange={(e) => setFilters((f) => ({ ...f, [g.key]: e.target.value }))}
              >
                <option value="">All</option>
                {options[g.key].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm lg:mb-1"
          onClick={() => setFilters(EMPTY)}
          disabled={!active}
        >
          Clear filters
        </button>
      </form>

      <p className="mt-6 font-mono text-sm text-steel-text" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
        {active ? " match these filters" : ""}
      </p>

      {visible.length ? (
        <ul className="mt-6 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} headingLevel="h2" index={i} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 border border-line bg-card p-8">
          <p className="text-lg font-semibold">No projects match these filters.</p>
          <button type="button" className="link-arrow mt-3" onClick={() => setFilters(EMPTY)}>
            Show all projects
          </button>
        </div>
      )}
    </div>
  );
}
