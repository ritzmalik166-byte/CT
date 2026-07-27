"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiSend } from "@/lib/admin-client";
import type { BlogStatus, BlogWithAuthor } from "@/types/admin";

interface BlogEditorProps {
  blog?: BlogWithAuthor;
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(blog?.title ?? "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [content, setContent] = useState(blog?.content ?? "");
  const [coverImage, setCoverImage] = useState(blog?.cover_image ?? "");
  const [status, setStatus] = useState<BlogStatus>(blog?.status ?? "draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        excerpt,
        content,
        cover_image: coverImage,
        status,
      };

      if (blog) {
        await apiSend(`/api/blogs/${blog.id}`, "PUT", payload);
      } else {
        await apiSend("/api/blogs", "POST", payload);
      }

      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save blog",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm text-[var(--admin-muted)]">Title</span>
          <input
            className="admin-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm text-[var(--admin-muted)]">Excerpt</span>
          <textarea
            className="admin-textarea !min-h-[90px]"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
          />
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm text-[var(--admin-muted)]">Content</span>
          <textarea
            className="admin-textarea !min-h-[280px]"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[var(--admin-muted)]">Cover image URL</span>
          <input
            className="admin-input"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[var(--admin-muted)]">Status</span>
          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value as BlogStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      {error ? (
        <p className="admin-error rounded-xl px-3 py-2 text-sm">{error}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {blog ? "Update Post" : "Create Post"}
        </button>
      </div>
    </form>
  );
}
