"use client";

import { createClient } from "@/lib/supabase/client";

export type Uploaded = { url: string; width: number | null; height: number | null; bytes: number };

// Uploads one file to the public "media" bucket as the signed-in staff member
// (storage policies allow staff only) and returns its public URL.
export async function uploadToMedia(file: File, folder: string, maxMb = 15): Promise<Uploaded> {
  if (!file.size) throw new Error("This file is empty. If it is in iCloud/OneDrive, download it to the device first.");
  if (file.size > maxMb * 1024 * 1024) throw new Error(`“${file.name}” is larger than ${maxMb} MB.`);
  let width: number | null = null;
  let height: number | null = null;
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    try {
      const bmp = await createImageBitmap(file);
      width = bmp.width;
      height = bmp.height;
      bmp.close();
    } catch {
      /* size is optional */
    }
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, width, height, bytes: file.size };
}
