import { randomUUID } from "crypto";
import path from "path";
import mammoth from "mammoth";
import { query, queryOne } from "@/lib/db";
import { getUserById } from "@/lib/session";
import { isPanelRole, resolvePermissions, slugifyTitle } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit-log";
import { promoteScheduledBlogs } from "@/lib/blog-db";
import { BLOG_AUTHORS } from "@/lib/blog-utils";
import { getAzureBlobConfig, uploadToAzureBlob } from "@/lib/azure-blob";
import { getSiteUrl } from "@/lib/site-url";
import type { BlogStatus, UserRole } from "@/types/admin";
import { parseBlogDocHtml } from "@/lib/ct-connector/doc-parser";
import {
  GoogleDocFetchError,
  exportGoogleDocAsDocx,
  extractGoogleDocId,
  getGoogleServiceAccountEmail,
  type GoogleDocFetchErrorCode,
} from "@/lib/ct-connector/google-doc";

export const BANNER_MAX_BYTES = 600 * 1024;
const INLINE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_AUTHOR = BLOG_AUTHORS[0];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ConnectorErrorCode =
  | "AGENT_NOT_FOUND"
  | "AGENT_INACTIVE"
  | "AGENT_UNAUTHORIZED"
  | "INVALID_BANNER"
  | "BANNER_TYPE"
  | "BANNER_TOO_LARGE"
  | "INVALID_COVER_IMAGE"
  | "MISSING_GOOGLE_DOC"
  | "INVALID_GOOGLE_DOC"
  | "INVALID_DOC_TEMPLATE"
  | "INVALID_TITLE"
  | "INVALID_SLUG"
  | "DUPLICATE_BLOG"
  | "CREATE_FAILED"
  | GoogleDocFetchErrorCode;

/** Error whose message is safe to show to the MCP client. */
export class ConnectorError extends Error {
  constructor(
    public readonly code: ConnectorErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ConnectorError";
  }
}

type AgentAccount = { id: number; name: string; email: string; role: UserRole };

/**
 * Load the panel user Claude acts as (CT_AGENT_USER_ID).
 * Re-checked on every write so deactivating the user or removing blog access cuts the connector off immediately.
 */
export async function getCtAgentAccount(): Promise<AgentAccount> {
  const agentId = Number(process.env.CT_AGENT_USER_ID?.trim());
  if (!Number.isInteger(agentId) || agentId <= 0) {
    console.error("[ct-connector] CT_AGENT_USER_ID is missing or not a valid user id");
    throw new ConnectorError("AGENT_NOT_FOUND", "Agent account not found");
  }

  const user = await getUserById(agentId);
  if (!user) throw new ConnectorError("AGENT_NOT_FOUND", "Agent account not found");
  if (!user.is_active) throw new ConnectorError("AGENT_INACTIVE", "Agent account is inactive");

  const permissions = resolvePermissions(user.role, {
    can_manage_blogs: Boolean(user.can_manage_blogs),
  });
  if (!isPanelRole(user.role) || !permissions.can_manage_blogs) {
    throw new ConnectorError("AGENT_UNAUTHORIZED", "Agent account is not authorized to manage blogs");
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ---------------------------------------------------------------------------
// list_blogs
// ---------------------------------------------------------------------------

export type ListBlogsOptions = {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  search?: string;
};

type BlogListRow = {
  id: number;
  title: string;
  slug: string;
  status: BlogStatus;
  author_name: string | null;
  cover_image: string | null;
  published_at: Date | null;
  scheduled_publish_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
};

function toIso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function getBlogs(options: ListBlogsOptions = {}) {
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? 20), 1), 50);
  const page = Math.max(Math.trunc(options.page ?? 1), 1);

  await promoteScheduledBlogs();

  const where: string[] = [];
  const params: unknown[] = [];

  if (options.status) {
    where.push("b.status = ?");
    params.push(options.status);
  }

  const search = options.search?.trim();
  if (search) {
    where.push("(b.title LIKE ? OR b.slug LIKE ?)");
    const like = `%${escapeLike(search)}%`;
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRow, rows] = await Promise.all([
    queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM blogs b ${whereSql}`, params),
    query<BlogListRow>(
      `SELECT b.id, b.title, b.slug, b.status, b.cover_image, b.published_at,
              b.scheduled_publish_at, b.created_at, b.updated_at,
              COALESCE(b.author_name, u.name) AS author_name
       FROM blogs b
       LEFT JOIN users u ON u.id = b.author_id
       ${whereSql}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit],
    ),
  ]);

  const total = Number(countRow?.total ?? 0);
  const siteUrl = getSiteUrl();

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    blogs: rows.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      url: blog.status === "published" ? `${siteUrl}/blog/${blog.slug}` : null,
      status: blog.status,
      author: blog.author_name || null,
      hasCoverImage: Boolean(blog.cover_image),
      publishedAt: toIso(blog.published_at),
      scheduledAt: toIso(blog.scheduled_publish_at),
      createdAt: toIso(blog.created_at),
    })),
  };
}

export function getBlogAuthors() {
  return { authors: [...BLOG_AUTHORS], default: DEFAULT_AUTHOR };
}

// ---------------------------------------------------------------------------
// upload_banner
// ---------------------------------------------------------------------------

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ImageMimeType = keyof typeof IMAGE_TYPES;

const BANNER_TYPE_MESSAGE = "Banner image must be JPG, PNG or WebP";

function detectImageType(buffer: Buffer): ImageMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function normalizeDeclaredMimeType(value?: string): ImageMimeType | null | undefined {
  if (!value) return undefined;
  const lower = value.trim().toLowerCase();
  if (lower === "image/jpg") return "image/jpeg";
  return lower in IMAGE_TYPES ? (lower as ImageMimeType) : null;
}

function decodeBase64Image(data: string): Buffer {
  let payload = data.trim();
  const dataUrl = /^data:([^;,]+);base64,/i.exec(payload);
  if (dataUrl) payload = payload.slice(dataUrl[0].length);

  payload = payload.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!payload || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload) || payload.length % 4 === 1) {
    throw new ConnectorError("INVALID_BANNER", "Banner image data must be valid base64");
  }

  return Buffer.from(payload, "base64");
}

function safeStem(filename: string) {
  const base = path.basename(String(filename || "banner").replace(/\\/g, "/"));
  const stem = base
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return stem || "banner";
}

function blobName(stem: string, mime: ImageMimeType) {
  return `${stem}-${Date.now()}-${randomUUID().slice(0, 8)}.${IMAGE_TYPES[mime]}`;
}

export type UploadBannerInput = { filename: string; dataBase64: string; mimeType?: string };

export async function uploadBlogBanner(input: UploadBannerInput) {
  await getCtAgentAccount();

  const declared = normalizeDeclaredMimeType(input.mimeType);
  if (declared === null) throw new ConnectorError("BANNER_TYPE", BANNER_TYPE_MESSAGE);

  const buffer = decodeBase64Image(input.dataBase64);
  if (buffer.length === 0) throw new ConnectorError("INVALID_BANNER", "Banner image file is empty");
  if (buffer.length >= BANNER_MAX_BYTES) {
    throw new ConnectorError("BANNER_TOO_LARGE", "Banner image must be less than 600 KB");
  }

  // Extension and content type always follow the real bytes, never the client-supplied name.
  const detected = detectImageType(buffer);
  if (!detected || (declared && declared !== detected)) {
    throw new ConnectorError("BANNER_TYPE", BANNER_TYPE_MESSAGE);
  }

  const coverImageUrl = await uploadToAzureBlob(buffer, blobName(safeStem(input.filename), detected), detected);

  return {
    success: true,
    message: "Banner uploaded successfully. Pass coverImageUrl to create_blog_draft.",
    coverImageUrl,
    mimeType: detected,
    sizeBytes: buffer.length,
  };
}

/** Only accept cover images that live in our own Azure blog folder. */
function isOwnBlobUrl(value: string) {
  const { container, prefix, accountName } = getAzureBlobConfig();
  const base = `https://${accountName}.blob.core.windows.net/${container}/${prefix ? `${prefix}/` : ""}`;
  try {
    const url = new URL(value);
    return url.href.startsWith(base) && !url.pathname.includes("..");
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// create_blog_draft
// ---------------------------------------------------------------------------

export type CreateDraftInput = {
  googleDocUrl?: string;
  googleDocId?: string;
  blogTitle?: string;
  blogSlug?: string;
  authorName?: string;
  coverImageUrl?: string;
};

function googleDocErrorMessage(error: GoogleDocFetchError) {
  if (error.code === "GOOGLE_DOC_FORBIDDEN") {
    const serviceAccount = getGoogleServiceAccountEmail();
    return serviceAccount
      ? `Google Doc is not shared with the CT importer account. Share it with ${serviceAccount} as Viewer and try again.`
      : error.message;
  }
  if (error.code === "GOOGLE_DOC_NOT_FOUND") {
    return "Google Doc could not be found. Check that the document ID or URL is correct.";
  }
  return error.message;
}

/** Convert the .docx to HTML; inline images are uploaded to Azure instead of being stored as base64. */
async function docxToHtml(docx: Buffer, warnings: string[]) {
  let imageIndex = 0;

  const result = await mammoth.convertToHtml(
    { buffer: docx },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        imageIndex += 1;
        const buffer = await image.readAsBuffer();
        const mime = detectImageType(buffer);
        if (!mime || buffer.length > INLINE_IMAGE_MAX_BYTES) {
          warnings.push(`Inline image #${imageIndex} was skipped (must be JPG, PNG or WebP and 5 MB or smaller).`);
          return { src: "" };
        }
        const src = await uploadToAzureBlob(buffer, blobName(`inline-${imageIndex}`, mime), mime);
        // mammoth copies the doc's alt text onto the <img> itself.
        return { src };
      }),
    },
  );

  // Drop <img src=""> left by skipped images.
  return result.value.replace(/<img\b[^>]*\bsrc=""[^>]*\/?>/gi, "");
}

function isDuplicateKeyError(error: unknown) {
  return (error as { code?: string })?.code === "ER_DUP_ENTRY";
}

/**
 * Create a DRAFT blog from a Google Doc written in the admin panel's Word template.
 * Status is always "draft" and author_id is always the agent account — fixed server-side.
 */
export async function createDraftBlogFromGoogleDoc(input: CreateDraftInput, request?: Request) {
  const agent = await getCtAgentAccount();

  const rawDoc = String(input.googleDocUrl || input.googleDocId || "").trim();
  if (!rawDoc) {
    throw new ConnectorError("MISSING_GOOGLE_DOC", "Provide googleDocUrl or googleDocId");
  }
  const documentId = extractGoogleDocId(rawDoc);
  if (!documentId) {
    throw new ConnectorError(
      "INVALID_GOOGLE_DOC",
      "Invalid Google Doc URL. Provide a docs.google.com/document/d/<ID> link or a document ID.",
    );
  }

  const coverImage = input.coverImageUrl?.trim() || null;
  if (coverImage && !isOwnBlobUrl(coverImage)) {
    throw new ConnectorError("INVALID_COVER_IMAGE", "coverImageUrl must be a URL returned by upload_banner");
  }

  let docx: Buffer;
  try {
    docx = await exportGoogleDocAsDocx(documentId);
  } catch (error) {
    if (error instanceof GoogleDocFetchError) {
      throw new ConnectorError(error.code, googleDocErrorMessage(error));
    }
    throw error;
  }

  const warnings: string[] = [];
  const { fields, contentHtml } = parseBlogDocHtml(await docxToHtml(docx, warnings));

  if (!contentHtml) {
    throw new ConnectorError(
      "INVALID_DOC_TEMPLATE",
      'The Google Doc has no "Blog Content:" section. Use the CT template labels: Meta Title:, Slug URL:, Blog Keywords:, Author:, Meta Description:, Blog Content:',
    );
  }

  const title = (input.blogTitle?.trim() || fields["Meta Title"]).slice(0, 255);
  if (!title) {
    throw new ConnectorError("INVALID_TITLE", 'Blog title is missing. Add "Meta Title:" to the doc or pass blogTitle.');
  }

  const requestedSlug = (input.blogSlug?.trim() || fields["Slug URL"]).replace(/^\/+|\/+$/g, "").replace(/^blog\//i, "");
  const baseSlug = requestedSlug ? requestedSlug.toLowerCase() : slugifyTitle(title);
  if (!baseSlug || !SLUG_PATTERN.test(baseSlug) || baseSlug.length > 200) {
    throw new ConnectorError("INVALID_SLUG", "Invalid slug. Use lowercase letters, numbers and hyphens only.");
  }

  let slug = baseSlug;
  const taken = await queryOne<{ id: number }>("SELECT id FROM blogs WHERE slug = ? LIMIT 1", [slug]);
  if (taken) {
    slug = `${baseSlug}-${Date.now()}`;
    warnings.push(`Slug "${baseSlug}" is already taken; the draft was saved as "${slug}".`);
  }

  const requestedAuthor = input.authorName?.trim() || fields["Author"];
  const matchedAuthor = BLOG_AUTHORS.find((name) => name.toLowerCase() === requestedAuthor.toLowerCase());
  if (requestedAuthor && !matchedAuthor) {
    warnings.push(`Author "${requestedAuthor}" is not one of ${BLOG_AUTHORS.join(", ")}; used "${DEFAULT_AUTHOR}".`);
  }
  const authorName = matchedAuthor || DEFAULT_AUTHOR;

  const keywords = fields["Blog Keywords"].slice(0, 500) || null;
  const metaDescription = fields["Meta Description"] || null;

  if (!keywords) warnings.push("Blog Keywords is missing in the Google Doc (required before publishing).");
  if (!metaDescription) warnings.push("Meta Description is missing in the Google Doc (required before publishing).");
  if (!coverImage) warnings.push("No cover image attached. Upload one with upload_banner before publishing.");

  let insertId: number;
  try {
    const result = (await query(
      `INSERT INTO blogs (
         title, slug, excerpt, blog_keywords, blog_meta_description, content,
         cover_image, author_name, author_id, status, published_at, scheduled_publish_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, NULL)`,
      [title, slug, metaDescription, keywords, metaDescription, contentHtml, coverImage, authorName, agent.id],
    )) as unknown as { insertId: number };
    insertId = result.insertId;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConnectorError("DUPLICATE_BLOG", "A blog with this slug already exists");
    }
    console.error("[ct-connector] create_blog_draft insert failed:", error);
    throw new ConnectorError("CREATE_FAILED", "Failed to create draft");
  }

  await writeAuditLog({
    userId: agent.id,
    userName: agent.name,
    userEmail: agent.email,
    userRole: agent.role,
    action: "create",
    resourceType: "blog",
    resourceId: insertId,
    resourceLabel: title,
    details: { status: "draft", slug, via: "claude_mcp", googleDocId: documentId },
    request,
  });

  return {
    success: true,
    message: "Blog draft created successfully. The CT team can review and publish it in the admin panel.",
    blog: {
      id: insertId,
      title,
      slug,
      status: "draft",
      author: authorName,
      coverImage,
      keywords,
      metaDescription,
    },
    warnings,
  };
}
