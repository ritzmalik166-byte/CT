/** Primary hero background (Supabase storage). */
export const HERO_VIDEO_URL =
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/Mzha%20Nhi%20Aaya-02.1.mp4";

/**
 * Media the boot loader should wait for before revealing the page.
 * Keep this small so first paint stays fast on non-home routes.
 */
export function getBootMediaUrlsForPathname(pathname: string): string[] {
  if (pathname === "/" || pathname === "") {
    return [HERO_VIDEO_URL];
  }
  return [];
}
