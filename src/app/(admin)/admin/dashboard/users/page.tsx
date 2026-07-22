import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { UsersManager } from "@/components/admin/UsersManager";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Users | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin");

  if (session.role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  return (
    <AdminShell
      user={session}
      title="User Management"
      description="Superadmin can create admins and grant or revoke blog and asset permissions."
    >
      <UsersManager currentUser={session} />
    </AdminShell>
  );
}
