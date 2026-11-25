import { NextResponse } from "next/server";
import { z } from "zod";
import { detectImageType } from "@/lib/ct-connector/service";
import { isWebhookSecretConfigured, verifyWebhookRequest } from "@/lib/cover-webhook/auth";
import {
  COVER_MAX_BYTES,
  CoverWebhookError,
  attachTodaysCoverImage,
} from "@/lib/cover-webhook/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Image limit plus room for multipart boundaries and the small text fields. */
const MAX_BODY_BYTES = COVER_MAX_BYTES + 64 * 1024;

const fieldsSchema = z.object({
  idempotencyKey: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9._:-]+$/, "idempotencyKey may only contain letters, numbers, . _ : -")
    .optional(),
  timestamp: z.string().trim().max(64).optional(),
});

/** Same shape as the MCP connector's error payload: { success: false, error: CODE, message }. */
function fail(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: code, message }, { status });
}

/** Reads the raw body (needed for the HMAC) while enforcing the size limit as it streams in. */
async function readBodyWithLimit(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return new Uint8Array(0);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function formText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: Request) {
  if (!isWebhookSecretConfigured()) {
    console.error("[cover-webhook] CT_WEBHOOK_SECRET is missing or too short (min 32 chars)");
    return fail("WEBHOOK_UNAVAILABLE", "Cover image webhook is not configured", 503);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data\s*;/i.test(contentType)) {
    return fail("INVALID_REQUEST", 'Send the image as multipart/form-data in the "image" field.', 415);
  }

  let rawBody: Uint8Array | null;
  try {
    rawBody = await readBodyWithLimit(request, MAX_BODY_BYTES);
  } catch {
    return fail("INVALID_REQUEST", "Request body could not be read.", 400);
  }
  if (!rawBody) {
    return fail("IMAGE_TOO_LARGE", "Image must be 5 MB or smaller.", 413);
  }

  // Authenticate before parsing anything else from the body.
  const auth = verifyWebhookRequest(request.headers, rawBody);
  if (!auth.ok) {
    console.warn(`[cover-webhook] authentication failed: ${auth.reason}`);
    return fail("UNAUTHORIZED", "Unauthorized", 401);
  }

  let form: FormData;
  try {
    form = await new Response(new Blob([rawBody as BlobPart]), {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return fail("INVALID_IMAGE", "Invalid image format or image payload.", 400);
  }

  const fields = fieldsSchema.safeParse({
    idempotencyKey: formText(form, "idempotencyKey"),
    timestamp: formText(form, "timestamp"),
  });
  if (!fields.success) {
    return fail("INVALID_REQUEST", fields.error.issues[0]?.message || "Invalid request fields.", 400);
  }

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return fail("INVALID_IMAGE", 'Image file is required in the "image" field.', 400);
  }
  if (file.size > COVER_MAX_BYTES) {
    return fail("IMAGE_TOO_LARGE", "Image must be 5 MB or smaller.", 413);
  }

  // Type comes from the actual bytes only; the client's file name and MIME type are ignored.
  const image = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageType(image);
  if (!mimeType) {
    return fail("INVALID_IMAGE", "Invalid image format or image payload. Use JPG, PNG or WebP.", 400);
  }

  const { idempotencyKey, timestamp } = fields.data;

  try {
    const result = await attachTodaysCoverImage({ image, mimeType, idempotencyKey, request });

    console.info(
      `[cover-webhook] blog ${result.blogId} cover ${result.alreadyApplied ? "already applied" : "updated"}` +
        ` (istDate=${result.istDate}, auth=${auth.method}` +
        `${idempotencyKey ? `, idempotencyKey=${idempotencyKey}` : ""}${timestamp ? `, workflowTimestamp=${timestamp}` : ""})`,
    );

    return NextResponse.json({
      success: true,
      message: result.alreadyApplied
        ? "This image is already attached to today's blog draft. Nothing was changed."
        : "Today's blog cover image uploaded and draft updated successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof CoverWebhookError) {
      console.warn(`[cover-webhook] ${error.code}${idempotencyKey ? ` (idempotencyKey=${idempotencyKey})` : ""}`);
      return fail(error.code, error.message, error.status);
    }
    console.error("[cover-webhook] request failed:", error);
    return fail("INTERNAL_ERROR", "The request could not be completed.", 500);
  }
}
