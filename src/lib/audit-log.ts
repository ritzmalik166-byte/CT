import { query } from "@/lib/db";
import type { AuditAction, UserRole } from "@/types/admin";

export interface WriteAuditLogInput {
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: UserRole | null;
  action: AuditAction;
  resourceType?: string | null;
  resourceId?: number | null;
  resourceLabel?: string | null;
  details?: Record<string, unknown> | null;
  request?: Request;
}

export function getRequestMeta(request?: Request) {
  if (!request) {
    return { ipAddress: null, userAgent: null };
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;

  return { ipAddress, userAgent };
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    const { ipAddress, userAgent } = getRequestMeta(input.request);
    const detailsJson =
      input.details && Object.keys(input.details).length > 0
        ? JSON.stringify(input.details)
        : null;

    await query(
      `INSERT INTO admin_audit_logs (
         user_id, user_name, user_email, user_role, action,
         resource_type, resource_id, resource_label, details,
         ip_address, user_agent
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId ?? null,
        input.userName ?? null,
        input.userEmail ?? null,
        input.userRole ?? null,
        input.action,
        input.resourceType ?? null,
        input.resourceId ?? null,
        input.resourceLabel ?? null,
        detailsJson,
        ipAddress,
        userAgent,
      ],
    );
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export async function auditFromSession(
  session: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  },
  input: Omit<
    WriteAuditLogInput,
    "userId" | "userName" | "userEmail" | "userRole"
  >,
): Promise<void> {
  await writeAuditLog({
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    userRole: session.role,
    ...input,
  });
}
