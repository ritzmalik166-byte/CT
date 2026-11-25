import { JWT } from "google-auth-library";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type GoogleDocFetchErrorCode =
  | "GOOGLE_NOT_CONFIGURED"
  | "GOOGLE_DOC_FORBIDDEN"
  | "GOOGLE_DOC_NOT_FOUND"
  | "GOOGLE_DOC_UNAVAILABLE";

export class GoogleDocFetchError extends Error {
  constructor(
    public readonly code: GoogleDocFetchErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GoogleDocFetchError";
  }
}

/** Extract a Google Docs document ID from a bare ID or a docs.google.com URL. */
export function extractGoogleDocId(input: string): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{10,}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host !== "docs.google.com" && host !== "www.docs.google.com") return null;
    return url.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? null;
  } catch {
    return raw.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i)?.[1] ?? null;
  }
}

export function getGoogleServiceAccountEmail(): string | null {
  return process.env.GOOGLE_CLIENT_EMAIL?.trim() || null;
}

function getGoogleAuth(): JWT {
  const email = getGoogleServiceAccountEmail();
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    console.error("[ct-connector] GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY are not set");
    throw new GoogleDocFetchError("GOOGLE_NOT_CONFIGURED", "Google Docs import is not configured");
  }

  return new JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: [DRIVE_SCOPE],
  });
}

function errorStatus(error: unknown): number | undefined {
  const err = error as { status?: number; code?: number | string; response?: { status?: number } };
  const status = err?.response?.status ?? err?.status ?? Number(err?.code);
  return Number.isFinite(status) ? Number(status) : undefined;
}

/**
 * Download a Google Doc as .docx via the Drive export API (service account, server-side only).
 * The .docx is then parsed with the same template as the admin panel's Word upload.
 */
export async function exportGoogleDocAsDocx(documentId: string): Promise<Buffer> {
  const auth = getGoogleAuth();

  try {
    const response = await auth.request<ArrayBuffer>({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(documentId)}/export`,
      params: { mimeType: DOCX_MIME },
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
  } catch (error) {
    const status = errorStatus(error);
    if (status === 401 || status === 403) {
      throw new GoogleDocFetchError("GOOGLE_DOC_FORBIDDEN", "Google Doc is not shared with the importer account");
    }
    if (status === 404 || status === 400) {
      throw new GoogleDocFetchError("GOOGLE_DOC_NOT_FOUND", "Google Doc could not be found");
    }
    console.error("[ct-connector] Google Doc export failed:", error);
    throw new GoogleDocFetchError("GOOGLE_DOC_UNAVAILABLE", "Google Doc could not be accessed");
  }
}
