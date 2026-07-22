export function AdminPageHeader({
  title,
  description,
  eyebrow = "Control Panel",
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-page-eyebrow">{eyebrow}</p>
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </div>
  );
}
