import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AssetsManager } from "@/components/admin/AssetsManager";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Assets | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAssetsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin");

  const canManage =
    session.role === "superadmin" || session.permissions.can_manage_assets;

  if (!canManage) redirect("/admin/dashboard");

  return (
    <AdminShell
      user={session}
      title="Website Assets"
      description="Update hero images, logos, banners, and other website asset references."
    >
      <AssetsManager />
    </AdminShell>
  );
}
