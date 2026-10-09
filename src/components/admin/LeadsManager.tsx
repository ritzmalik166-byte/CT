"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/admin-client";
import type {
  Lead,
  LeadNote,
  LeadsResponse,
  LeadStatus,
  LeadType,
  SessionUser,
} from "@/types/admin";

interface LeadsManagerProps {
  currentUser: SessionUser;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  Pending: { label: "Pending", badgeClass: "admin-badge-gold", icon: Clock },
  Contacted: { label: "Contacted", badgeClass: "admin-badge-blue", icon: Mail },
  Qualified: { label: "Qualified", badgeClass: "admin-badge-purple", icon: CheckCircle2 },
  Converted: { label: "Converted", badgeClass: "admin-badge-green", icon: UserCheck },
  Lost: { label: "Lost", badgeClass: "admin-badge-gray", icon: UserX },
};

function formatDate(dateInput: Date | string) {
  if (!dateInput) return "—";
  try {
    let raw = String(dateInput);
    if (!raw.includes("Z") && !raw.includes("+") && raw.includes(" ")) {
      raw = raw.replace(" ", "T") + "Z";
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

export function LeadsManager({ currentUser }: LeadsManagerProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Selected Lead Modal & Notes
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusInput, setStatusInput] = useState<LeadStatus>("Pending");
  const [noteInput, setNoteInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadLeads(targetPage = pagination.page) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(pagination.limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await apiGet<LeadsResponse>(`/api/leads?${params.toString()}`);
      setLeads(res.leads);
      setPagination(res.pagination);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void loadLeads(1);
  }

  async function openLeadDetails(lead: Lead) {
    setSelectedLead(lead);
    setStatusInput(lead.status);
    setNoteInput("");
    setActionError("");
    setLoadingDetails(true);

    try {
      const res = await apiGet<{ lead: Lead; notes: LeadNote[] }>(
        `/api/leads/${lead.id}`,
      );
      setSelectedLead(res.lead);
      setNotes(res.notes);
      setStatusInput(res.lead.status);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to fetch lead details",
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeLeadDetails() {
    setSelectedLead(null);
    setNotes([]);
    setNoteInput("");
    setActionError("");
  }

  async function handleUpdateLead(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;

    setUpdating(true);
    setActionError("");

    try {
      const payload: { status?: LeadStatus; note?: string } = {};
      if (statusInput !== selectedLead.status) {
        payload.status = statusInput;
      }
      if (noteInput.trim()) {
        payload.note = noteInput.trim();
      }

      if (!payload.status && !payload.note) {
        setUpdating(false);
        return;
      }

      const res = await apiSend<{ lead: Lead; notes: LeadNote[] }>(
        `/api/leads/${selectedLead.id}`,
        "PUT",
        payload,
      );

      setSelectedLead(res.lead);
      setNotes(res.notes);
      setStatusInput(res.lead.status);
      setNoteInput("");
      await loadLeads(pagination.page);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update lead",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteLead() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await apiSend(`/api/leads/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      if (selectedLead?.id === deleteTarget.id) {
        closeLeadDetails();
      }
      await loadLeads(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div
          onClick={() => setStatusFilter("all")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "all" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label">Total Leads</p>
          <p className="ct-stat-value text-white">{stats.totalLeads}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Pending")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "Pending" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label text-amber-400">Pending</p>
          <p className="ct-stat-value text-amber-400">{stats.pendingLeads}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Contacted")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "Contacted" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label text-sky-400">Contacted</p>
          <p className="ct-stat-value text-sky-400">{stats.contactedLeads}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Qualified")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "Qualified" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label text-purple-400">Qualified</p>
          <p className="ct-stat-value text-purple-400">{stats.qualifiedLeads}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Converted")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "Converted" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label text-emerald-400">Converted</p>
          <p className="ct-stat-value text-emerald-400">{stats.convertedLeads}</p>
        </div>

        <div
          onClick={() => setStatusFilter("Lost")}
          className={`ct-stat-card cursor-pointer transition-all ${
            statusFilter === "Lost" ? "border-[var(--admin-gold)] shadow-md" : ""
          }`}
        >
          <p className="ct-stat-label text-slate-400">Lost</p>
          <p className="ct-stat-value text-slate-400">{stats.lostLeads}</p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="ct-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              type="text"
              className="admin-input !pl-9"
              placeholder="Search by name, email, phone, service or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-secondary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
            <Filter className="size-4" />
            <span>Status:</span>
            <select
              className="admin-select !w-auto !py-1.5 text-xs font-medium cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all" className="bg-[#161619] text-white">All Statuses</option>
              <option value="Pending" className="bg-[#161619] text-amber-400">Pending</option>
              <option value="Contacted" className="bg-[#161619] text-sky-400">Contacted</option>
              <option value="Qualified" className="bg-[#161619] text-purple-400">Qualified</option>
              <option value="Converted" className="bg-[#161619] text-emerald-400">Converted</option>
              <option value="Lost" className="bg-[#161619] text-slate-400">Lost</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
            <span>Type:</span>
            <select
              className="admin-select !w-auto !py-1.5 text-xs font-medium cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all" className="bg-[#161619] text-white">All Types</option>
              <option value="contact" className="bg-[#161619] text-white">Contact Page</option>
              <option value="footer" className="bg-[#161619] text-white">Footer Newsletter</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadLeads(pagination.page)}
            className="admin-btn admin-btn-secondary !px-3 !py-2"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? <p className="admin-error rounded-xl px-4 py-3 text-sm">{error}</p> : null}

      {/* Table wrapping */}
      <div className="ct-panel overflow-hidden admin-table-wrap">
        <table className="admin-table admin-table-executive">
          <thead>
            <tr>
              <th>Lead Info</th>
              <th>Type</th>
              <th>Phone & Service</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[var(--admin-muted)]">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[var(--admin-muted)]">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.Pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={lead.id}>
                    <td>
                      <p className="font-semibold text-white">
                        {lead.full_name || "— (No Name)"}
                      </p>
                      <p className="text-xs text-[var(--admin-muted)]">{lead.email}</p>
                    </td>

                    <td>
                      <span
                        className={`admin-badge ${
                          lead.type === "contact"
                            ? "admin-badge-purple"
                            : "admin-badge-gray"
                        }`}
                      >
                        {lead.type === "contact" ? "Contact Form" : "Footer Form"}
                      </span>
                    </td>

                    <td>
                      <p className="text-xs text-white">
                        {lead.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-[var(--admin-gold)]" />
                            {lead.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </p>
                      {lead.service ? (
                        <p className="text-xs text-[var(--admin-muted)]">{lead.service}</p>
                      ) : null}
                    </td>

                    <td>
                      <span className={`admin-badge ${statusInfo.badgeClass}`}>
                        <StatusIcon className="mr-1 inline size-3" />
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="text-xs text-[var(--admin-muted)]">
                      {formatDate(lead.created_at)}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openLeadDetails(lead)}
                          className="admin-btn admin-btn-secondary !px-3 !py-1.5 text-xs"
                        >
                          Details & Notes
                        </button>

                        {currentUser.role === "superadmin" ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lead)}
                            className="admin-btn admin-btn-danger !px-2.5 !py-1.5"
                            title="Delete Lead"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--admin-border)] px-4 py-3 sm:flex-row">
          <p className="text-xs text-[var(--admin-muted)]">
            Showing Page <span className="font-semibold text-white">{pagination.page}</span> of{" "}
            <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total leads)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => loadLeads(pagination.page - 1)}
              className="admin-btn admin-btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => loadLeads(pagination.page + 1)}
              className="admin-btn admin-btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details & Status & Notes Modal */}
      {selectedLead ? (
        <div className="admin-modal-backdrop p-3 sm:p-4">
          <div className="admin-modal admin-modal-md max-w-xl w-full mx-auto my-auto max-h-[88vh] flex flex-col shadow-2xl">
            <div className="admin-modal-header shrink-0 border-b border-[var(--admin-border)]">
              <div>
                <p className="admin-toolbar-eyebrow">Lead Details #{selectedLead.id}</p>
                <h3 className="admin-toolbar-title text-base sm:text-lg">
                  {selectedLead.full_name || selectedLead.email}
                </h3>
              </div>
              <button type="button" className="admin-icon-btn" onClick={closeLeadDetails}>
                <X className="size-4" />
              </button>
            </div>

            <div className="admin-modal-body overflow-y-auto space-y-6 flex-1 p-4 sm:p-6">
              {loadingDetails ? (
                <p className="py-8 text-center text-sm text-[var(--admin-muted)]">
                  Loading lead details...
                </p>
              ) : (
                <>
                  {/* Info grid */}
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-[var(--admin-border)] bg-white/5 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Full Name
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {selectedLead.full_name || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Email Address
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        <a
                          href={`mailto:${selectedLead.email}`}
                          className="hover:underline text-[var(--admin-gold)]"
                        >
                          {selectedLead.email}
                        </a>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Phone Number
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {selectedLead.phone ? (
                          <a
                            href={`tel:${selectedLead.phone}`}
                            className="hover:underline text-[var(--admin-gold)]"
                          >
                            {selectedLead.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Requested Service
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {selectedLead.service || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Source / Page
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--admin-text)]">
                        {selectedLead.source || selectedLead.type}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                        Date Received
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--admin-text)] font-medium">
                        {formatDate(selectedLead.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Message body */}
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                      Full Message
                    </p>
                    <div className="whitespace-pre-wrap rounded-xl border border-[var(--admin-border)] bg-black/40 p-4 text-sm text-[var(--admin-text)]">
                      {selectedLead.message || "No message content provided."}
                    </div>
                  </div>

                  {/* Status & Add Note Form */}
                  <form onSubmit={handleUpdateLead} className="space-y-4 rounded-xl border border-[var(--admin-border)] p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-gold)]">
                      Update Lead Status & Add Follow-Up Note
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-[var(--admin-muted)]">
                          Lead Status
                        </label>
                        <select
                          className="admin-select text-xs font-medium cursor-pointer"
                          value={statusInput}
                          onChange={(e) => setStatusInput(e.target.value as LeadStatus)}
                        >
                          <option value="Pending" className="bg-[#161619] text-amber-400">Pending</option>
                          <option value="Contacted" className="bg-[#161619] text-sky-400">Contacted</option>
                          <option value="Qualified" className="bg-[#161619] text-purple-400">Qualified</option>
                          <option value="Converted" className="bg-[#161619] text-emerald-400">Converted</option>
                          <option value="Lost" className="bg-[#161619] text-slate-400">Lost</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[var(--admin-muted)]">
                          Follow-up Note (Optional)
                        </label>
                        <input
                          type="text"
                          className="admin-input text-xs"
                          placeholder="e.g. Spoke over phone, scheduled demo..."
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                        />
                      </div>
                    </div>

                    {actionError ? (
                      <p className="admin-error rounded-xl px-3 py-2 text-xs">{actionError}</p>
                    ) : null}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={updating}
                        className="admin-btn admin-btn-primary"
                      >
                        {updating ? "Saving..." : "Save Updates"}
                      </button>
                    </div>
                  </form>

                  {/* Follow-up Notes Timeline */}
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Follow-up Notes History ({notes.length})
                    </h4>

                    {notes.length === 0 ? (
                      <p className="text-xs italic text-[var(--admin-muted)]">
                        No follow-up notes recorded yet for this lead.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((n) => (
                          <div
                            key={n.id}
                            className="rounded-xl border border-[var(--admin-border)] bg-white/5 p-3 text-xs"
                          >
                            <div className="mb-1 flex items-center justify-between text-[var(--admin-muted)]">
                              <span className="font-semibold text-white">
                                {n.author_name}
                              </span>
                              <span>{formatDate(n.created_at)}</span>
                            </div>
                            <p className="text-[var(--admin-text)]">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteTarget ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <p className="admin-toolbar-eyebrow">Confirm Delete</p>
                <h3 className="admin-toolbar-title">Delete Lead</h3>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setDeleteTarget(null)}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="admin-modal-body space-y-4">
              <p className="text-sm text-[var(--admin-text)]">
                Are you sure you want to permanently delete lead for{" "}
                <span className="font-semibold text-white">
                  {deleteTarget.full_name || deleteTarget.email}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteLead}
                  className="admin-btn admin-btn-danger"
                >
                  {deleting ? "Deleting..." : "Delete Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
