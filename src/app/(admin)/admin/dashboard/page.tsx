import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardHero } from "@/components/admin/DashboardHero";
import { queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { DashboardStats } from "@/types/admin";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const stats =
    (await queryOne<DashboardStats>(
      `SELECT
        (SELECT COUNT(*) FROM blogs) AS totalBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'published') AS publishedBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'draft') AS draftBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'scheduled') AS scheduledBlogs,
        (SELECT COUNT(*) FROM blogs WHERE status = 'inactive') AS inactiveBlogs,
        (SELECT COUNT(*) FROM users WHERE role IN ('superadmin', 'admin')) AS totalUsers,
        (SELECT COUNT(*) FROM site_assets) AS totalAssets`,
    )) ?? {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      scheduledBlogs: 0,
      inactiveBlogs: 0,
      totalUsers: 0,
      totalAssets: 0,
    };

  const cards = [
    { label: "Total Blogs", value: stats.totalBlogs, href: "/admin/dashboard/blogs" },
    { label: "Published", value: stats.publishedBlogs, href: "/admin/dashboard/blogs" },
    { label: "Drafts", value: stats.draftBlogs, href: "/admin/dashboard/blogs" },
    { label: "Scheduled", value: stats.scheduledBlogs, href: "/admin/dashboard/blogs" },
    { label: "Admin Users", value: stats.totalUsers, href: "/admin/dashboard/users" },
    { label: "Site Assets", value: stats.totalAssets, href: "/admin/dashboard/assets" },
  ];

  return (
    <AdminShell user={session}>
      <DashboardHero user={session} />

      <div className="ct-stat-grid">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="ct-stat-card">
            <p className="ct-stat-label">{card.label}</p>
            <p className="ct-stat-value">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="ct-panel">
        <h3 className="ct-panel-title">Your Access Level</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="admin-badge admin-badge-gold">{session.role}</span>
          {(session.role === "superadmin" || session.permissions.can_manage_blogs) && (
            <span className="admin-badge admin-badge-green">Blog Management</span>
          )}
          {(session.role === "superadmin" || session.permissions.can_manage_assets) && (
            <span className="admin-badge admin-badge-green">Asset Management</span>
          )}
          {session.role === "superadmin" && (
            <span className="admin-badge admin-badge-green">User & Permission Control</span>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
