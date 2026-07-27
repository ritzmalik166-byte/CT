"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Users, UserCheck, Shield, Crown, X } from "lucide-react";
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

type EditForm = {
  name: string;
  email: string;
  password: string;
  can_manage_blogs: boolean;
  can_manage_assets: boolean;
  is_active: boolean;
};

type UsersManagerProps = {
  currentUser: SessionUser;
};

function accessLabel(user: PanelUser, key: keyof UserPermissions) {
  if (user.role === "superadmin") return "Full";
  return user.permissions[key] ? "Enabled" : "Disabled";
}

export function UsersManager({ currentUser }: UsersManagerProps) {
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<PanelUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PanelUser | null>(null);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.is_active).length;
    const admins = users.filter((user) => user.role === "admin").length;
    const superadmins = users.filter((user) => user.role === "superadmin").length;

    return { total, active, admins, superadmins };
  }, [users]);

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

  function canEditUser(user: PanelUser) {
    if (user.role === "admin") return true;
    return user.id === currentUser.id;
  }

  function canDeleteUser(user: PanelUser) {
    return user.role === "admin" && user.id !== currentUser.id;
  }

  function openEditModal(user: PanelUser) {
    if (!canEditUser(user)) return;

    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      can_manage_blogs: user.permissions.can_manage_blogs,
      can_manage_assets: user.permissions.can_manage_assets,
      is_active: user.is_active,
    });
    setEditError("");
  }

  function closeEditModal() {
    setEditUser(null);
    setEditForm(null);
    setEditError("");
  }

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

  async function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editUser || !editForm) return;

    setEditSaving(true);
    setEditError("");

    try {
      const payload: Record<string, unknown> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      if (editUser.role === "admin") {
        payload.is_active = editForm.is_active;
        payload.permissions = {
          can_manage_blogs: editForm.can_manage_blogs,
          can_manage_assets: editForm.can_manage_assets,
        };
      }

      await apiSend(`/api/users/${editUser.id}`, "PUT", payload);
      closeEditModal();
      await loadUsers();
    } catch (updateError) {
      setEditError(updateError instanceof Error ? updateError.message : "Update failed");
    } finally {
      setEditSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await apiSend(`/api/users/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
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
      <div className="admin-filter-grid">
        <div className="admin-filter-card admin-filter-card-v2 active">
          <span className="admin-filter-label flex items-center gap-2">
            <Users className="size-3.5" />
            Total Users
          </span>
          <span className="admin-filter-value">{stats.total}</span>
        </div>
        <div className="admin-filter-card admin-filter-card-v2">
          <span className="admin-filter-label flex items-center gap-2">
            <UserCheck className="size-3.5" />
            Active
          </span>
          <span className="admin-filter-value">{stats.active}</span>
        </div>
        <div className="admin-filter-card admin-filter-card-v2">
          <span className="admin-filter-label flex items-center gap-2">
            <Shield className="size-3.5" />
            Admins
          </span>
          <span className="admin-filter-value">{stats.admins}</span>
        </div>
        <div className="admin-filter-card admin-filter-card-v2">
          <span className="admin-filter-label flex items-center gap-2">
            <Crown className="size-3.5" />
            Superadmins
          </span>
          <span className="admin-filter-value">{stats.superadmins}</span>
        </div>
      </div>

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
                  <p className="text-[10px] uppercase tracking-wider text-[var(--admin-muted)]">
                    ID {user.id}
                  </p>
                </td>
                <td>
                  <span className="admin-badge admin-badge-gold">{user.role}</span>
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      user.role === "superadmin" || user.permissions.can_manage_blogs
                        ? "admin-badge-green"
                        : "admin-badge-gray"
                    }`}
                  >
                    {accessLabel(user, "can_manage_blogs")}
                  </span>
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      user.role === "superadmin" || user.permissions.can_manage_assets
                        ? "admin-badge-green"
                        : "admin-badge-gray"
                    }`}
                  >
                    {accessLabel(user, "can_manage_assets")}
                  </span>
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      user.is_active ? "admin-badge-green" : "admin-badge-gray"
                    }`}
                  >
                    {user.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {canEditUser(user) ? (
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="admin-btn admin-btn-secondary !px-3 !py-2"
                        title="Edit user"
                      >
                        <Pencil className="size-4" />
                      </button>
                    ) : null}
                    {canDeleteUser(user) ? (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="admin-btn admin-btn-danger !px-3 !py-2"
                        title="Delete user"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : (
                      !canEditUser(user) && "—"
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && editForm ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <p className="admin-toolbar-eyebrow">Edit User</p>
                <h3 className="admin-toolbar-title">{editUser.name}</h3>
                <p className="text-xs text-[var(--admin-muted)]">User ID {editUser.id}</p>
              </div>
              <button type="button" className="admin-icon-btn" onClick={closeEditModal}>
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="admin-modal-body space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                  Full name
                </label>
                <input
                  className="admin-input"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                  Email
                </label>
                <input
                  className="admin-input"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                  New password
                </label>
                <input
                  className="admin-input"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={editForm.password}
                  onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                />
              </div>

              {editUser.role === "admin" ? (
                <>
                  <div className="flex flex-wrap gap-6 text-sm text-[var(--admin-text)]">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={editForm.can_manage_blogs}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            can_manage_blogs: event.target.checked,
                          })
                        }
                      />
                      Can manage blogs
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={editForm.can_manage_assets}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            can_manage_assets: event.target.checked,
                          })
                        }
                      />
                      Can manage website assets
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={editForm.is_active}
                      onChange={(event) =>
                        setEditForm({ ...editForm, is_active: event.target.checked })
                      }
                    />
                    Account is active
                  </label>
                </>
              ) : (
                <p className="rounded-xl border border-[var(--admin-border)] px-3 py-2 text-xs text-[var(--admin-muted)]">
                  Superadmin accounts always have full blog and asset access.
                </p>
              )}

              {editError ? (
                <p className="admin-error rounded-xl px-3 py-2 text-sm">{editError}</p>
              ) : null}

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" disabled={editSaving} className="admin-btn admin-btn-primary">
                  {editSaving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <p className="admin-toolbar-eyebrow">Confirm delete</p>
                <h3 className="admin-toolbar-title">Remove {deleteTarget.name}?</h3>
              </div>
              <button type="button" className="admin-icon-btn" onClick={() => setDeleteTarget(null)}>
                <X className="size-4" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="text-sm text-[var(--admin-muted)]">
                This will permanently delete <strong>{deleteTarget.email}</strong>. This action
                cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => void confirmDelete()}>
                Delete user
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
