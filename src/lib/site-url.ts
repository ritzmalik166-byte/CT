export function getSiteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.contenaissance.com";

  return raw.replace(/\/$/, "");
}
