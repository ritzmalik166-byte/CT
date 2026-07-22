import {
  jsonError,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission } from "@/lib/auth-guard";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import type { BlogStatus, BlogWithAuthor } from "@/types/admin";

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

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_blogs");
    const { id } = await context.params;
    const blogId = Number(id);

    const body = (await request.json()) as { status?: BlogStatus };
    const status = body.status;

    if (status !== "published" && status !== "inactive") {
      return jsonError("Status must be published or inactive");
    }

    const existing = await queryOne<{ id: number; title: string; status: BlogStatus }>(
      "SELECT id, title, status FROM blogs WHERE id = ? LIMIT 1",
      [blogId],
    );

    if (!existing) {
      return jsonNotFound("Blog not found");
    }

    if (status === "published") {
      await query(
        `UPDATE blogs
         SET status = 'published', published_at = COALESCE(published_at, NOW()), scheduled_publish_at = NULL
         WHERE id = ?`,
        [blogId],
      );
    } else {
      await query(
        `UPDATE blogs SET status = 'inactive', scheduled_publish_at = NULL WHERE id = ?`,
        [blogId],
      );
    }

    const updated = await queryOne<BlogWithAuthor>(
      `${BLOG_SELECT} WHERE b.id = ? LIMIT 1`,
      [blogId],
    );

    await auditFromSession(session, {
      action: "status_change",
      resourceType: "blog",
      resourceId: blogId,
      resourceLabel: existing.title,
      details: {
        from_status: existing.status,
        to_status: status,
      },
      request,
    });

    return jsonSuccess(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Update blog status error:", error);
    return jsonServerError();
  }
}
