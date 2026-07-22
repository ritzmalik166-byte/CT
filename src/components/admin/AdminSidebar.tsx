"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Users,
} from "lucide-react";
import type { SessionUser } from "@/types/admin";
import { AdminLogo } from "./AdminLogo";

const mainNav = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    show: (_user: SessionUser) => true,
  },
];

const groups = [
  {
    id: "content",
    label: "Content",
    icon: PenSquare,
    items: [
      {
        href: "/admin/dashboard/blogs",
        label: "Manage Blogs",
        icon: FileText,
        show: (user: SessionUser) =>
          user.role === "superadmin" || user.permissions.can_manage_blogs,
      },
      {
        href: "/admin/dashboard/assets",
        label: "Website Assets",
        icon: ImageIcon,
        show: (user: SessionUser) =>
          user.role === "superadmin" || user.permissions.can_manage_assets,
      },
    ],
  },
  {
    id: "access",
    label: "Access Control",
    icon: Users,
    items: [
      {
        href: "/admin/dashboard/users",
        label: "Manage Users",
        icon: Users,
        show: (user: SessionUser) => user.role === "superadmin",
      },
    ],
  },
];

export function AdminSidebar({
  user,
  collapsed = false,
  onLinkClick,
  onLogout,
}: {
  user: SessionUser;
  collapsed?: boolean;
  onLinkClick?: () => void;
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className={`admin-sidebar-premium ${collapsed ? "admin-sidebar-collapsed" : ""}`}
    >
      <div className="admin-sidebar-brand">
        <AdminLogo href="/admin/dashboard" showWordmark={!collapsed} size={collapsed ? 34 : 40} />
      </div>

      <div className="admin-sidebar-scroll">
        <nav className="admin-sidebar-nav">
          <p className={`admin-sidebar-section ${collapsed ? "sr-only" : ""}`}>Main</p>
          {mainNav
            .filter((item) => item.show(user))
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={`admin-nav-link ${active ? "admin-nav-active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}

          {groups.map((group) => {
            const visibleItems = group.items.filter((item) => item.show(user));
            if (visibleItems.length === 0) return null;

            const groupActive = visibleItems.some((item) => isActive(item.href));

            return (
              <div key={group.id} className="admin-sidebar-group">
                <p
                  className={`admin-sidebar-section ${collapsed ? "sr-only" : ""} ${groupActive ? "admin-sidebar-section-active" : ""}`}
                >
                  {group.label}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onLinkClick}
                      className={`admin-nav-link admin-nav-link-nested ${active ? "admin-nav-active" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-footer">
        {!collapsed ? (
          <>
            <p className="admin-sidebar-user-name">{user.name}</p>
            <p className="admin-sidebar-user-email">{user.email}</p>
          </>
        ) : null}
        <button type="button" className="admin-nav-link admin-nav-logout" onClick={onLogout}>
          <LogOut className="size-4" />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </aside>
  );
}
