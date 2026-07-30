import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  excerptFromHtml,
  formatBlogListDate,
} from "@/lib/blog-utils";

export type BlogListItemData = {
  slug: string;
  title: string;
  cover_image: string | null;
  content: string;
  blog_meta_description: string | null;
  excerpt: string | null;
  author_name: string | null;
  published_at: Date | string | null;
};

export function BlogListItem({ blog }: { blog: BlogListItemData }) {
  const excerpt =
    blog.blog_meta_description ||
    blog.excerpt ||
    excerptFromHtml(blog.content);
  const author = blog.author_name || "Contenaissance Team";
  const date = formatBlogListDate(blog.published_at);

  return (
    <article className="ct-blog-card">
      <Link
        href={`/blog/${blog.slug}`}
        className="ct-blog-card-media"
        aria-label={`Read ${blog.title}`}
      >
        {blog.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element -- cover URLs may be any CMS host
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="ct-blog-card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="ct-blog-card-image-placeholder">
            <span>Contenaissance</span>
          </div>
        )}
      </Link>

      <div className="ct-blog-card-body">
        {date ? (
          <time className="ct-blog-card-date" dateTime={new Date(blog.published_at || "").toISOString()}>
            {date}
          </time>
        ) : null}
        <h2 className="ct-blog-card-title">
          <Link href={`/blog/${blog.slug}`} target="_blank">{blog.title}</Link>
        </h2>
        <p className="ct-blog-card-meta">
          By <strong>{author}</strong>
        </p>
        <p className="ct-blog-card-excerpt">{excerpt}</p>
        <Link href={`/blog/${blog.slug}`} target="_blank" className="ct-blog-read-more">
          Read article <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
