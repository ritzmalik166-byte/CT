import {
  jsonError,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requireSuperAdmin } from "@/lib/auth-guard";
import { hashPassword, isSuperAdmin } from "@/lib/auth";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import { listPanelUsers } from "@/lib/session";
import type { UserPermissions } from "@/types/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await context.params;
    const userId = Number(id);

    if (!userId) {
      return jsonError("Invalid user id");
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      is_active?: boolean;
      permissions?: Partial<UserPermissions>;
    };

    const target = await queryOne<{ id: number; role: string; email: string }>(
      "SELECT id, role, email FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!target) {
      return jsonNotFound("User not found");
    }

    if (isSuperAdmin(target.role as "superadmin" | "admin") && target.id !== session.id) {
      return jsonForbidden("Cannot modify another superadmin");
    }

    if (body.name) {
      await query("UPDATE users SET name = ? WHERE id = ?", [body.name.trim(), userId]);
    }

    if (body.email) {
      await query("UPDATE users SET email = ? WHERE id = ?", [
        body.email.trim().toLowerCase(),
        userId,
      ]);
    }

    if (body.password) {
      const passwordHash = await hashPassword(body.password);
      await query("UPDATE users SET password_hash = ? WHERE id = ?", [
        passwordHash,
        userId,
      ]);
    }

    if (typeof body.is_active === "boolean" && target.role === "admin") {
      await query("UPDATE users SET is_active = ? WHERE id = ?", [
        body.is_active,
        userId,
      ]);
    }

    if (body.permissions && target.role === "admin") {
      await query(
        `INSERT INTO user_permissions (user_id, can_manage_blogs, can_manage_assets)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           can_manage_blogs = VALUES(can_manage_blogs),
           can_manage_assets = VALUES(can_manage_assets)`,
        [
          userId,
          Boolean(body.permissions.can_manage_blogs),
          Boolean(body.permissions.can_manage_assets),
        ],
      );
    }

    const users = await listPanelUsers();
    const updated = users.find((user) => user.id === userId);

    const changedFields: string[] = [];
    if (body.name) changedFields.push("name");
    if (body.email) changedFields.push("email");
    if (body.password) changedFields.push("password");
    if (typeof body.is_active === "boolean") changedFields.push("is_active");
    if (body.permissions) changedFields.push("permissions");

    await auditFromSession(session, {
      action: "update",
      resourceType: "user",
      resourceId: userId,
      resourceLabel: updated?.email ?? target.email,
      details: { changed_fields: changedFields },
      request,
    });

    return jsonSuccess(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Update user error:", error);
    return jsonServerError();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await context.params;
    const userId = Number(id);

    if (!userId) {
      return jsonError("Invalid user id");
    }

    if (userId === session.id) {
      return jsonError("You cannot delete your own account");
    }

    const target = await queryOne<{ id: number; role: string; email: string; name: string }>(
      "SELECT id, role, email, name FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!target) {
      return jsonNotFound("User not found");
    }

    if (target.role === "superadmin") {
      return jsonForbidden("Superadmin accounts cannot be deleted");
    }

    await query("DELETE FROM users WHERE id = ?", [userId]);

    await auditFromSession(session, {
      action: "delete",
      resourceType: "user",
      resourceId: userId,
      resourceLabel: target.email,
      request,
    });

    return jsonSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Delete user error:", error);
    return jsonServerError();
  }
}
