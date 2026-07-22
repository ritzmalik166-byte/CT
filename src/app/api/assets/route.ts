import {
  jsonError,
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission, requireSession } from "@/lib/auth-guard";
import { isSuperAdmin } from "@/lib/auth";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import type { SiteAsset } from "@/types/admin";

export async function GET() {
  try {
    await requireSession();

    const assets = await query<SiteAsset>(
      "SELECT * FROM site_assets ORDER BY label ASC",
    );

    return jsonSuccess(assets);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("List assets error:", error);
    return jsonServerError();
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("can_manage_assets");

    const body = (await request.json()) as {
      asset_key?: string;
      label?: string;
      asset_url?: string;
      asset_type?: SiteAsset["asset_type"];
      description?: string;
    };

    const assetKey = body.asset_key?.trim();
    const label = body.label?.trim();
    const assetUrl = body.asset_url?.trim();

    if (!assetKey || !label || !assetUrl) {
      return jsonError("Asset key, label, and URL are required");
    }

    await query(
      `INSERT INTO site_assets (asset_key, label, asset_url, asset_type, description, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assetKey,
        label,
        assetUrl,
        body.asset_type ?? "image",
        body.description?.trim() || null,
        session.id,
      ],
    );

    const created = await queryOne<SiteAsset>(
      "SELECT * FROM site_assets WHERE asset_key = ? LIMIT 1",
      [assetKey],
    );

    await auditFromSession(session, {
      action: "create",
      resourceType: "asset",
      resourceId: created?.id ?? null,
      resourceLabel: label,
      details: { asset_key: assetKey },
      request,
    });

    return jsonSuccess(created, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Create asset error:", error);
    return jsonServerError();
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSuperAdmin((await requireSession()).role)) {
      await requirePermission("can_manage_assets");
    }

    return POST(request);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    return jsonServerError();
  }
}
