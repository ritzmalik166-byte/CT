import { jsonSuccess } from "@/lib/api-response";

export async function GET() {
  return jsonSuccess({
    status: "ok",
    service: "ct-admin-api",
    timestamp: new Date().toISOString(),
  });
}
