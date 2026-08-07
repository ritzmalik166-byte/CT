import { revalidatePath } from "next/cache";

/** Bust public blog listing, detail pages, and dynamic sitemap after admin changes. */
export function revalidatePublicBlogPages(slug?: string | null) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}
