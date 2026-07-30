"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { formatBlogListDate } from "@/lib/blog-utils";

export type BlogSidebarPost = {
  slug: string;
  title: string;
  published_at: Date | string | null;
};

export function BlogSidebar({
  recentPosts,
  searchQuery = "",
  onSearchChange,
  showSearch = true,
  title = "Recent Posts",
}: {
  recentPosts: BlogSidebarPost[];
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  title?: string;
}) {
  return (
    <aside className="ct-blog-sidebar">
      {showSearch && onSearchChange ? (
        <div className="ct-blog-search">
          <Search className="ct-blog-search-icon size-4" />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search blog posts"
          />
        </div>
      ) : null}

      <h3 className="ct-blog-sidebar-title">{title}</h3>
      <ul className="ct-blog-recent-list">
        {recentPosts.length === 0 ? (
          <li className="ct-blog-recent-item" style={{ color: "var(--blog-muted)", fontSize: "0.875rem" }}>
            No posts yet.
          </li>
        ) : (
          recentPosts.map((post) => (
            <li key={post.slug} className="ct-blog-recent-item">
              <Link href={`/blog/${post.slug}`} className="ct-blog-recent-link">
                <span className="ct-blog-recent-title">{post.title}</span>
                {post.published_at ? (
                  <span className="ct-blog-recent-date">
                    {formatBlogListDate(post.published_at)}
                  </span>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
