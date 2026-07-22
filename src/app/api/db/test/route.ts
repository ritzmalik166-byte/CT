import { jsonServerError, jsonSuccess } from "@/lib/api-response";
import { pingDatabase, queryOne } from "@/lib/db";

export async function GET() {
  try {
    await pingDatabase();

    const dbInfo = await queryOne<{ db: string; version: string }>(
      "SELECT DATABASE() AS db, VERSION() AS version",
    );

    return jsonSuccess({
      connected: true,
      database: dbInfo?.db ?? null,
      version: dbInfo?.version ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    return jsonServerError(message);
  }
}
