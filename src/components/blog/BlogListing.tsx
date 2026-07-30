"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CTAFooter } from "@/components/home/CTAFooter";
import { HamburgerMenu } from "@/components/home/HamburgerMenu";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <Link
        href="/"
        title="Home"
        onClick={() => setMenuOpen(false)}
        className="fixed left-4 top-4 z-[var(--z-chrome)] sm:left-5 sm:top-5 md:left-9 md:top-6"
      >
        <Image
          src="/assets/favicon.png"
          alt="Contenaissance"
          title="Contenaissance"
          width={220}
          height={66}
          className="h-10 w-auto sm:h-12 md:h-16"
          priority
        />
      </Link>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((value) => !value)}
        className="group fixed right-4 top-4 z-[var(--z-chrome)] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:text-white sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
      >
        {menuOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <span className="flex h-5 items-end gap-[3px]">
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-5 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
            <span className="h-3 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
          </span>
        )}
      </button>

      <header className="ct-blog-banner">
        <div className="ct-blog-banner-glow" aria-hidden />
        <div className="ct-blog-banner-grid" aria-hidden />
        <div className="ct-blog-banner-fade" aria-hidden />
        <div className="ct-blog-banner-inner">
          <p className="ct-blog-eyebrow">Insights &amp; Stories</p>
          <h1 className="ct-blog-banner-title">
            Contenaissance
            <span>Journal</span>
          </h1>
          <p className="ct-blog-banner-sub">
            Where AI, creativity, and cinematic storytelling shape the future of
            digital innovation.
          </p>
        </div>
      </header>

      <div className="ct-blog-shell">
        <div className="ct-blog-section-head">
          <h2 className="ct-blog-section-title">Latest Articles</h2>
          <p className="ct-blog-section-copy">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            {searchQuery.trim() ? " matching your search" : ""}
          </p>
        </div>

        <div className="ct-blog-layout">
          <div className="ct-blog-feed">
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
                <button
                  type="button"
                  className="ct-blog-page-btn ct-blog-page-nav"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`ct-blog-page-btn ${pageNumber === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(pageNumber)}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="ct-blog-page-btn ct-blog-page-nav"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  Next
                </button>
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

      <CTAFooter showBrandHeading={false} />
    </div>
  );
}
