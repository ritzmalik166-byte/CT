import type { SessionUser } from "@/types/admin";
import { AdminLayout } from "./AdminLayout";
import { AdminPageHeader } from "./AdminPageHeader";

export function AdminShell({
  user,
  title,
  description,
  eyebrow,
  actions,
  children,
}: {
  user: SessionUser;
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AdminLayout user={user}>
      <div className="ct-dash">
        {title ? (
          <AdminPageHeader
            title={title}
            description={description}
            eyebrow={eyebrow}
            actions={actions}
          />
        ) : null}
        {children}
      </div>
    </AdminLayout>
  );
}
