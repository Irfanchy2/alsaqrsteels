"use client";

import { useState } from "react";
import Image from "next/image";

type Variant = "logo" | "photo" | "certificate";

type SafeImageProps = {
  src: string | null | undefined;
  alt: string;
  variant?: Variant;
  className?: string;
  /** Applied to the <Image> itself (e.g. object-cover, group-hover:scale-105). */
  imgClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  /** Short label shown in the placeholder in place of the image, e.g. a cert code. */
  label?: string;
  /** Wraps only the real (non-fallback) <Image>, e.g. a white chip behind a transparent logo on a dark background. */
  wrapperClassName?: string;
};

function PhotoIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="26" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11" cy="13" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 22l7-7 5.5 5.5L21 16l7 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CertIcon() {
  return (
    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 9h14M9 13h10M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 20v8l3-2 3 2v-8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Drop-in replacement for next/image that falls back to a plain, honest
 * placeholder (an icon and a label — never an invented picture) if the
 * source URL fails to load. Several image references across this site
 * point at dead paths; this keeps the layout intact instead of showing a
 * broken-image icon.
 */
export default function SafeImage({
  src,
  alt,
  variant = "photo",
  className,
  imgClassName,
  fill,
  width,
  height,
  priority,
  sizes,
  label,
  wrapperClassName,
}: SafeImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    if (variant === "logo") {
      return (
        <span
          className={`inline-flex items-center font-display font-extrabold uppercase tracking-tight text-current leading-none ${className ?? ""}`}
        >
          Al Saqr Al Ahmar
        </span>
      );
    }

    const isCert = variant === "certificate";

    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface2 text-lo2 ${
          fill ? "absolute inset-0" : ""
        } ${className ?? ""}`}
      >
        {isCert ? <CertIcon /> : <PhotoIcon />}
        {label && (
          <span className="font-mono text-[0.62rem] uppercase tracking-wide text-center px-2 leading-snug">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
        className={imgClassName}
        onError={() => setFailed(true)}
      />
    );
  }

  const img = (
    <Image
      src={src}
      alt={alt}
      width={width ?? 160}
      height={height ?? 44}
      unoptimized
      priority={priority}
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );

  return wrapperClassName ? <span className={wrapperClassName}>{img}</span> : img;
}
