"use client";

import { useState } from "react";
import { uploadToMedia } from "@/lib/media-upload";

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
}) {
  const initial = defaultUrl ?? "";
  const [url, setUrl] = useState(initial);
  const [size, setSize] = useState<{ w: number; h: number } | null>(
    defaultWidth && defaultHeight ? { w: defaultWidth, h: defaultHeight } : null
  );
  const [bytes, setBytes] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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

  const isImage = /\.(jpe?g|png|webp)(\?|$)/i.test(url);

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
      </div>
      {status === "uploading" ? <p className="text-sm text-steel-text">Uploading… keep this page open.</p> : null}
      {url && url !== initial ? (
        <p className="text-sm font-medium text-ok">Uploaded. Press Save to put it on the website.</p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
