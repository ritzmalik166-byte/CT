import { cookies } from "next/headers";
import { jsonSuccess } from "@/lib/api-response";
import { getClearAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(getClearAuthCookieOptions());
  return jsonSuccess({ loggedOut: true });
}
