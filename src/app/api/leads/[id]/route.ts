import {
  jsonError,
  jsonForbidden,
  jsonNotFound,
  jsonServerError,
  jsonSuccess,
} from "@/lib/api-response";
import { AuthError, requirePermission, requireSuperAdmin } from "@/lib/auth-guard";
import { auditFromSession } from "@/lib/audit-log";
import { query, queryOne } from "@/lib/db";
import type { Lead, LeadNote, LeadStatus } from "@/types/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: LeadStatus[] = [
  "Pending",
  "Contacted",
  "Qualified",
  "Converted",
  "Lost",
];

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requirePermission("can_manage_leads");
    const { id } = await context.params;
    const leadId = Number(id);

    if (!leadId) {
      return jsonError("Invalid lead id");
    }

    const lead = await queryOne<Lead>(
      "SELECT * FROM leads WHERE id = ? LIMIT 1",
      [leadId],
    );

    if (!lead) {
      return jsonNotFound("Lead not found");
    }

    const notes = await query<LeadNote>(
      "SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC",
      [leadId],
    );

    return jsonSuccess({ lead, notes });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonForbidden(error.message);
    }
    console.error("GET /api/leads/[id] error:", error);
    return jsonServerError();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requirePermission("can_manage_leads");
    const { id } = await context.params;
    const leadId = Number(id);

    if (!leadId) {
      return jsonError("Invalid lead id");
    }

    const lead = await queryOne<Lead>(
      "SELECT * FROM leads WHERE id = ? LIMIT 1",
      [leadId],
    );

    if (!lead) {
      return jsonNotFound("Lead not found");
    }

    const body = (await request.json()) as {
      status?: LeadStatus;
      note?: string;
    };

    const newStatus = body.status?.trim() as LeadStatus | undefined;
    const newNote = body.note?.trim();

    if (newStatus && !VALID_STATUSES.includes(newStatus)) {
      return jsonError("Invalid status value");
    }

    if (newStatus && newStatus !== lead.status) {
      await query("UPDATE leads SET status = ? WHERE id = ?", [newStatus, leadId]);
    }

    if (newNote) {
      const now = new Date();
      await query(
        `INSERT INTO lead_notes (lead_id, user_id, author_name, note, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [leadId, session.id, session.name, newNote, now],
      );

      await query(
        `UPDATE leads SET notes = ?, updated_at = ? WHERE id = ?`,
        [newNote, now, leadId],
      );
    }

    const updatedLead = await queryOne<Lead>(
      "SELECT * FROM leads WHERE id = ? LIMIT 1",
      [leadId],
    );

    const notes = await query<LeadNote>(
      "SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC",
      [leadId],
    );

    await auditFromSession(session, {
      action: newStatus ? "status_change" : "update",
      resourceType: "lead",
      resourceId: leadId,
      resourceLabel: lead.email,
      details: {
        previous_status: lead.status,
        new_status: newStatus ?? lead.status,
        added_note: Boolean(newNote),
      },
      request,
    });

    return jsonSuccess({ lead: updatedLead, notes });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonForbidden(error.message);
    }
    console.error("PUT /api/leads/[id] error:", error);
    return jsonServerError();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await context.params;
    const leadId = Number(id);

    if (!leadId) {
      return jsonError("Invalid lead id");
    }

    const lead = await queryOne<Lead>(
      "SELECT * FROM leads WHERE id = ? LIMIT 1",
      [leadId],
    );

    if (!lead) {
      return jsonNotFound("Lead not found");
    }

    await query("DELETE FROM leads WHERE id = ?", [leadId]);

    await auditFromSession(session, {
      action: "delete",
      resourceType: "lead",
      resourceId: leadId,
      resourceLabel: lead.email,
      details: { email: lead.email, full_name: lead.full_name },
      request,
    });

    return jsonSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return jsonForbidden(error.message);
    }
    console.error("DELETE /api/leads/[id] error:", error);
    return jsonServerError();
  }
}
