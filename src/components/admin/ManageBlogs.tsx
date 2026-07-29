"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Eye,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/admin-client";
import {
  BLOG_AUTHORS,
  BLOG_STATUS,
  BLOG_STATUS_FILTERS,
  buildScheduledIso,
  countBlogs,
  filterBlogs,
  formatBlogDate,
  getBlogRowClassName,
  getBlogStatusLabel,
  parseScheduledFields,
} from "@/lib/blog-utils";
import type { BlogWithAuthor } from "@/types/admin";
import { BlogImageUpload } from "./BlogImageUpload";
import { BlogPreviewModal } from "./BlogPreviewModal";
import { JoditBlogEditor } from "./JoditBlogEditor";

type PublishMode = "publish" | "draft" | "schedule";

const emptyForm = {
  title: "",
  slug: "",
  blog_keywords: "",
  blog_meta_description: "",
  cover_image: "",
  author_name: BLOG_AUTHORS[0],
};

export function ManageBlogs() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<BlogWithAuthor | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState("");
  const [publishMode, setPublishMode] = useState<PublishMode>("publish");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleHour, setScheduleHour] = useState("9");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [scheduleAmPm, setScheduleAmPm] = useState<"AM" | "PM">("AM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogWithAuthor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const blogCounts = useMemo(() => countBlogs(blogs), [blogs]);
  const filteredBlogs = useMemo(() => {
    const byStatus = filterBlogs(blogs, statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(
      (blog) =>
        blog.title.toLowerCase().includes(q) ||
        blog.slug.toLowerCase().includes(q) ||
        (blog.author_name || "").toLowerCase().includes(q),
    );
  }, [blogs, statusFilter, searchQuery]);

  async function loadBlogs() {
    setLoading(true);
    try {
      const data = await apiGet<BlogWithAuthor[]>("/api/blogs");
      setBlogs(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBlogs();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setContent("");
    setPublishMode("publish");
    setScheduleDate("");
    setScheduleHour("9");
    setScheduleMinute("00");
    setScheduleAmPm("AM");
    setError("");
    setShowModal(true);
  }

  function openEditModal(blog: BlogWithAuthor) {
    const schedule = parseScheduledFields(blog.scheduled_publish_at);
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      blog_keywords: blog.blog_keywords || "",
      blog_meta_description: blog.blog_meta_description || blog.excerpt || "",
      cover_image: blog.cover_image || "",
      author_name: blog.author_name || BLOG_AUTHORS[0],
    });
    setContent(blog.content);
    setPublishMode(
      blog.status === "scheduled"
        ? "schedule"
        : blog.status === "draft"
          ? "draft"
          : "publish",
    );
    setScheduleDate(schedule.scheduleDate);
    setScheduleHour(schedule.scheduleHour);
    setScheduleMinute(schedule.scheduleMinute);
    setScheduleAmPm(schedule.scheduleAmPm);
    setError("");
    setShowModal(true);
  }

  function validateForm(mode: PublishMode) {
    const errors: string[] = [];
    if (!form.title.trim()) errors.push("Meta title is required");
    if (!form.slug.trim()) errors.push("Slug URL is required");
    if (!content.trim()) errors.push("Blog content is required");

    if (mode !== "draft") {
      if (!form.blog_keywords.trim()) errors.push("Blog keywords are required");
      if (!form.blog_meta_description.trim()) errors.push("Meta description is required");
      if (!form.author_name.trim()) errors.push("Author name is required");
    }

    if (mode === "schedule") {
      const scheduled = buildScheduledIso(
        scheduleDate,
        scheduleHour,
        scheduleMinute,
        scheduleAmPm,
      );
      if (scheduled === null) errors.push("Scheduled time must be in the future");
      if (scheduled === "") errors.push("Schedule date and time are required");
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = validateForm(publishMode);
    if (errors.length) {
      setError(errors.join(". "));
      return;
    }

    let status: BlogWithAuthor["status"] = "draft";
    let scheduled_publish_at: string | null = null;

    if (publishMode === "publish") status = "published";
    if (publishMode === "schedule") {
      status = "scheduled";
      scheduled_publish_at = buildScheduledIso(
        scheduleDate,
        scheduleHour,
        scheduleMinute,
        scheduleAmPm,
      );
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        content,
        status,
        scheduled_publish_at,
      };

      if (editingId) {
        await apiSend(`/api/blogs/${editingId}`, "PUT", payload);
      } else {
        await apiSend("/api/blogs", "POST", payload);
      }

      setShowModal(false);
      await loadBlogs();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublishNow(blog: BlogWithAuthor) {
    try {
      await apiSend(`/api/blogs/${blog.id}/publish`, "POST");
      await loadBlogs();
      router.refresh();
    } catch (publishError) {
      alert(publishError instanceof Error ? publishError.message : "Publish failed");
    }
  }

  async function handleToggleStatus(blog: BlogWithAuthor) {
    const nextStatus =
      blog.status === "published" ? BLOG_STATUS.INACTIVE : BLOG_STATUS.PUBLISHED;

    try {
      await apiSend(`/api/blogs/${blog.id}/status`, "POST", { status: nextStatus });
      await loadBlogs();
      router.refresh();
    } catch (toggleError) {
      alert(toggleError instanceof Error ? toggleError.message : "Status update failed");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await apiSend(`/api/blogs/${deleteTarget.id}`, "DELETE");
      setDeleteTarget(null);
      await loadBlogs();
      router.refresh();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="ct-panel admin-empty-state">
        <Loader2 className="size-5 animate-spin" />
        Loading blogs...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="admin-toolbar ct-panel">
        <div>
          <p className="admin-toolbar-eyebrow">Blog Management</p>
          <h3 className="admin-toolbar-title">Manage Blogs</h3>
          <p className="admin-toolbar-copy">
            Create, schedule, publish, and preview blog posts — same workflow as MPF admin.
          </p>
        </div>
        <button type="button" onClick={openCreateModal} className="admin-btn admin-btn-primary">
          <Plus className="size-4" />
          Add New Blog
        </button>
      </div>

      <div className="admin-filter-grid">
        {BLOG_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`admin-filter-card admin-filter-card-v2 ${statusFilter === filter.id ? "active" : ""}`}
          >
            <span className="admin-filter-label">{filter.label}</span>
            <span className="admin-filter-value">
              {blogCounts[filter.id as keyof typeof blogCounts] ?? blogCounts.all}
            </span>
          </button>
        ))}
      </div>

      <div className="ct-panel admin-blogs-toolbar">
        <div className="admin-blogs-search">
          <Search className="size-4 text-[var(--admin-muted)]" />
          <input
            type="search"
            placeholder="Search by title, slug, or author..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <p className="admin-blogs-count">
          Showing <strong>{filteredBlogs.length}</strong> of {blogs.length} posts
        </p>
      </div>

      {error && !showModal ? (
        <p className="admin-error rounded-xl px-4 py-3 text-sm">{error}</p>
      ) : null}

      <div className="ct-panel overflow-hidden p-0 admin-table-wrap admin-blogs-table-panel">
        <table className="admin-table admin-table-executive admin-blogs-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Status</th>
              <th>Author</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty-cell">
                  No blogs in this filter. Create your first post.
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className={getBlogRowClassName(blog.status)}>
                  <td>
                    <div className="admin-blog-post-cell">
                      <div className="admin-blog-thumb">
                        {blog.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={blog.cover_image} alt="" />
                        ) : (
                          <span>CT</span>
                        )}
                      </div>
                      <div>
                        <p className="admin-blog-title">{blog.title}</p>
                        <p className="admin-blog-slug">/blog/{blog.slug}</p>
                        {blog.status === "published" ? (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-blog-live-link"
                          >
                            View live <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status-pill admin-status-${blog.status}`}>
                      {getBlogStatusLabel(blog.status)}
                    </span>
                    {blog.status === "scheduled" && blog.scheduled_publish_at ? (
                      <p className="admin-blog-schedule-hint">
                        <Calendar className="size-3 inline" />{" "}
                        {formatBlogDate(blog.scheduled_publish_at)}
                      </p>
                    ) : null}
                  </td>
                  <td>{blog.author_name || "—"}</td>
                  <td>{formatBlogDate(blog.updated_at)}</td>
                  <td>
                    <div className="admin-row-actions admin-row-actions-labeled">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Preview"
                        onClick={() => setPreviewBlog(blog)}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Edit"
                        onClick={() => openEditModal(blog)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      {(blog.status === "draft" || blog.status === "scheduled") && (
                        <button
                          type="button"
                          className="admin-icon-btn"
                          title="Publish now"
                          onClick={() => void handlePublishNow(blog)}
                        >
                          <Rocket className="size-4" />
                        </button>
                      )}
                      {blog.status === "published" || blog.status === "inactive" ? (
                        <button
                          type="button"
                          className="admin-action-chip"
                          title="Toggle active"
                          onClick={() => void handleToggleStatus(blog)}
                        >
                          {blog.status === "published" ? "Hide" : "Show"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn-danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(blog)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal-xl">
            <div className="admin-modal-header">
              <div>
                <p className="admin-toolbar-eyebrow">
                  {editingId ? "Edit Blog Post" : "Create Blog Post"}
                </p>
                <h3 className="admin-toolbar-title">
                  {editingId ? "Update publication" : "New blog publication"}
                </h3>
              </div>
              <button type="button" className="admin-icon-btn" onClick={() => setShowModal(false)}>
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-body space-y-5">
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Meta Title *</span>
                  <input
                    className="admin-input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Slug URL *</span>
                  <input
                    className="admin-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Blog Keywords</span>
                  <input
                    className="admin-input"
                    value={form.blog_keywords}
                    onChange={(e) => setForm({ ...form, blog_keywords: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Author</span>
                  <select
                    className="admin-select"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  >
                    {BLOG_AUTHORS.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field admin-field-full">
                  <span>Meta Description</span>
                  <textarea
                    className="admin-textarea !min-h-[90px]"
                    value={form.blog_meta_description}
                    onChange={(e) =>
                      setForm({ ...form, blog_meta_description: e.target.value })
                    }
                  />
                </label>
                <label className="admin-field admin-field-full">
                  <span>Featured Image</span>
                  <BlogImageUpload
                    value={form.cover_image}
                    onChange={(cover_image) => setForm({ ...form, cover_image })}
                  />
                </label>
              </div>

              <label className="admin-field admin-field-full">
                <span>Blog Content *</span>
                <JoditBlogEditor value={content} onChange={setContent} />
              </label>

              <div className="admin-publication-panel">
                <p className="admin-publication-title">Publication</p>
                <div className="admin-publication-options">
                  {(["publish", "draft", "schedule"] as PublishMode[]).map((mode) => (
                    <label key={mode} className="admin-radio-card">
                      <input
                        type="radio"
                        name="publishMode"
                        checked={publishMode === mode}
                        onChange={() => setPublishMode(mode)}
                      />
                      <span>
                        {mode === "publish"
                          ? "Publish now"
                          : mode === "draft"
                            ? "Save as draft"
                            : "Schedule post"}
                      </span>
                    </label>
                  ))}
                </div>

                {publishMode === "schedule" ? (
                  <div className="admin-schedule-grid">
                    <label className="admin-field">
                      <span>Date</span>
                      <input
                        type="date"
                        className="admin-input"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Hour</span>
                      <select
                        className="admin-select"
                        value={scheduleHour}
                        onChange={(e) => setScheduleHour(e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <option key={hour} value={String(hour)}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-field">
                      <span>Minute</span>
                      <select
                        className="admin-select"
                        value={scheduleMinute}
                        onChange={(e) => setScheduleMinute(e.target.value)}
                      >
                        {["00", "15", "30", "45"].map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-field">
                      <span>AM/PM</span>
                      <select
                        className="admin-select"
                        value={scheduleAmPm}
                        onChange={(e) => setScheduleAmPm(e.target.value as "AM" | "PM")}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>

              {error ? <p className="admin-error rounded-xl px-3 py-2 text-sm">{error}</p> : null}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {editingId ? "Update Blog" : "Save Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {previewBlog ? (
        <BlogPreviewModal blog={previewBlog} onClose={() => setPreviewBlog(null)} />
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h3 className="admin-toolbar-title">Delete blog?</h3>
            </div>
            <p className="px-6 text-sm text-[var(--admin-muted)]">
              This will permanently delete &quot;{deleteTarget.title}&quot;.
            </p>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => void handleDelete()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
