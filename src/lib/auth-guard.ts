import {
  hasPermission,
  isSuperAdmin,
} from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import type { PermissionKey, SessionUser } from "@/types/admin";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser();

  if (!session) {
    throw new AuthError("Unauthorized", 401);
  }

  return session;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireSession();

  if (!isSuperAdmin(session.role)) {
    throw new AuthError("Superadmin access required", 403);
  }

  return session;
}

export async function requirePermission(
  permission: PermissionKey,
): Promise<SessionUser> {
  const session = await requireSession();

  if (!hasPermission(session, permission)) {
    throw new AuthError("You do not have permission for this action", 403);
  }

  return session;
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return error;
  }

  return new AuthError("Internal server error", 500);
}
