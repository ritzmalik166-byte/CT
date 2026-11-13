/**
 * Marketing attribution (UTM / ad click IDs / referrer / landing page) for CRM leads.
 *
 * Client: `captureAttribution()` runs once per page load (see AttributionCapture). A visit that carries
 * UTM tags or an ad click ID overwrites what is stored; otherwise the first touch is kept for 30 days.
 * Forms send `getAttribution()` with the lead.
 *
 * Server: `trackingBlock()` turns it into "key: value" lines appended to the stored lead message. The RMW CRM
 * parses that block back into attribution fields and strips it from the message it shows.
 */

export const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "fbclid", "msclkid", "landing_page", "referrer",
] as const;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

const STORAGE_KEY = "ct_attribution_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"] as const;

function fromUrl(): Attribution {
  const q = new URLSearchParams(window.location.search);
  const out: Attribution = {};
  for (const k of CAMPAIGN_KEYS) {
    const v = q.get(k) ?? (k === "utm_term" ? q.get("utm_keyword") : null);
    if (v?.trim()) out[k] = v.trim().slice(0, 255);
  }
  return out;
}

function read(): (Attribution & { ts?: number }) | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v?.ts || Date.now() - v.ts > TTL_MS) return null;
    return v;
  } catch {
    return null;
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const campaign = fromUrl();
    const existing = read();
    if (existing && !Object.keys(campaign).length) return; // keep first touch
    const ref = document.referrer;
    const external = ref && !ref.startsWith(window.location.origin);
    const value = {
      ...campaign,
      landing_page: `${window.location.host}${window.location.pathname}`.slice(0, 500),
      ...(external ? { referrer: ref.slice(0, 500) } : {}),
      ts: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked: attribution is best-effort */
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const stored = read() || {};
  const out: Attribution = {};
  for (const k of ATTRIBUTION_KEYS) if (stored[k]) out[k] = stored[k];
  return { ...out, ...fromUrl() };
}

/** Server side: sanitise untrusted input and render the block appended to the lead message. */
export function trackingBlock(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const t = input as Record<string, unknown>;
  const lines = ATTRIBUTION_KEYS.flatMap((k) => {
    const v = typeof t[k] === "string" ? (t[k] as string).replace(/[\r\n]+/g, " ").trim().slice(0, 500) : "";
    return v ? [`${k}: ${v}`] : [];
  });
  return lines.length ? `\n\n--- Tracking ---\n${lines.join("\n")}` : "";
}
