"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiGet, apiSend } from "@/lib/admin-client";
import type { BlogWithAuthor } from "@/types/admin";

export function BlogsManager() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBlogs() {
    setLoading(true);
    setError("");

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

  async function handleDelete(id: number) {
    if (!confirm("Delete this blog post?")) return;

    try {
      await apiSend(`/api/blogs/${id}`, "DELETE");
      setBlogs((current) => current.filter((blog) => blog.id !== id));
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="admin-card flex items-center justify-center p-10 text-[var(--admin-muted)]">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading blogs...
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between border-b admin-divider px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold">All Blog Posts</h3>
          <p className="text-sm text-[var(--admin-muted)]">
            Published posts appear automatically on the public blog page.
          </p>
        </div>
        <Link href="/admin/dashboard/blogs/new" className="admin-btn admin-btn-primary">
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      {error ? (
        <p className="admin-error mx-6 my-4 rounded-xl px-3 py-2 text-sm">{error}</p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-[var(--admin-muted)]">
                  No blog posts yet. Create your first post.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-xs text-[var(--admin-muted)]">/{blog.slug}</p>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        blog.status === "published"
                          ? "admin-badge-green"
                          : "admin-badge-gray"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td>{blog.author_name ?? "—"}</td>
                  <td>{new Date(blog.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/dashboard/blogs/${blog.id}/edit`}
                        className="admin-btn admin-btn-secondary !px-3 !py-2"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(blog.id)}
                        className="admin-btn admin-btn-danger !px-3 !py-2"
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
    </div>
  );
}
