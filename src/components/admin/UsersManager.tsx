"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/admin-client";
import type { SessionUser, UserPermissions } from "@/types/admin";

type PanelUser = SessionUser;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  can_manage_blogs: false,
  can_manage_assets: false,
};

export function UsersManager() {
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await apiGet<PanelUser[]>("/api/users");
      setUsers(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiSend("/api/users", "POST", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "admin",
        permissions: {
          can_manage_blogs: form.can_manage_blogs,
          can_manage_assets: form.can_manage_assets,
        },
      });
      setForm(emptyForm);
      await loadUsers();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function updatePermissions(userId: number, permissions: UserPermissions) {
    try {
      await apiSend(`/api/users/${userId}`, "PUT", { permissions });
      await loadUsers();
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Update failed");
    }
  }

  async function toggleActive(user: PanelUser) {
    if (user.role === "superadmin") return;

    try {
      await apiSend(`/api/users/${user.id}`, "PUT", { is_active: !user.is_active });
      await loadUsers();
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Update failed");
    }
  }

  async function handleDelete(user: PanelUser) {
    if (user.role === "superadmin") return;
    if (!confirm(`Delete admin ${user.email}?`)) return;

    try {
      await apiSend(`/api/users/${user.id}`, "DELETE");
      await loadUsers();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="ct-panel admin-empty-state">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate} className="ct-panel space-y-4">
        <div className="admin-toolbar !p-0">
          <div>
            <p className="admin-toolbar-eyebrow">Access Control</p>
            <h3 className="admin-toolbar-title">Create Admin User</h3>
            <p className="admin-toolbar-copy">
              Superadmin assigns blog and asset permissions per admin.
            </p>
          </div>
          <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add Admin
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="admin-input"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="admin-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-[var(--admin-text)]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="admin-checkbox"
              checked={form.can_manage_blogs}
              onChange={(event) =>
                setForm({ ...form, can_manage_blogs: event.target.checked })
              }
            />
            Can manage blogs
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="admin-checkbox"
              checked={form.can_manage_assets}
              onChange={(event) =>
                setForm({ ...form, can_manage_assets: event.target.checked })
              }
            />
            Can manage website assets
          </label>
        </div>

        {error ? <p className="admin-error rounded-xl px-3 py-2 text-sm">{error}</p> : null}
      </form>

      <div className="ct-panel overflow-hidden admin-table-wrap">
        <table className="admin-table admin-table-executive">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Blog Access</th>
              <th>Asset Access</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[var(--admin-muted)]">{user.email}</p>
                </td>
                <td>
                  <span className="admin-badge admin-badge-gold">{user.role}</span>
                </td>
                <td>
                  {user.role === "superadmin" ? (
                    <span className="admin-badge admin-badge-green">Full</span>
                  ) : (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={user.permissions.can_manage_blogs}
                        onChange={(event) =>
                          void updatePermissions(user.id, {
                            ...user.permissions,
                            can_manage_blogs: event.target.checked,
                          })
                        }
                      />
                      Enabled
                    </label>
                  )}
                </td>
                <td>
                  {user.role === "superadmin" ? (
                    <span className="admin-badge admin-badge-green">Full</span>
                  ) : (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={user.permissions.can_manage_assets}
                        onChange={(event) =>
                          void updatePermissions(user.id, {
                            ...user.permissions,
                            can_manage_assets: event.target.checked,
                          })
                        }
                      />
                      Enabled
                    </label>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    disabled={user.role === "superadmin"}
                    onClick={() => void toggleActive(user)}
                    className={`admin-badge ${
                      user.is_active ? "admin-badge-green" : "admin-badge-gray"
                    }`}
                  >
                    {user.is_active ? "Active" : "Disabled"}
                  </button>
                </td>
                <td>
                  {user.role === "admin" ? (
                    <button
                      type="button"
                      onClick={() => void handleDelete(user)}
                      className="admin-btn admin-btn-danger !px-3 !py-2"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
