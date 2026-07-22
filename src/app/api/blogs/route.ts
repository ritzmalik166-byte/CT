import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission, requireSession } from "@/lib/auth-guard";
import { slugifyTitle } from "@/lib/auth";
import { auditFromSession } from "@/lib/audit-log";
import { promoteScheduledBlogs } from "@/lib/blog-db";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { BlogFormPayload, BlogStatus, BlogWithAuthor } from "@/types/admin";

const BLOG_SELECT = `
  SELECT b.*,
         COALESCE(b.author_name, u.name) AS author_name,
         u.email AS author_email
  FROM blogs b
  LEFT JOIN users u ON u.id = b.author_id
`;

async function listBlogs(status?: string | null) {
  await promoteScheduledBlogs();

  let sql = `${BLOG_SELECT}`;
  const params: string[] = [];

  if (status && status !== "all") {
    sql += " WHERE b.status = ?";
    params.push(status);
  }

  sql += " ORDER BY b.updated_at DESC";

  return query<BlogWithAuthor>(sql, params);
}

function resolvePublicationFields(
  status: BlogStatus,
  scheduledPublishAt?: string | null,
  existingPublishedAt?: Date | null,
) {
  if (status === "published") {
    return {
      published_at: existingPublishedAt ?? new Date(),
      scheduled_publish_at: null,
    };
  }

  if (status === "scheduled") {
    return {
      published_at: null,
      scheduled_publish_at: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
    };
  }

  return {
    published_at: status === "inactive" ? existingPublishedAt : null,
    scheduled_publish_at: null,
  };
}

export async function GET(request: Request) {
  try {
    await promoteScheduledBlogs();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (status === "published") {
      const blogs = await query<BlogWithAuthor>(
        `${BLOG_SELECT} WHERE b.status = 'published' ORDER BY b.published_at DESC`,
      );
      return jsonSuccess(blogs);
    }

    const session = await getSessionUser();

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const canView =
      session.role === "superadmin" || session.permissions.can_manage_blogs;

    if (!canView) {
      return jsonForbidden("Blog access required");
    }

    const blogs = await listBlogs(status);
    return jsonSuccess(blogs);
  } catch (error) {
    console.error("List blogs error:", error);
    return jsonServerError();
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("can_manage_blogs");

    const body = (await request.json()) as Partial<BlogFormPayload>;

    const title = body.title?.trim();
    const content = body.content?.trim();
    const slugInput = body.slug?.trim();
    const status: BlogStatus = body.status ?? "draft";

    if (!title || !content) {
      return jsonError("Title and content are required");
    }

    let slug = slugInput || slugifyTitle(title);
    const existingSlug = await queryOne<{ id: number }>(
      "SELECT id FROM blogs WHERE slug = ? LIMIT 1",
      [slug],
    );

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const metaDescription = body.blog_meta_description?.trim() || body.excerpt?.trim() || null;
    const publication = resolvePublicationFields(status, body.scheduled_publish_at);

    await query(
      `INSERT INTO blogs (
         title, slug, excerpt, blog_keywords, blog_meta_description, content,
         cover_image, author_name, author_id, status, published_at, scheduled_publish_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        metaDescription,
        body.blog_keywords?.trim() || null,
        metaDescription,
        content,
        body.cover_image?.trim() || null,
        body.author_name?.trim() || session.name,
        session.id,
        status,
        publication.published_at,
        publication.scheduled_publish_at,
      ],
    );

    const created = await queryOne<BlogWithAuthor>(
      `${BLOG_SELECT} WHERE b.slug = ? LIMIT 1`,
      [slug],
    );

    await auditFromSession(session, {
      action: "create",
      resourceType: "blog",
      resourceId: created?.id ?? null,
      resourceLabel: title,
      details: { status, slug },
      request,
    });

    return jsonSuccess(created, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Create blog error:", error);
    return jsonServerError();
  }
}
