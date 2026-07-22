import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requireSession, requireSuperAdmin } from "@/lib/auth-guard";
import { hashPassword, isSuperAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { listPanelUsers } from "@/lib/session";
import type { UserPermissions } from "@/types/admin";

export async function GET() {
  try {
    await requireSession();
    const users = await listPanelUsers();
    return jsonSuccess(users);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("List users error:", error);
    return jsonServerError();
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin";
      permissions?: Partial<UserPermissions>;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role ?? "admin";

    if (!name || !email || !password) {
      return jsonError("Name, email, and password are required");
    }

    if (role !== "admin") {
      return jsonError("Only admin users can be created from the panel");
    }

    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existing) {
      return jsonError("A user with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    await query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [name, email, passwordHash, role],
    );

    const createdUser = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    const userId = createdUser?.id;

    if (!userId) {
      return jsonServerError("Failed to create user");
    }

    await query(
      `INSERT INTO user_permissions (user_id, can_manage_blogs, can_manage_assets)
       VALUES (?, ?, ?)`,
      [
        userId,
        Boolean(body.permissions?.can_manage_blogs),
        Boolean(body.permissions?.can_manage_assets),
      ],
    );

    const users = await listPanelUsers();
    const created = users.find((user) => user.id === userId);

    return jsonSuccess(created, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Create user error:", error);
    return jsonServerError();
  }
}
