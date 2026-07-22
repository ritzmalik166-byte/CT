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
      return jsonUnauthorized("Invalid credentials");
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return jsonUnauthorized("Invalid credentials");
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieOptions(token));

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

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(getClearAuthCookieOptions());
  return jsonSuccess({ loggedOut: true });
}
