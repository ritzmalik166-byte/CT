import { query } from "@/lib/db";

export async function promoteScheduledBlogs() {
  await query(
    `UPDATE blogs
     SET status = 'published', published_at = COALESCE(published_at, NOW())
     WHERE status = 'scheduled'
       AND scheduled_publish_at IS NOT NULL
       AND scheduled_publish_at <= NOW()`,
  );
}
