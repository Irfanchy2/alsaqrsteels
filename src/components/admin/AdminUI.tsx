import Link from "next/link";

export function Flash({ saved, error }: { saved?: string; error?: string }) {
  if (!saved && !error) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-6 border-s-4 px-4 py-3 text-sm ${error ? "border-danger bg-danger-bg" : "border-ok bg-ok-bg"}`}
    >
      {error ?? saved}
      {!error ? (
        <>
          {" "}
          The website is updated too.{" "}
          <a href="/" target="_blank" className="font-semibold underline">
            View website ↗
          </a>
        </>
      ) : null}
    </p>
  );
}

export function PageTitle({ title, children, back }: { title: string; children?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back ? (
        <Link href={back.href} className="font-mono text-xs uppercase tracking-[0.12em] text-steel-text hover:text-ink">
          ← {back.label}
        </Link>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  required,
  textarea,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  hint?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={rows} className="input" defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} />
      ) : (
        <input id={id} name={name} type={type} className="input" defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} />
      )}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function Check({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint ? <span className="block text-sm text-steel-text">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-line bg-card p-4 sm:p-6 ${className}`}>{children}</div>;
}

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const tone: Record<string, string> = {
    new: "bg-accent text-white",
    reviewing: "bg-warn-bg text-warn",
    quoted: "bg-paper-2 text-ink",
    won: "bg-ok-bg text-ok",
    lost: "bg-paper-2 text-steel-text",
    closed: "bg-paper-2 text-steel-text",
    spam: "bg-paper-2 text-steel-text",
    sent: "bg-ok-bg text-ok",
    failed: "bg-danger-bg text-danger",
    not_configured: "bg-warn-bg text-warn",
    pending: "bg-paper-2 text-ink",
  };
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] ${tone[value] ?? "bg-paper-2"}`}>
      {label ?? value.replace("_", " ")}
    </span>
  );
}
