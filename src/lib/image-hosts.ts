// Where website photos may come from: files shipped with the site, the
// Supabase "media" bucket (admin uploads) and ImgBB direct links (i.ibb.co).
// next.config.ts lists the same hosts for next/image.
export const IMGBB_HOST = "i.ibb.co";

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "";
  }
})();

export function isAllowedImageUrl(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    if (u.host === IMGBB_HOST) return true;
    return !!SUPABASE_HOST && u.host === SUPABASE_HOST && u.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}
