import {
  jsonError,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission, requireSession } from "@/lib/auth-guard";
import { slugifyTitle } from "@/lib/auth";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import type { BlogFormPayload, BlogStatus, BlogWithAuthor } from "@/types/admin";

const BLOG_SELECT = `
  SELECT b.*,
         COALESCE(b.author_name, u.name) AS author_name,
         u.email AS author_email
  FROM blogs b
  LEFT JOIN users u ON u.id = b.author_id
`;

interface RouteContext {
  params: Promise<{ id: string }>;
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

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const blogId = Number(id);

    const blog = await queryOne<BlogWithAuthor>(
      `${BLOG_SELECT} WHERE b.id = ? LIMIT 1`,
      [blogId],
    );

    if (!blog) {
      return jsonNotFound("Blog not found");
    }

    if (blog.status !== "published") {
      const session = await requireSession();
      const canView =
        session.role === "superadmin" || session.permissions.can_manage_blogs;

      if (!canView) {
        return jsonForbidden();
      }
    }

    return jsonSuccess(blog);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Get blog error:", error);
    return jsonServerError();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_blogs");
    const { id } = await context.params;
    const blogId = Number(id);

    const existing = await queryOne<{
      id: number;
      title: string;
      status: BlogStatus;
      published_at: Date | null;
      slug: string;
    }>("SELECT id, title, status, published_at, slug FROM blogs WHERE id = ? LIMIT 1", [
      blogId,
    ]);

    if (!existing) {
      return jsonNotFound("Blog not found");
    }

    const body = (await request.json()) as Partial<BlogFormPayload>;

    const title = body.title?.trim() || existing.title;
    const content = body.content?.trim();
    const slug = body.slug?.trim() || slugifyTitle(title);
    const status = body.status ?? existing.status;
    const metaDescription =
      body.blog_meta_description?.trim() || body.excerpt?.trim() || null;

    const publication = resolvePublicationFields(
      status,
      body.scheduled_publish_at,
      existing.published_at,
    );

    await query(
      `UPDATE blogs SET
         title = ?, slug = ?, excerpt = ?, blog_keywords = ?, blog_meta_description = ?,
         content = COALESCE(?, content), cover_image = ?, author_name = ?, status = ?,
         published_at = ?, scheduled_publish_at = ?
       WHERE id = ?`,
      [
        title,
        slug,
        metaDescription,
        body.blog_keywords?.trim() || null,
        metaDescription,
        content || null,
        body.cover_image?.trim() || null,
        body.author_name?.trim() || null,
        status,
        publication.published_at,
        publication.scheduled_publish_at,
        blogId,
      ],
    );

    const updated = await queryOne<BlogWithAuthor>(
      `${BLOG_SELECT} WHERE b.id = ? LIMIT 1`,
      [blogId],
    );

    await auditFromSession(session, {
      action: "update",
      resourceType: "blog",
      resourceId: blogId,
      resourceLabel: title,
      details: {
        from_status: existing.status,
        to_status: status,
        slug,
      },
      request,
    });

    return jsonSuccess(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Update blog error:", error);
    return jsonServerError();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_blogs");
    const { id } = await context.params;
    const blogId = Number(id);

    const existing = await queryOne<{ id: number; title: string }>(
      "SELECT id, title FROM blogs WHERE id = ? LIMIT 1",
      [blogId],
    );

    if (!existing) {
      return jsonNotFound("Blog not found");
    }

    await query("DELETE FROM blogs WHERE id = ?", [blogId]);

    await auditFromSession(session, {
      action: "delete",
      resourceType: "blog",
      resourceId: blogId,
      resourceLabel: existing.title,
      request,
    });

    return jsonSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Delete blog error:", error);
    return jsonServerError();
  }
}
