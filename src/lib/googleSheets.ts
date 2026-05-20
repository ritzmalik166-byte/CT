/** Footer newsletter / CTA — Ritz Google Apps Script → Sheet */
export const FOOTER_NEWSLETTER_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwn0RQUyipA8Zyl7xBi7rJtpsqnKovaMbRYZx9q9tx76IMis8hDyObcxtupjjX9x6QznQ/exec";

export async function submitToGoogleAppsScript(
  url: string,
  payload: Record<string, string>
): Promise<void> {
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}
