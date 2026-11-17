import { createHash } from "crypto";
import { query, queryOne } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit-log";
import { deleteFromAzureBlob, uploadToAzureBlob } from "@/lib/azure-blob";
import {
  ConnectorError,
  IMAGE_TYPES,
  getCtAgentAccount,
  type ImageMimeType,
} from "@/lib/ct-connector/service";
import { getIstDayBounds } from "@/lib/cover-webhook/ist-day";

/** Same limit as the admin panel's blog image upload. */
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Safety cap; the workflow creates one draft per day. */
const MAX_DRAFTS_CHECKED = 20;

export type CoverWebhookErrorCode =
  | "WEBHOOK_UNAVAILABLE"
  | "NO_DRAFT_TODAY"
  | "IMAGE_ALREADY_PRESENT"
  | "DRAFT_CHANGED"
  | "UPDATE_FAILED";

/** Error whose message is safe to return to the webhook caller. */
export class CoverWebhookError extends Error {
  constructor(
    public readonly code: CoverWebhookErrorCode,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CoverWebhookError";
  }
}

type DraftRow = { id: number; title: string; cover_image: string | null };

export type AttachCoverInput = {
  image: Buffer;
  mimeType: ImageMimeType;
  idempotencyKey?: string;
  request?: Request;
  now?: Date;
};

export type AttachCoverResult = {
  blogId: number;
  title: string;
  coverImageUrl: string;
  status: "draft";
  istDate: string;
  /** True when this exact image was already attached by an earlier (retried) request. */
  alreadyApplied: boolean;
};

function hasCoverImage(row: { cover_image: string | null }) {
  return Boolean(row.cover_image?.trim());
}

/**
 * Content-addressed blob name: the same image for the same blog always maps to the same name,
 * so a retried webhook is recognised instead of storing a duplicate.
 */
function coverBlobName(blogId: number, imageHash: string, mimeType: ImageMimeType) {
  return `cover-${blogId}-${imageHash}.${IMAGE_TYPES[mimeType]}`;
}

/** Remove a just-uploaded blob unless the blog ended up referencing it (e.g. a concurrent identical request won). */
async function discardUpload(blogId: number, blobName: string, url: string) {
  try {
    const current = await queryOne<{ cover_image: string | null }>(
      "SELECT cover_image FROM blogs WHERE id = ? LIMIT 1",
      [blogId],
    );
    if (current?.cover_image === url) return;
    await deleteFromAzureBlob(blobName);
  } catch (error) {
    console.error(`[cover-webhook] could not clean up uploaded blob ${blobName}:`, error);
  }
}

/**
 * Attach the workflow's cover image to today's (Asia/Kolkata) DRAFT blog created by the CT agent account.
 *
 * - Drafts are checked newest first; the image goes to the newest one without a cover image.
 * - No draft today, or every draft already has an image: nothing is uploaded or changed.
 * - Only `cover_image` is written; status stays 'draft'. No blog is ever created.
 */
export async function attachTodaysCoverImage(input: AttachCoverInput): Promise<AttachCoverResult> {
  let agent: Awaited<ReturnType<typeof getCtAgentAccount>>;
  try {
    agent = await getCtAgentAccount();
  } catch (error) {
    if (error instanceof ConnectorError) {
      console.error(`[cover-webhook] agent account unavailable: ${error.code}`);
      throw new CoverWebhookError("WEBHOOK_UNAVAILABLE", 503, "Cover image webhook is not available");
    }
    throw error;
  }

  const day = getIstDayBounds(input.now);

  // FROM_UNIXTIME and the TIMESTAMP column are both interpreted in the session time zone,
  // so the comparison is exact whatever the Node or MySQL server time zone is.
  const drafts = await query<DraftRow>(
    `SELECT id, title, cover_image
     FROM blogs
     WHERE status = 'draft'
       AND author_id = ?
       AND created_at >= FROM_UNIXTIME(?)
       AND created_at < FROM_UNIXTIME(?)
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
    [agent.id, day.startSec, day.endSec, MAX_DRAFTS_CHECKED],
  );

  if (drafts.length === 0) {
    throw new CoverWebhookError("NO_DRAFT_TODAY", 404, "No blog draft found for today. Image was not uploaded.");
  }

  const imageHash = createHash("sha256").update(input.image).digest("hex").slice(0, 16);

  // Retried request: this exact image is already on one of today's drafts.
  const applied = drafts.find((draft) =>
    draft.cover_image?.endsWith(`/${coverBlobName(draft.id, imageHash, input.mimeType)}`),
  );
  if (applied) {
    return {
      blogId: applied.id,
      title: applied.title,
      coverImageUrl: applied.cover_image as string,
      status: "draft",
      istDate: day.date,
      alreadyApplied: true,
    };
  }

  const target = drafts.find((draft) => !hasCoverImage(draft));
  if (!target) {
    throw new CoverWebhookError(
      "IMAGE_ALREADY_PRESENT",
      409,
      "Image already present in today's blog draft. Workflow image was not saved.",
    );
  }

  const blobName = coverBlobName(target.id, imageHash, input.mimeType);
  const coverImageUrl = await uploadToAzureBlob(input.image, blobName, input.mimeType);

  // Conditional update: only succeeds if the blog is still today's agent draft without a cover image.
  // Concurrent requests or a publish in between make it affect 0 rows instead of overwriting.
  let updated = false;
  try {
    const result = (await query(
      `UPDATE blogs
       SET cover_image = ?
       WHERE id = ?
         AND status = 'draft'
         AND author_id = ?
         AND (cover_image IS NULL OR TRIM(cover_image) = '')`,
      [coverImageUrl, target.id, agent.id],
    )) as unknown as { affectedRows: number };
    updated = result.affectedRows === 1;
  } catch (error) {
    console.error(`[cover-webhook] cover update failed for blog ${target.id}:`, error);
    await discardUpload(target.id, blobName, coverImageUrl);
    throw new CoverWebhookError("UPDATE_FAILED", 500, "Failed to update the blog draft. Image was not saved.");
  }

  if (!updated) {
    const current = await queryOne<{ cover_image: string | null }>(
      "SELECT cover_image FROM blogs WHERE id = ? LIMIT 1",
      [target.id],
    );
    if (current?.cover_image === coverImageUrl) {
      return {
        blogId: target.id,
        title: target.title,
        coverImageUrl,
        status: "draft",
        istDate: day.date,
        alreadyApplied: true,
      };
    }

    await discardUpload(target.id, blobName, coverImageUrl);
    throw new CoverWebhookError(
      "DRAFT_CHANGED",
      409,
      "Today's blog draft changed while the image was being saved (it got an image, was published or was deleted). Image was not saved.",
    );
  }

  await writeAuditLog({
    userId: agent.id,
    userName: agent.name,
    userEmail: agent.email,
    userRole: agent.role,
    action: "update",
    resourceType: "blog",
    resourceId: target.id,
    resourceLabel: target.title,
    details: {
      field: "cover_image",
      status: "draft",
      via: "cover_image_webhook",
      istDate: day.date,
      ...(input.idempotencyKey && { idempotencyKey: input.idempotencyKey }),
    },
    request: input.request,
  });

  return {
    blogId: target.id,
    title: target.title,
    coverImageUrl,
    status: "draft",
    istDate: day.date,
    alreadyApplied: false,
  };
}
