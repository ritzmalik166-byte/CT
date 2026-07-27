import { query, queryOne } from "@/lib/db";
import {
  getAuthTokenPayload,
  isPanelRole,
  resolvePermissions,
} from "@/lib/auth";
import type { SessionUser, UserPermissions, UserRole } from "@/types/admin";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  can_manage_blogs?: 0 | 1 | boolean | null;
  can_manage_assets?: 0 | 1 | boolean | null;
}

function mapPermissions(row: UserRow): UserPermissions {
  return resolvePermissions(row.role, {
    can_manage_blogs: Boolean(row.can_manage_blogs),
    can_manage_assets: Boolean(row.can_manage_assets),
  });
}

export async function getUserByEmail(email: string) {
  return queryOne<UserRow & { password_hash: string }>(
    `SELECT u.*, p.can_manage_blogs, p.can_manage_assets
     FROM users u
     LEFT JOIN user_permissions p ON p.user_id = u.id
     WHERE u.email = ?
     LIMIT 1`,
    [email],
  );
}

export async function getUserById(id: number) {
  return queryOne<UserRow>(
    `SELECT u.*, p.can_manage_blogs, p.can_manage_assets
     FROM users u
     LEFT JOIN user_permissions p ON p.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [id],
  );
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await getAuthTokenPayload();

  if (!payload) {
    return null;
  }

  const user = await getUserById(payload.userId);

  if (!user || !user.is_active || !isPanelRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    permissions: mapPermissions(user),
  };
}

export async function listPanelUsers() {
  const rows = await query<UserRow>(
    `SELECT u.*, p.can_manage_blogs, p.can_manage_assets
     FROM users u
     LEFT JOIN user_permissions p ON p.user_id = u.id
     WHERE u.role IN ('superadmin', 'admin')
     ORDER BY u.created_at DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    permissions: mapPermissions(row),
  }));
}
