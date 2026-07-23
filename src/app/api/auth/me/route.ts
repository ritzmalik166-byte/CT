import {
  jsonServerError,
  jsonSuccess,
  jsonUnauthorized,
} from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return jsonUnauthorized();
    }

    return jsonSuccess(session);
  } catch (error) {
    console.error("Session error:", error);
    return jsonServerError();
  }
}
