import {
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { queryOne } from "@/lib/db";
import type { BlogWithAuthor } from "@/types/admin";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const blog = await queryOne<BlogWithAuthor>(
      `SELECT b.*, u.name AS author_name, u.email AS author_email
       FROM blogs b
       LEFT JOIN users u ON u.id = b.author_id
       WHERE b.slug = ? AND b.status = 'published'
       LIMIT 1`,
      [slug],
    );

    if (!blog) {
      return jsonNotFound("Blog not found");
    }

    return jsonSuccess(blog);
  } catch (error) {
    console.error("Get blog by slug error:", error);
    return jsonServerError();
  }
}
