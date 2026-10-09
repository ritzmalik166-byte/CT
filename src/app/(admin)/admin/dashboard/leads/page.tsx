import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Lead Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin");

  if (session.role !== "superadmin" && !session.permissions.can_manage_leads) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminShell
      user={session}
      title="Lead Management"
      description="Track, filter, update status, and manage incoming contact enquiries."
    >
      <LeadsManager currentUser={session} />
    </AdminShell>
  );
}
