"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { blockDef, type Block, type CardItem, type PropField, type StatItem } from "@/lib/content/blocks";
import { libraryPhotos } from "@/lib/content/stock";
import { uploadToMedia } from "@/lib/media-upload";

const LINKS = ["/quote", "/contact", "/services", "/projects", "/about", "/quality", "/blog", "/"];

export default function Inspector({
  block,
  sectionLabel,
  editHref,
  onChange,
  onToggle,
  onRemove,
}: {
  block: Block;
  sectionLabel?: string;
  editHref: string | null;
  onChange: (props: Record<string, unknown>) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  if (block.type === "section") {
    return (
      <div className="space-y-4 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-steel-text">Website section</p>
        <h2 className="text-xl font-bold">{sectionLabel}</h2>
        <p className="text-sm text-steel-text">
          This is one of the website&rsquo;s own sections. Drag it to move it, or hide it. Its text and photo are edited on
          the Page text screen.
        </p>
        <button type="button" onClick={onToggle} className="btn btn-sm btn-secondary w-full">
          {block.hidden ? "Show on website" : "Hide from website"}
        </button>
        {editHref ? (
          <Link href={editHref} className="btn btn-sm btn-primary w-full">
            Edit its text & photo
          </Link>
        ) : null}
      </div>
    );
  }

  const def = blockDef(block.type)!;
  const set = (key: string, value: unknown) => onChange({ ...block.props, [key]: value });

  return (
    <div className="p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-steel-text">Block</p>
      <h2 className="text-xl font-bold">{def.label}</h2>
      <p className="mt-1 text-sm text-steel-text">{def.description}</p>
      <div className="mt-5 space-y-5">
        {def.fields.map((f) => (
          <FieldEditor key={f.key} field={f} value={block.props[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      </div>
      <div className="mt-8 flex gap-2 border-t border-line pt-5">
        <button type="button" onClick={onToggle} className="btn btn-sm btn-secondary flex-1">
          {block.hidden ? "Show" : "Hide"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete this block?")) onRemove();
          }}
          className="btn btn-sm flex-1 border border-danger/40 text-danger hover:bg-danger-bg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: PropField; value: unknown; onChange: (v: unknown) => void }) {
  const id = `fld-${field.key}`;
  const s = typeof value === "string" ? value : "";
  switch (field.kind) {
    case "text":
      return (
        <Labeled id={id} label={field.label} hint={"hint" in field ? field.hint : undefined}>
          <input id={id} className="input !min-h-10 !py-2" value={s} onChange={(e) => onChange(e.target.value)} />
        </Labeled>
      );
    case "textarea":
      return (
        <Labeled id={id} label={field.label} hint={"hint" in field ? field.hint : undefined}>
          <textarea id={id} className="input !min-h-24" rows={4} value={s} onChange={(e) => onChange(e.target.value)} />
        </Labeled>
      );
    case "link":
      return (
        <Labeled id={id} label={field.label} hint="A page on this site (e.g. /quote) or a full web address.">
          <input id={id} list="builder-links" className="input !min-h-10 !py-2" value={s} onChange={(e) => onChange(e.target.value)} />
          <datalist id="builder-links">
            {LINKS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Labeled>
      );
    case "select":
      return (
        <Labeled id={id} label={field.label}>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={id}>
            {field.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={s === o.value}
                onClick={() => onChange(o.value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${s === o.value ? "border-flame bg-flame text-white" : "border-line hover:border-steel"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Labeled>
      );
    case "image":
      return (
        <Labeled id={id} label={field.label}>
          <ImagePicker value={s} onChange={onChange} />
        </Labeled>
      );
    case "images": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Labeled id={id} label={field.label} hint="Drag order: use ← → on a photo. Up to 40 photos.">
          <ul className="grid grid-cols-3 gap-2">
            {list.map((u, i) => (
              <li key={`${u}-${i}`} className="group relative aspect-square overflow-hidden rounded bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 text-xs text-white opacity-0 group-hover:opacity-100">
                  <button type="button" className="px-1.5 py-0.5" onClick={() => i > 0 && onChange(swap(list, i, i - 1))} aria-label="Move left">←</button>
                  <button type="button" className="px-1.5 py-0.5" onClick={() => onChange(list.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
                  <button type="button" className="px-1.5 py-0.5" onClick={() => i < list.length - 1 && onChange(swap(list, i, i + 1))} aria-label="Move right">→</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <ImagePicker value="" multiple onChange={(v) => onChange([...list, ...(Array.isArray(v) ? v : [v])].filter(Boolean))} addLabel="Add photos" />
          </div>
        </Labeled>
      );
    }
    case "cards": {
      const list = Array.isArray(value) ? (value as CardItem[]) : [];
      const setItem = (i: number, patch: Partial<CardItem>) => onChange(list.map((c, k) => (k === i ? { ...c, ...patch } : c)));
      return (
        <Labeled id={id} label={field.label}>
          <ul className="space-y-3">
            {list.map((c, i) => (
              <li key={i} className="space-y-2 rounded-lg border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-steel-text">Card {i + 1}</span>
                  <span className="flex gap-1 text-xs">
                    <button type="button" className="rounded px-1.5 hover:bg-paper-2" onClick={() => i > 0 && onChange(swap(list, i, i - 1))}>↑</button>
                    <button type="button" className="rounded px-1.5 hover:bg-paper-2" onClick={() => i < list.length - 1 && onChange(swap(list, i, i + 1))}>↓</button>
                    <button type="button" className="rounded px-1.5 text-danger hover:bg-danger-bg" onClick={() => onChange(list.filter((_, k) => k !== i))}>Remove</button>
                  </span>
                </div>
                <input className="input !min-h-9 !py-1.5" placeholder="Title" value={c.title} onChange={(e) => setItem(i, { title: e.target.value })} />
                <textarea className="input !min-h-16" rows={2} placeholder="Text" value={c.text} onChange={(e) => setItem(i, { text: e.target.value })} />
                <ImagePicker value={c.image} onChange={(v) => setItem(i, { image: String(v) })} compact />
              </li>
            ))}
          </ul>
          {list.length < 6 ? (
            <button type="button" className="btn btn-sm btn-secondary mt-2 w-full" onClick={() => onChange([...list, { title: "New card", text: "", image: "" }])}>
              + Add card
            </button>
          ) : null}
        </Labeled>
      );
    }
    case "stats": {
      const list = Array.isArray(value) ? (value as StatItem[]) : [];
      const setItem = (i: number, patch: Partial<StatItem>) => onChange(list.map((c, k) => (k === i ? { ...c, ...patch } : c)));
      return (
        <Labeled id={id} label={field.label}>
          <ul className="space-y-2">
            {list.map((c, i) => (
              <li key={i} className="flex gap-2">
                <input className="input !min-h-9 !w-24 !py-1.5" placeholder="Number" value={c.value} onChange={(e) => setItem(i, { value: e.target.value })} />
                <input className="input !min-h-9 !py-1.5" placeholder="Label" value={c.label} onChange={(e) => setItem(i, { label: e.target.value })} />
                <button type="button" className="px-2 text-danger" onClick={() => onChange(list.filter((_, k) => k !== i))} aria-label="Remove">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {list.length < 6 ? (
            <button type="button" className="btn btn-sm btn-secondary mt-2 w-full" onClick={() => onChange([...list, { value: "0", label: "Label" }])}>
              + Add number
            </button>
          ) : null}
        </Labeled>
      );
    }
  }
}

function Labeled({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} id={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-steel-text">{hint}</p> : null}
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number): T[] {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Shows the current photo with Upload and "Choose from library" buttons. */
function ImagePicker({
  value,
  onChange,
  multiple = false,
  compact = false,
  addLabel,
}: {
  value: string;
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  compact?: boolean;
  addLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState(false);
  const photos = useMemo(() => libraryPhotos(), []);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push((await uploadToMedia(f, "builder")).url);
      onChange(multiple ? urls : urls[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      {!multiple && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className={`mb-2 w-full rounded object-cover ${compact ? "h-20" : "h-32"}`} />
      ) : null}
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-sm btn-secondary flex-1">
          {busy ? "Uploading…" : addLabel ?? (value ? "Replace photo" : "Upload photo")}
        </button>
        <button type="button" onClick={() => setLibrary((v) => !v)} className="btn btn-sm btn-secondary flex-1">
          Library
        </button>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} className="hidden" onChange={(e) => upload(e.target.files)} />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      {library ? (
        <ul className="mt-2 grid max-h-64 grid-cols-3 gap-1.5 overflow-y-auto rounded border border-line p-1.5">
          {photos.map((p) => (
            <li key={p.src}>
              <button
                type="button"
                title={p.label}
                onClick={() => {
                  onChange(multiple ? [p.src] : p.src);
                  if (!multiple) setLibrary(false);
                }}
                className={`block aspect-square w-full overflow-hidden rounded border-2 ${value === p.src ? "border-flame" : "border-transparent hover:border-flame/50"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
