import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Contenaissance",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[var(--admin-muted)]">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
