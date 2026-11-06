"use client";

import NextImage, { type ImageProps } from "next/image";
import manifest from "@/lib/image-manifest.json";

// next/image for the site. Photos from public/images were pre-sized to WebP by
// scripts/make-images.mjs, so they are served as static files from public/img
// (cached by the CDN, no server resizing). Anything else, such as photos
// uploaded in the admin panel, goes through the normal Next.js optimizer.
const SIZES = manifest as Record<string, number[]>;

function staticLoader({ src, width }: { src: string; width: number }) {
  const widths = SIZES[src];
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  return `/img${src.slice("/images".length).replace(/\.[a-z]+$/i, "")}-${w}.webp`;
}

export default function Img(props: ImageProps) {
  if (typeof props.src === "string" && SIZES[props.src]) return <NextImage {...props} loader={staticLoader} />;
  return <NextImage {...props} />;
}
