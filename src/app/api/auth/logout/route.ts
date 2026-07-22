import { cookies } from "next/headers";
import { jsonSuccess } from "@/lib/api-response";
import { getClearAuthCookieOptions } from "@/lib/auth";
import { auditFromSession } from "@/lib/audit-log";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (session) {
    await auditFromSession(session, {
      action: "logout",
      resourceType: "session",
      request,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(getClearAuthCookieOptions());
  return jsonSuccess({ loggedOut: true });
}
