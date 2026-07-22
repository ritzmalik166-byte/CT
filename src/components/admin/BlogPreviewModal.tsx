"use client";

import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import {
  formatBlogDate,
  getBlogStatusLabel,
  readingTime,
} from "@/lib/blog-utils";
import type { BlogWithAuthor } from "@/types/admin";
import { BlogContentBody } from "@/components/blog/BlogContentBody";
import "@/components/blog/blog.css";

export function BlogPreviewModal({
  blog,
  onClose,
}: {
  blog: BlogWithAuthor;
  onClose: () => void;
}) {
  const mins = readingTime(blog.content);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div className="admin-preview-backdrop">
      <div className="admin-preview-panel admin-preview-panel-wide">
        <div className="admin-preview-toolbar">
          <div>
            <span className={`admin-status-pill admin-status-${blog.status}`}>
              {getBlogStatusLabel(blog.status)}
            </span>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">
              Admin preview — matches live blog layout
            </p>
          </div>
          <div className="flex items-center gap-2">
            {blog.status === "published" ? (
              <a
                href={`/blog/${blog.slug}`}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-secondary"
              >
                <ExternalLink className="size-4" />
                View live
              </a>
            ) : null}
            <button type="button" className="admin-icon-btn" onClick={onClose}>
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="admin-preview-content admin-preview-content-blog">
          {blog.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blog.cover_image} alt={blog.title} className="admin-preview-hero" />
          ) : null}

          <p className="text-xs tracking-[0.18em] text-[var(--admin-muted)] uppercase">
            {formatBlogDate(blog.published_at || blog.scheduled_publish_at || blog.created_at)}
            {blog.author_name ? ` · ${blog.author_name}` : ""}
            {` · ${mins} min read`}
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-[var(--admin-text)]">{blog.title}</h1>

          {blog.blog_meta_description ? (
            <p className="mt-3 text-[var(--admin-muted)]">{blog.blog_meta_description}</p>
          ) : null}

          <div className="admin-preview-body admin-preview-body-blog">
            <BlogContentBody html={blog.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
