"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { CTAFooter } from "@/components/home/CTAFooter";
import { InnerPageNav } from "@/components/InnerPageNav";
import { formatBlogListDate, readingTime } from "@/lib/blog-utils";
import { BlogSidebar } from "./BlogSidebar";
import { prepareBlogHtml } from "./BlogContentBody";
import "./blog.css";

export type BlogDetailData = {
  slug: string;
  title: string;
  content: string;
  cover_image: string | null;
  blog_keywords: string | null;
  blog_meta_description: string | null;
  excerpt: string | null;
  author_name: string | null;
  published_at: Date | string | null;
};

export function BlogDetailView({
  blog,
  recentPosts,
}: {
  blog: BlogDetailData;
  recentPosts: BlogDetailData[];
}) {
  const [activeTocId, setActiveTocId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const tocNavRef = useRef<HTMLElement>(null);

  const { html: bodyHtml, toc } = useMemo(
    () => prepareBlogHtml(blog.content, true),
    [blog.content],
  );

  const keywords = (blog.blog_keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const minutes = readingTime(blog.content);
  const author = blog.author_name || "Contenaissance Team";
  const published = formatBlogListDate(blog.published_at);
  const relatedPosts = recentPosts
    .filter((post) => post.slug !== blog.slug)
    .slice(0, 5);

  useEffect(() => {
    if (!toc.length) return undefined;

    const elements = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveTocId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc, bodyHtml]);

  function handleTocClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTocId(id);
  }

  return (
    <div className="ct-blog-page ct-blog-detail-wrap">
      <InnerPageNav
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        currentPage="blog"
        variant="light"
      />

      <header className="ct-blog-banner ct-blog-detail-banner">
        <div className="ct-blog-banner-glow" aria-hidden />
        <div className="ct-blog-banner-inner ct-blog-detail-banner-inner">
          <nav className="ct-blog-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/blog">Blog</Link>
            <span aria-hidden>/</span>
            <span>Article</span>
          </nav>

          <Link href="/blog" className="ct-blog-back-link">
            <ArrowLeft className="size-4" />
            Back to Journal
          </Link>

          <h1 className="ct-blog-banner-title">{blog.title}</h1>

          {blog.blog_meta_description || blog.excerpt ? (
            <p className="ct-blog-banner-sub ct-blog-detail-lede">
              {blog.blog_meta_description || blog.excerpt}
            </p>
          ) : null}

          <div className="ct-blog-detail-meta">
            <div className="ct-blog-detail-meta-item">
              <span className="ct-blog-detail-meta-label">Author</span>
              <strong>{author}</strong>
            </div>
            {published ? (
              <div className="ct-blog-detail-meta-item">
                <span className="ct-blog-detail-meta-label">Published</span>
                <time dateTime={new Date(blog.published_at || "").toISOString()}>
                  {published}
                </time>
              </div>
            ) : null}
            <div className="ct-blog-detail-meta-item">
              <span className="ct-blog-detail-meta-label">Reading time</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {minutes} min
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="ct-blog-shell ct-blog-detail-shell">
        <div className="ct-blog-detail-grid">
          <article className="ct-blog-article-panel">
            <div className="ct-blog-article-card">
              {blog.cover_image ? (
                <div className="ct-blog-article-image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element -- cover URLs may be any CMS host */}
                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="ct-blog-article-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              ) : null}

              {toc.length > 0 ? (
                <nav
                  ref={tocNavRef}
                  className="ct-blog-toc ct-blog-toc-inline"
                  aria-label="Table of contents"
                >
                  <p className="ct-blog-toc-title">In this article</p>
                  <ol className="ct-blog-toc-list ct-blog-toc-list-grid">
                    {toc.map((item, index) => (
                      <li key={item.id} className="ct-blog-toc-item">
                        <a
                          href={`#${item.id}`}
                          className={`ct-blog-toc-link ${activeTocId === item.id ? "active" : ""}`}
                          onClick={(event) => handleTocClick(event, item.id)}
                        >
                          <span className="ct-blog-toc-index">{String(index + 1).padStart(2, "0")}</span>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <div className="ct-blog-content-wrap">
                <div
                  className="ct-blog-content-body"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>

              {keywords.length > 0 ? (
                <div className="ct-blog-article-footer-tags">
                  <p className="ct-blog-toc-title">Topics</p>
                  <div className="ct-blog-keywords">
                    {keywords.map((keyword) => (
                      <span key={keyword} className="ct-blog-keyword">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          <aside className="ct-blog-detail-rail ct-blog-detail-rail-right">
            <div className="ct-blog-detail-sticky">
              {toc.length > 0 ? (
                <nav className="ct-blog-sidebar ct-blog-toc-rail" aria-label="On this page">
                  <h3 className="ct-blog-sidebar-title">On this page</h3>
                  <ol className="ct-blog-toc-list">
                    {toc.map((item) => (
                      <li key={item.id} className="ct-blog-toc-item">
                        <a
                          href={`#${item.id}`}
                          className={`ct-blog-toc-link ${activeTocId === item.id ? "active" : ""}`}
                          onClick={(event) => handleTocClick(event, item.id)}
                        >
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <div className={toc.length > 0 ? "mt-4" : undefined}>
                <BlogSidebar
                  showSearch={false}
                  title="Related Articles"
                  recentPosts={relatedPosts.map((post) => ({
                    slug: post.slug,
                    title: post.title,
                    published_at: post.published_at,
                  }))}
                />
              </div>

              <div className="ct-blog-sidebar mt-4">
                <h3 className="ct-blog-sidebar-title">Explore More</h3>
                <p className="ct-blog-explore-copy">
                  Discover more insights on AI storytelling, product updates, and
                  industry trends from the Contenaissance team.
                </p>
                <Link href="/blog" className="ct-blog-read-more mt-3 inline-flex">
                  View all articles →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CTAFooter />
    </div>
  );
}
