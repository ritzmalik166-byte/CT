import {
  jsonError,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission } from "@/lib/auth-guard";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import type { SiteAsset } from "@/types/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_assets");
    const { id } = await context.params;
    const assetId = Number(id);

    const existing = await queryOne<SiteAsset>(
      "SELECT * FROM site_assets WHERE id = ? LIMIT 1",
      [assetId],
    );

    if (!existing) {
      return jsonNotFound("Asset not found");
    }

    const body = (await request.json()) as {
      label?: string;
      asset_url?: string;
      asset_type?: SiteAsset["asset_type"];
      description?: string;
    };

    await query(
      `UPDATE site_assets
       SET label = ?, asset_url = ?, asset_type = ?, description = ?, updated_by = ?
       WHERE id = ?`,
      [
        body.label?.trim() || existing.label,
        body.asset_url?.trim() || existing.asset_url,
        body.asset_type || existing.asset_type,
        body.description?.trim() ?? existing.description,
        session.id,
        assetId,
      ],
    );

    const updated = await queryOne<SiteAsset>(
      "SELECT * FROM site_assets WHERE id = ? LIMIT 1",
      [assetId],
    );

    await auditFromSession(session, {
      action: "update",
      resourceType: "asset",
      resourceId: assetId,
      resourceLabel: updated?.label ?? existing.label,
      details: { asset_key: existing.asset_key },
      request,
    });

    return jsonSuccess(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Update asset error:", error);
    return jsonServerError();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_assets");
    const { id } = await context.params;
    const assetId = Number(id);

    const existing = await queryOne<{ id: number; label: string; asset_key: string }>(
      "SELECT id, label, asset_key FROM site_assets WHERE id = ? LIMIT 1",
      [assetId],
    );

    if (!existing) {
      return jsonNotFound("Asset not found");
    }

    await query("DELETE FROM site_assets WHERE id = ?", [assetId]);

    await auditFromSession(session, {
      action: "delete",
      resourceType: "asset",
      resourceId: assetId,
      resourceLabel: existing.label,
      details: { asset_key: existing.asset_key },
      request,
    });

    return jsonSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 403 ? jsonForbidden(error.message) : jsonError(error.message, error.status);
    }
    console.error("Delete asset error:", error);
    return jsonServerError();
  }
}
