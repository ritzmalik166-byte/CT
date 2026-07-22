import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type {
  AuthTokenPayload,
  PermissionKey,
  SessionUser,
  UserPermissions,
  UserRole,
} from "@/types/admin";

export const AUTH_COOKIE_NAME = "ct_admin_token";

const TOKEN_EXPIRY = "7d";

const SUPERADMIN_PERMISSIONS: UserPermissions = {
  can_manage_blogs: true,
  can_manage_assets: true,
};

const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  can_manage_blogs: false,
  can_manage_assets: false,
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in .env.local");
  }

  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthTokenPayload(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "superadmin";
}

export function isPanelRole(role: UserRole): boolean {
  return role === "superadmin" || role === "admin";
}

export function resolvePermissions(
  role: UserRole,
  permissions?: Partial<UserPermissions> | null,
): UserPermissions {
  if (isSuperAdmin(role)) {
    return SUPERADMIN_PERMISSIONS;
  }

  return {
    can_manage_blogs: Boolean(permissions?.can_manage_blogs),
    can_manage_assets: Boolean(permissions?.can_manage_assets),
  };
}

export function hasPermission(
  session: SessionUser,
  permission: PermissionKey,
): boolean {
  if (isSuperAdmin(session.role)) {
    return true;
  }

  return session.permissions[permission];
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAuthCookieOptions(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function getClearAuthCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export { DEFAULT_ADMIN_PERMISSIONS, SUPERADMIN_PERMISSIONS };
