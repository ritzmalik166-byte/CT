import type { Metadata } from "next";
import { Suspense } from "react";
import { promoteScheduledBlogs } from "@/lib/blog-db";
import { query } from "@/lib/db";
import { BlogListing } from "@/components/blog/BlogListing";
import type { BlogWithAuthor } from "@/types/admin";

export const metadata: Metadata = {
  title: "Blog | Contenaissance",
  description: "Insights, updates, and stories from Contenaissance.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListingPage() {
  await promoteScheduledBlogs();

  const blogs = await query<BlogWithAuthor>(
    `SELECT b.*, u.name AS author_name, u.email AS author_email
     FROM blogs b
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.status = 'published'
     ORDER BY b.published_at DESC, b.created_at DESC`,
  );

  const recentPosts = blogs.slice(0, 5);

  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-zinc-50 p-10 text-center text-zinc-500">Loading blog…</div>}>
      <BlogListing blogs={blogs} recentPosts={recentPosts} />
    </Suspense>
  );
}
