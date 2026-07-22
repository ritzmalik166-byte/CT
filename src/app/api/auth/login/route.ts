import { cookies } from "next/headers";
import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
  jsonUnauthorized,
} from "@/lib/api-response";
import {
  getAuthCookieOptions,
  getClearAuthCookieOptions,
  isPanelRole,
  signAuthToken,
  verifyPassword,
} from "@/lib/auth";
import { getUserByEmail } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return jsonError("Email and password are required");
    }

    const user = await getUserByEmail(email);

    if (!user || !user.is_active || !isPanelRole(user.role)) {
      await writeAuditLog({
        userEmail: email,
        action: "login_failed",
        resourceType: "session",
        details: { reason: "invalid_credentials" },
        request,
      });
      return jsonUnauthorized("Invalid credentials");
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      await writeAuditLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: "login_failed",
        resourceType: "session",
        details: { reason: "invalid_password" },
        request,
      });
      return jsonUnauthorized("Invalid credentials");
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieOptions(token));

    await writeAuditLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "login",
      resourceType: "session",
      request,
    });

    return jsonSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonServerError();
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set(getClearAuthCookieOptions());
  return jsonSuccess({ loggedOut: true });
}
