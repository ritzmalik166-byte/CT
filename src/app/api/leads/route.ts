import {
  jsonForbidden,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission } from "@/lib/auth-guard";
import { query, queryOne } from "@/lib/db";
import type { Lead, LeadStats, LeadsResponse } from "@/types/admin";

export async function GET(request: Request) {
  try {
    await requirePermission("can_manage_leads");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const type = searchParams.get("type")?.trim() || "all";

    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (search) {
      whereClauses.push(
        "(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR message LIKE ? OR source LIKE ?)",
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status && status !== "all") {
      whereClauses.push("status = ?");
      params.push(status);
    }

    if (type && type !== "all") {
      whereClauses.push("type = ?");
      params.push(type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*) AS total FROM leads ${whereSql}`,
      params,
    );
    const total = countRow?.total ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const leads = await query<Lead>(
      `SELECT id, type, full_name, email, phone, service, message, source, status, notes, created_at, updated_at
       FROM leads
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const statsRow = await queryOne<LeadStats>(
      `SELECT
        COUNT(*) AS totalLeads,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingLeads,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) AS contactedLeads,
        SUM(CASE WHEN status = 'Qualified' THEN 1 ELSE 0 END) AS qualifiedLeads,
        SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) AS convertedLeads,
        SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) AS lostLeads
       FROM leads`,
    );

    const stats: LeadStats = {
      totalLeads: Number(statsRow?.totalLeads ?? 0),
      pendingLeads: Number(statsRow?.pendingLeads ?? 0),
      contactedLeads: Number(statsRow?.contactedLeads ?? 0),
      qualifiedLeads: Number(statsRow?.qualifiedLeads ?? 0),
      convertedLeads: Number(statsRow?.convertedLeads ?? 0),
      lostLeads: Number(statsRow?.lostLeads ?? 0),
    };

    const response: LeadsResponse = {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    };

    return jsonSuccess(response);
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonForbidden(error.message);
    }
    console.error("GET /api/leads error:", error);
    return jsonServerError();
  }
}
