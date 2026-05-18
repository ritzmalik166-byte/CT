/** Primary hero background (Supabase storage). */
export const HERO_VIDEO_URL =
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/Mzha%20Nhi%20Aaya-02.1.mp4";

/**
 * Media warmed during boot — keep small; overlay uses short timeouts so the
 * site never stalls on oversized assets.
 */
export function getBootMediaUrlsForPathname(pathname: string): string[] {
  if (pathname === "/" || pathname === "") {
    return [HERO_VIDEO_URL];
  }
  return [];
}
