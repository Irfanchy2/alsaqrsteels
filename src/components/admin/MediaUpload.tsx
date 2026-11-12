"use client";

import { useEffect, useRef, useState } from "react";
import { uploadToMedia } from "@/lib/media-upload";
import { resolveImageLink } from "@/app/admin/actions";

// Uploads one file to the public "media" bucket using the signed-in staff
// member's session (storage policies allow staff only), then puts the public
// URL (and image size) into hidden inputs for the surrounding form to save.
export default function MediaUpload({
  name,
  folder,
  accept = "image/jpeg,image/png,image/webp",
  label = "Upload file",
  defaultUrl,
  withSize = false,
  maxMb = 15,
  defaultWidth,
  defaultHeight,
  onChange,
}: {
  name: string;
  folder: string;
  accept?: string;
  label?: string;
  defaultUrl?: string | null;
  withSize?: boolean;
  maxMb?: number;
  defaultWidth?: number | null;
  defaultHeight?: number | null;
  /** Called with the new address after an upload, a pasted link or Remove. */
  onChange?: (url: string) => void;
}) {
  const initial = defaultUrl ?? "";
  const [url, setUrl] = useState(initial);
  const [size, setSize] = useState<{ w: number; h: number } | null>(
    defaultWidth && defaultHeight ? { w: defaultWidth, h: defaultHeight } : null
  );
  const [bytes, setBytes] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const acceptsImages = accept.includes("image/");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange?.(url);
    // Only when the address changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Use a photo already hosted on ImgBB instead of uploading a file.
  async function onLink() {
    if (!link.trim()) return;
    setError(null);
    setStatus("uploading");
    const res = await resolveImageLink(link);
    if (!res.ok) {
      setStatus("error");
      setError(res.error);
      return;
    }
    if (withSize) {
      const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
        const im = new Image();
        im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = () => resolve(null);
        im.src = res.url;
      });
      if (dims) setSize(dims);
    }
    setUrl(res.url);
    setBytes(null);
    setLink("");
    setShowLink(false);
    setStatus("idle");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File is larger than ${maxMb} MB.`);
      return;
    }
    setStatus("uploading");
    try {
      const up = await uploadToMedia(file, folder, maxMb);
      if (withSize && up.width && up.height) setSize({ w: up.width, h: up.height });
      setUrl(up.url);
      setBytes(up.bytes);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  const isImage = /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {withSize ? (
        <>
          <input type="hidden" name={`${name}_width`} value={size?.w ?? ""} />
          <input type="hidden" name={`${name}_height`} value={size?.h ?? ""} />
        </>
      ) : null}
      {bytes !== null ? <input type="hidden" name={`${name}_bytes`} value={bytes} /> : null}
      {url ? (
        isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-32 w-auto border border-line object-cover" />
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="block break-all text-sm underline">
            {url.split("/").pop()}
          </a>
        )
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn btn-secondary btn-sm cursor-pointer">
          {status === "uploading" ? "Uploading…" : url ? "Replace" : label}
          <input type="file" accept={accept} className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} disabled={status === "uploading"} />
        </label>
        {url ? (
          <button type="button" className="text-sm underline" onClick={() => setUrl("")}>
            Remove
          </button>
        ) : null}
        {acceptsImages && !showLink ? (
          <button type="button" className="text-sm underline" onClick={() => setShowLink(true)}>
            Or paste an ImgBB link
          </button>
        ) : null}
      </div>
      {acceptsImages && showLink ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="url"
            inputMode="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onLink();
              }
            }}
            placeholder="https://ibb.co/… or https://i.ibb.co/…"
            aria-label="ImgBB image link"
            className="input min-w-0 flex-1"
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void onLink()} disabled={status === "uploading" || !link.trim()}>
            Use link
          </button>
          <button type="button" className="text-sm underline" onClick={() => setShowLink(false)}>
            Cancel
          </button>
        </div>
      ) : null}
      {status === "uploading" ? <p className="text-sm text-steel-text">{showLink ? "Checking the link…" : "Uploading… keep this page open."}</p> : null}
      {url && url !== initial ? (
        <p className="text-sm font-medium text-ok">Uploaded. Press Save to put it on the website.</p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
