"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/admin-client";
import type { SiteAsset } from "@/types/admin";

const emptyAsset = {
  asset_key: "",
  label: "",
  asset_url: "",
  asset_type: "image" as SiteAsset["asset_type"],
  description: "",
};

export function AssetsManager() {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyAsset);
  const [error, setError] = useState("");

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await apiGet<SiteAsset[]>("/api/assets");
      setAssets(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    try {
      await apiSend("/api/assets", "POST", form);
      setForm(emptyAsset);
      await loadAssets();
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : "Create failed");
    }
  }

  async function handleUpdate(asset: SiteAsset, field: keyof SiteAsset, value: string) {
    try {
      await apiSend(`/api/assets/${asset.id}`, "PUT", { [field]: value });
      await loadAssets();
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Update failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this asset entry?")) return;

    try {
      await apiSend(`/api/assets/${id}`, "DELETE");
      await loadAssets();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="ct-panel admin-empty-state">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading assets...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate} className="ct-panel space-y-4">
        <div className="admin-toolbar !p-0">
          <div>
            <p className="admin-toolbar-eyebrow">Website Assets</p>
            <h3 className="admin-toolbar-title">Add New Asset</h3>
            <p className="admin-toolbar-copy">
              Manage URLs and keys for site images, videos, and documents.
            </p>
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">
            <Plus className="size-4" />
            Add Asset
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="admin-input"
            placeholder="asset_key (hero_background)"
            value={form.asset_key}
            onChange={(event) => setForm({ ...form, asset_key: event.target.value })}
            required
          />
          <input
            className="admin-input"
            placeholder="Label"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
            required
          />
          <input
            className="admin-input md:col-span-2"
            placeholder="Asset URL"
            value={form.asset_url}
            onChange={(event) => setForm({ ...form, asset_url: event.target.value })}
            required
          />
          <textarea
            className="admin-textarea md:col-span-2 !min-h-[90px]"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
      </form>

      {error ? <p className="admin-error rounded-xl px-3 py-2 text-sm">{error}</p> : null}

      <div className="ct-panel overflow-hidden admin-table-wrap">
        <table className="admin-table admin-table-executive">
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>URL</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.asset_key}</td>
                <td>
                  <input
                    className="admin-input"
                    defaultValue={asset.label}
                    onBlur={(event) =>
                      void handleUpdate(asset, "label", event.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="admin-input"
                    defaultValue={asset.asset_url}
                    onBlur={(event) =>
                      void handleUpdate(asset, "asset_url", event.target.value)
                    }
                  />
                </td>
                <td>{asset.asset_type}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => void handleDelete(asset.id)}
                    className="admin-btn admin-btn-danger !px-3 !py-2"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
