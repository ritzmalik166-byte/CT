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
      <Link href={`/blog/${blog.slug}`} className="ct-blog-card-image-link">
        {blog.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="ct-blog-card-image"
          />
        ) : (
          <div className="ct-blog-card-image-placeholder">Contenaissance</div>
        )}
      </Link>

      <div className="ct-blog-card-body">
        <h2 className="ct-blog-card-title">
          <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p className="ct-blog-card-meta">
          By <strong>{author}</strong>
          {date ? `, ${date}` : ""}
        </p>
        <div className="ct-blog-card-divider" />
        <p className="ct-blog-card-excerpt">{excerpt}</p>
        <Link href={`/blog/${blog.slug}`} className="ct-blog-read-more">
          Read more <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
