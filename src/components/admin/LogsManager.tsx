"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, ScrollText } from "lucide-react";
import { apiGet } from "@/lib/admin-client";
import type { AuditAction, AuditLog, AuditLogsResponse } from "@/types/admin";

const ACTION_OPTIONS: { value: "" | AuditAction; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "login_failed", label: "Login failed" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "publish", label: "Publish" },
  { value: "status_change", label: "Status change" },
];

const RESOURCE_OPTIONS = [
  { value: "", label: "All resources" },
  { value: "session", label: "Session" },
  { value: "user", label: "User" },
  { value: "blog", label: "Blog" },
  { value: "asset", label: "Asset" },
];

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function actionLabel(action: AuditAction) {
  return ACTION_OPTIONS.find((item) => item.value === action)?.label ?? action;
}

function actionBadgeClass(action: AuditAction) {
  if (action === "login") return "admin-log-badge admin-log-badge--success";
  if (action === "logout") return "admin-log-badge admin-log-badge--muted";
  if (action === "login_failed") return "admin-log-badge admin-log-badge--danger";
  if (action === "delete") return "admin-log-badge admin-log-badge--danger";
  if (action === "create") return "admin-log-badge admin-log-badge--info";
  if (action === "publish") return "admin-log-badge admin-log-badge--success";
  return "admin-log-badge admin-log-badge--warning";
}

function describeLog(log: AuditLog) {
  const user = log.user_name || log.user_email || "Unknown user";
  const target = log.resource_label ? `"${log.resource_label}"` : "";
  const resource = log.resource_type ? log.resource_type : "item";

  switch (log.action) {
    case "login":
      return `${user} logged in`;
    case "logout":
      return `${user} logged out`;
    case "login_failed":
      return `Failed login attempt${log.user_email ? ` for ${log.user_email}` : ""}`;
    case "create":
      return `${user} created ${resource}${target ? ` ${target}` : ""}`;
    case "update":
      return `${user} updated ${resource}${target ? ` ${target}` : ""}`;
    case "delete":
      return `${user} deleted ${resource}${target ? ` ${target}` : ""}`;
    case "publish":
      return `${user} published ${resource}${target ? ` ${target}` : ""}`;
    case "status_change":
      return `${user} changed status for ${resource}${target ? ` ${target}` : ""}`;
    default:
      return `${user} performed ${log.action}`;
  }
}

function detailsSummary(details: Record<string, unknown> | null) {
  if (!details) return null;

  const parts: string[] = [];

  if (typeof details.from_status === "string" && typeof details.to_status === "string") {
    parts.push(`${details.from_status} → ${details.to_status}`);
  }

  if (Array.isArray(details.changed_fields) && details.changed_fields.length > 0) {
    parts.push(`Fields: ${details.changed_fields.join(", ")}`);
  }

  if (typeof details.email === "string") {
    parts.push(details.email);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function LogsManager() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<"" | AuditAction>("");
  const [resourceType, setResourceType] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
      });

      if (action) params.set("action", action);
      if (resourceType) params.set("resource_type", resourceType);
      if (search) params.set("search", search);

      const response = await apiGet<AuditLogsResponse>(`/api/admin-logs?${params.toString()}`);
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [action, page, resourceType, search]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const stats = useMemo(() => {
    const logs = data?.logs ?? [];
    const logins = logs.filter((log) => log.action === "login").length;
    const updates = logs.filter((log) =>
      ["create", "update", "delete", "publish", "status_change"].includes(log.action),
    ).length;

    return {
      total: data?.total ?? 0,
      pageCount: data?.totalPages ?? 1,
      logins,
      updates,
    };
  }, [data]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  if (loading && !data) {
    return (
      <div className="ct-panel admin-empty-state">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading admin logs...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="admin-filter-grid">
        <div className="admin-filter-card admin-filter-card-v2 active">
          <span className="admin-filter-label flex items-center gap-2">
            <ScrollText className="size-3.5" />
            Total entries
          </span>
          <span className="admin-filter-value">{stats.total}</span>
        </div>
        <div className="admin-filter-card admin-filter-card-v2">
          <span className="admin-filter-label">Logins (this page)</span>
          <span className="admin-filter-value">{stats.logins}</span>
        </div>
        <div className="admin-filter-card admin-filter-card-v2">
          <span className="admin-filter-label">Changes (this page)</span>
          <span className="admin-filter-value">{stats.updates}</span>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="ct-panel admin-logs-filters">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by user or resource..."
            className="admin-input"
          />
          <select
            value={action}
            onChange={(event) => {
              setPage(1);
              setAction(event.target.value as "" | AuditAction);
            }}
            className="admin-input"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={resourceType}
            onChange={(event) => {
              setPage(1);
              setResourceType(event.target.value);
            }}
            className="admin-input"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="admin-btn admin-btn-primary">
            Search
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => void loadLogs()}
            aria-label="Refresh logs"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </form>

      {error ? <p className="admin-error rounded-xl px-3 py-2 text-sm">{error}</p> : null}

      <div className="ct-panel overflow-hidden admin-table-wrap">
        {!data || data.logs.length === 0 ? (
          <div className="admin-empty-state">No log entries found.</div>
        ) : (
          <table className="admin-table admin-table-executive admin-logs-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Activity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log) => {
                const detailText = detailsSummary(log.details);
                return (
                  <tr key={log.id}>
                    <td className="admin-log-date whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td>
                      <div className="admin-log-user">
                        <p className="font-medium">{log.user_name || "—"}</p>
                        {log.user_email ? (
                          <p className="text-xs text-[var(--admin-muted)]">{log.user_email}</p>
                        ) : null}
                        {log.user_role ? (
                          <span className="admin-log-user-role">{log.user_role}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className={actionBadgeClass(log.action)}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td>{describeLog(log)}</td>
                    <td className="admin-log-details text-sm text-[var(--admin-muted)]">
                      {detailText || log.ip_address || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
          <Loader2 className="size-4 animate-spin" />
          Refreshing...
        </div>
      ) : null}

      {data && data.totalPages > 1 ? (
        <div className="admin-logs-pagination">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="text-sm text-[var(--admin-muted)]">
            Page {page} of {stats.pageCount}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={page >= stats.pageCount || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
