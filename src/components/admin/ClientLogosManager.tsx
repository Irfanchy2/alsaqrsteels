"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadToMedia } from "@/lib/media-upload";
import { addClientLogo, deleteClientLogo, moveClientLogo, updateClientLogo, type ActionResult } from "@/app/admin/actions";

export type LogoRow = { id: string; name: string; logo_url: string; published: boolean };

const ACCEPT = "image/png,image/webp,image/jpeg";

// Client logos, save-as-you-go: dropping or choosing files adds them straight
// to the website; every toggle, rename, move or delete saves immediately.
export default function ClientLogosManager({ logos }: { logos: LogoRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const addInput = useRef<HTMLInputElement>(null);

  function done(r: ActionResult, okText: string) {
    setToast(r.ok ? { kind: "ok", text: okText } : { kind: "error", text: r.error });
    startTransition(() => router.refresh());
  }

  async function addFiles(files: FileList | File[] | null) {
    const list = Array.from(files ?? []).filter((f) => /^image\/(png|webp|jpe?g)$/.test(f.type));
    if (!list.length) {
      setToast({ kind: "error", text: "Choose a PNG, WebP or JPG image." });
      return;
    }
    for (const [n, file] of list.entries()) {
      setBusy(`Uploading ${n + 1} of ${list.length}: ${file.name}`);
      try {
        const up = await uploadToMedia(file, "clients", 3);
        const name = file.name
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/[-_]+/g, " ")
          .replace(/\s*(logo|final|copy|\(\d+\))\s*/gi, " ")
          .trim();
        const r = await addClientLogo({ name: name || "Client", url: up.url, width: up.width, height: up.height });
        if (!r.ok) throw new Error(r.error);
      } catch (e) {
        setBusy(null);
        setToast({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
        startTransition(() => router.refresh());
        return;
      }
    }
    setBusy(null);
    done({ ok: true }, list.length === 1 ? "Logo added — it's on the website now. Check the name below." : `${list.length} logos added — check their names below.`);
  }

  return (
    <div className="space-y-8">
      {/* Add ------------------------------------------------------------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors ${
          drag ? "border-flame bg-flame/5" : "border-line-strong bg-card"
        }`}
      >
        <p className="text-lg font-semibold">Add client logos</p>
        <p className="max-w-md text-sm text-steel-text">
          Drop logo files here, or choose them. Each logo goes on the website as soon as it uploads. PNG or WebP with a transparent
          or white background works best.
        </p>
        <button type="button" onClick={() => addInput.current?.click()} disabled={!!busy} className="btn btn-primary btn-sm">
          {busy ? "Uploading…" : "Choose logo files"}
        </button>
        <input
          ref={addInput}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {busy ? <p className="text-sm text-steel-text">{busy}</p> : null}
      </div>

      {toast ? (
        <p
          role={toast.kind === "error" ? "alert" : "status"}
          className={`border-s-4 px-4 py-3 text-sm ${toast.kind === "error" ? "border-danger bg-danger-bg" : "border-ok bg-ok-bg"}`}
        >
          {toast.text}{" "}
          {toast.kind === "ok" ? (
            <a href="/#clients-title" target="_blank" className="font-semibold underline">
              View on website ↗
            </a>
          ) : null}
        </p>
      ) : null}

      {/* List ------------------------------------------------------------ */}
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold">Your logos · {logos.filter((l) => l.published).length} shown on the website</h2>
          {pending ? <span className="font-mono text-xs uppercase tracking-[0.1em] text-steel-text">Saving…</span> : null}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {logos.map((l, i) => (
            <LogoCard
              key={l.id}
              logo={l}
              first={i === 0}
              last={i === logos.length - 1}
              onResult={done}
              setToast={setToast}
            />
          ))}
        </ul>
        {!logos.length ? <p className="text-steel-text">No logos yet — add the first one above.</p> : null}
      </div>
    </div>
  );
}

function LogoCard({
  logo,
  first,
  last,
  onResult,
  setToast,
}: {
  logo: LogoRow;
  first: boolean;
  last: boolean;
  onResult: (r: ActionResult, okText: string) => void;
  setToast: (t: { kind: "ok" | "error"; text: string } | null) => void;
}) {
  const [name, setName] = useState(logo.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const replaceInput = useRef<HTMLInputElement>(null);

  async function replace(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const up = await uploadToMedia(file, "clients", 3);
      onResult(await updateClientLogo(logo.id, { url: up.url, width: up.width, height: up.height }), `${logo.name}: logo replaced on the website.`);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <li className={`flex flex-col border bg-card ${logo.published ? "border-line" : "border-dashed border-line-strong opacity-70"}`}>
      <div className="relative flex h-28 items-center justify-center border-b border-line bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.logo_url} alt="" className="max-h-full max-w-full object-contain" />
        {!logo.published ? (
          <span className="absolute start-2 top-2 bg-paper-2 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-steel-text">
            Hidden
          </span>
        ) : null}
        {uploading ? <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm">Uploading…</span> : null}
      </div>
      <div className="space-y-3 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={async () => {
            if (name.trim() && name.trim() !== logo.name) onResult(await updateClientLogo(logo.id, { name }), "Name saved.");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="input !min-h-10 !py-2"
          aria-label="Client name"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-10 cursor-pointer items-center gap-2 pe-2 text-sm">
            <input
              type="checkbox"
              checked={logo.published}
              onChange={async (e) =>
                onResult(await updateClientLogo(logo.id, { published: e.target.checked }), e.target.checked ? "Shown on the website." : "Hidden from the website.")
              }
              className="h-5 w-5 accent-[var(--color-accent)]"
            />
            Show
          </label>
          <span className="ms-auto flex gap-1">
            <IconBtn label="Move earlier" disabled={first} onClick={async () => onResult(await moveClientLogo(logo.id, -1), "Order saved.")}>
              ←
            </IconBtn>
            <IconBtn label="Move later" disabled={last} onClick={async () => onResult(await moveClientLogo(logo.id, 1), "Order saved.")}>
              →
            </IconBtn>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
          <button type="button" className="underline" onClick={() => replaceInput.current?.click()} disabled={uploading}>
            Replace image
          </button>
          <input
            ref={replaceInput}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              void replace(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {confirmDelete ? (
            <span className="ms-auto flex items-center gap-3">
              <span className="text-danger">Delete?</span>
              <button
                type="button"
                className="font-semibold text-danger underline"
                onClick={async () => onResult(await deleteClientLogo(logo.id), `${logo.name} removed.`)}
              >
                Yes
              </button>
              <button type="button" className="underline" onClick={() => setConfirmDelete(false)}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="ms-auto text-danger underline" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="h-10 w-10 border border-line text-base hover:border-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
