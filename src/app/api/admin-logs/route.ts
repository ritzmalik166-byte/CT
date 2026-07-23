import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requireSuperAdmin } from "@/lib/auth-guard";
import { query, queryOne } from "@/lib/db";
import type { AuditAction, AuditLog, AuditLogsResponse } from "@/types/admin";

const VALID_ACTIONS: AuditAction[] = [
  "login",
  "logout",
  "login_failed",
  "create",
  "update",
  "delete",
  "publish",
  "status_change",
];

function parseDetails(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 25));
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resource_type");
    const search = searchParams.get("search")?.trim();
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (action && VALID_ACTIONS.includes(action as AuditAction)) {
      conditions.push("action = ?");
      params.push(action);
    }

    if (resourceType) {
      conditions.push("resource_type = ?");
      params.push(resourceType);
    }

    if (search) {
      conditions.push(
        "(user_name LIKE ? OR user_email LIKE ? OR resource_label LIKE ?)",
      );
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*) AS total FROM admin_audit_logs ${whereClause}`,
      params,
    );

    const rows = await query<AuditLog>(
      `SELECT id, user_id, user_name, user_email, user_role, action,
              resource_type, resource_id, resource_label, details,
              ip_address, user_agent, created_at
       FROM admin_audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const logs = rows.map((row) => ({
      ...row,
      details: parseDetails(row.details),
    }));

    const total = countRow?.total ?? 0;
    const response: AuditLogsResponse = {
      logs,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };

    return jsonSuccess(response);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403
        ? jsonForbidden(error.message)
        : jsonError(error.message, error.status);
    }
    console.error("List admin logs error:", error);
    return jsonServerError();
  }
}
