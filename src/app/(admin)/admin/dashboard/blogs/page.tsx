import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ManageBlogs } from "@/components/admin/ManageBlogs";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Blogs | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBlogsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/admin");

  const canManage =
    session.role === "superadmin" || session.permissions.can_manage_blogs;

  if (!canManage) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminShell user={session}>
      <ManageBlogs />
    </AdminShell>
  );
}
