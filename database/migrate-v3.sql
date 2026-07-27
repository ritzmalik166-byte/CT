-- Migration v3: MPF-style blog fields and publication states

ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS blog_keywords VARCHAR(500) NULL AFTER excerpt,
  ADD COLUMN IF NOT EXISTS blog_meta_description TEXT NULL AFTER blog_keywords,
  ADD COLUMN IF NOT EXISTS author_name VARCHAR(150) NULL AFTER cover_image,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP NULL DEFAULT NULL AFTER published_at;

ALTER TABLE blogs
  MODIFY status ENUM('draft', 'published', 'scheduled', 'inactive') NOT NULL DEFAULT 'draft';

UPDATE blogs
SET blog_meta_description = excerpt
WHERE blog_meta_description IS NULL AND excerpt IS NOT NULL;
