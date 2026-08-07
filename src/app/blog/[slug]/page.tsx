import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { promoteScheduledBlogs } from "@/lib/blog-db";
import { query, queryOne } from "@/lib/db";
import { BlogDetailView } from "@/components/blog/BlogDetailView";
import type { BlogWithAuthor } from "@/types/admin";

/** Always read the post from the DB — no redeploy needed for new/updated posts. */
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const blog = await queryOne<{
    title: string;
    excerpt: string | null;
    blog_meta_description: string | null;
    cover_image: string | null;
  }>(
    `SELECT title, excerpt, blog_meta_description, cover_image
     FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1`,
    [slug],
  );

  if (!blog) {
    return { title: "Blog | Contenaissance" };
  }

  return {
    title: `${blog.title} | Contenaissance Blog`,
    description: blog.blog_meta_description ?? blog.excerpt ?? undefined,
    openGraph: {
      title: blog.title,
      description: blog.blog_meta_description ?? blog.excerpt ?? undefined,
      images: blog.cover_image ? [{ url: blog.cover_image }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  await promoteScheduledBlogs();
  const { slug } = await params;

  const blog = await queryOne<BlogWithAuthor>(
    `SELECT b.*, u.name AS author_name, u.email AS author_email
     FROM blogs b
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.slug = ? AND b.status = 'published'
     LIMIT 1`,
    [slug],
  );

  if (!blog) notFound();

  const recentPosts = await query<BlogWithAuthor>(
    `SELECT b.*, u.name AS author_name, u.email AS author_email
     FROM blogs b
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.status = 'published'
     ORDER BY b.published_at DESC, b.created_at DESC
     LIMIT 8`,
  );

  return <BlogDetailView blog={blog} recentPosts={recentPosts} />;
}
