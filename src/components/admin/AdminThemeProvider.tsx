"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AdminTheme = "dark" | "light";

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "ct-admin-theme";

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<AdminTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
    }

    setReady(true);
  }, []);

  function setTheme(nextTheme: AdminTheme) {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        className="admin-root"
        data-theme={theme}
        suppressHydrationWarning
        style={ready ? undefined : { visibility: "hidden" }}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }

  return context;
}
