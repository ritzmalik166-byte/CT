import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogsManager } from "@/components/admin/LogsManager";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Logs | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLogsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin");

  if (session.role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  return (
    <AdminShell
      user={session}
      title="Admin Logs"
      description="Track admin logins and all panel changes — visible to superadmin only."
    >
      <LogsManager />
    </AdminShell>
  );
}
