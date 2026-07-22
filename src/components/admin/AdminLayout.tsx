"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { logoutClient } from "@/lib/admin-client";
import type { SessionUser } from "@/types/admin";
import { AdminSidebar } from "./AdminSidebar";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { useAdminTheme } from "./AdminThemeProvider";

export function AdminLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await logoutClient();
    router.push("/admin");
    router.refresh();
  }

  function handleSidebarToggle() {
    if (window.innerWidth < 768) {
      setMobileOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  }

  return (
    <div className={`admin-v2-shell ${theme === "dark" ? "admin-v2-shell-dark" : "admin-v2-shell-light"}`}>
      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex">
        <AdminSidebar
          user={user}
          collapsed={sidebarCollapsed}
          onLogout={() => void handleLogout()}
        />
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="admin-mobile-overlay md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div
        className={`admin-main-column ${sidebarCollapsed ? "admin-main-column-collapsed" : ""}`}
      >
        <header className="admin-header-premium">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-header-icon-btn hidden md:inline-flex"
              onClick={handleSidebarToggle}
              aria-label="Toggle sidebar"
            >
              <PanelLeftClose
                className={`size-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
              />
            </button>
            <button
              type="button"
              className="admin-header-icon-btn md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <span className="admin-header-version">
              <Sparkles className="size-3.5" />
              Admin v1
            </span>

            <div className="admin-header-search hidden md:flex">
              <Search className="size-4" />
              <input
                type="search"
                placeholder="Search admin..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <kbd>⌘K</kbd>
            </div>
          </div>

          <div className="admin-header-right">
            <AdminThemeToggle compact />

            <div className="admin-header-divider hidden sm:block" />

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="admin-user-trigger"
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <span className="admin-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="admin-user-meta hidden md:flex">
                  <span className="admin-user-name">{user.name}</span>
                  <span className="admin-user-role">
                    {user.role === "superadmin" ? "Super Admin" : "Admin"}
                  </span>
                </span>
                <ChevronDown className="size-4 text-[var(--admin-muted)] hidden md:block" />
              </button>

              {userMenuOpen ? (
                <div className="admin-user-menu">
                  <div className="admin-user-menu-head">
                    <p className="font-medium text-[var(--admin-text)]">{user.name}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{user.email}</p>
                  </div>
                  <button type="button" className="admin-user-menu-item">
                    <User className="size-4" />
                    Profile
                  </button>
                  <button type="button" className="admin-user-menu-item">
                    <Settings className="size-4" />
                    Settings
                  </button>
                  <button
                    type="button"
                    className="admin-user-menu-item admin-user-menu-item-danger"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="admin-page-canvas">
          <div className="admin-page-inner">{children}</div>
        </main>
      </div>

      <aside
        className={`admin-mobile-sidebar md:hidden ${mobileOpen ? "admin-mobile-sidebar-open" : ""}`}
      >
        <AdminSidebar
          user={user}
          collapsed={false}
          onLinkClick={() => setMobileOpen(false)}
          onLogout={() => void handleLogout()}
        />
      </aside>
    </div>
  );
}
