"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

export function AdminThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="admin-btn admin-btn-secondary admin-theme-toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {!compact ? (
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      ) : null}
    </button>
  );
}
