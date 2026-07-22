import type { Metadata } from "next";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | Contenaissance",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
