"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogListItem, type BlogListItemData } from "./BlogListItem";
import { BlogSidebar } from "./BlogSidebar";
import "./blog.css";

const PAGE_SIZE = 6;

export function BlogListing({
  blogs,
  recentPosts,
}: {
  blogs: BlogListItemData[];
  recentPosts: BlogListItemData[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(q) ||
        (blog.blog_meta_description || "").toLowerCase().includes(q) ||
        (blog.author_name || "").toLowerCase().includes(q),
    );
  }, [blogs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function goToPage(nextPage: number) {
    const safe = Math.min(Math.max(1, nextPage), totalPages);
    router.push(safe <= 1 ? "/blog" : `/blog?page=${safe}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="ct-blog-page">
      <header className="ct-blog-banner">
        <div className="ct-blog-banner-inner">
          <nav className="ct-blog-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span>Blog</span>
          </nav>
          <h1 className="ct-blog-banner-title">Contenaissance Blog</h1>
          {/* <p className="ct-blog-banner-sub">
            Insights, product updates, and AI storytelling — curated for builders
            and teams exploring the future of intelligent content.
          </p> */}
        </div>
      </header>

      <div className="ct-blog-shell">
        <h2 className="ct-blog-section-title">Latest Articles</h2>

        <div className="ct-blog-layout">
          <div>
            {pageItems.length === 0 ? (
              <div className="ct-blog-empty">
                {searchQuery
                  ? "No posts match your search."
                  : "No published posts yet. Check back soon."}
              </div>
            ) : (
              pageItems.map((blog) => <BlogListItem key={blog.slug} blog={blog} />)
            )}

            {totalPages > 1 ? (
              <nav className="ct-blog-pagination" aria-label="Blog pagination">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`ct-blog-page-btn ${pageNumber === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </nav>
            ) : null}
          </div>

          <div className="ct-blog-sidebar-sticky">
            <BlogSidebar
              recentPosts={recentPosts.map((post) => ({
                slug: post.slug,
                title: post.title,
                published_at: post.published_at,
              }))}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
