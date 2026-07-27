import {
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requireSession } from "@/lib/auth-guard";
import { queryOne } from "@/lib/db";
import type { DashboardStats } from "@/types/admin";

export async function GET() {
  try {
    await requireSession();

    const stats = await queryOne<DashboardStats>(
      `SELECT
        (SELECT COUNT(*) FROM blogs) AS totalBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'published') AS publishedBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'draft') AS draftBlogs,
        (SELECT COUNT(*) FROM users WHERE role IN ('superadmin', 'admin')) AS totalUsers,
        (SELECT COUNT(*) FROM site_assets) AS totalAssets`,
    );

    return jsonSuccess(
      stats ?? {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalUsers: 0,
        totalAssets: 0,
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonForbidden(error.message);
    }
    console.error("Dashboard stats error:", error);
    return jsonServerError();
  }
}
