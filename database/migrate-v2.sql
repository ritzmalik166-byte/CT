-- Migration v2: superadmin hierarchy + permissions + site assets
-- Safe to run on existing databases.

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INT NOT NULL PRIMARY KEY,
  can_manage_blogs BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_assets BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_permissions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_key VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  asset_url VARCHAR(500) NOT NULL,
  asset_type ENUM('image', 'video', 'document', 'other') NOT NULL DEFAULT 'image',
  description TEXT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assets_key (asset_key),
  CONSTRAINT fk_assets_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
  MODIFY role ENUM('superadmin', 'admin', 'editor', 'user') NOT NULL DEFAULT 'admin';

UPDATE users SET role = 'superadmin' WHERE role IN ('admin', 'editor') AND id = (
  SELECT min_id FROM (SELECT MIN(id) AS min_id FROM users) AS seed
);

UPDATE users SET role = 'admin' WHERE role IN ('editor', 'user');

ALTER TABLE users
  MODIFY role ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin';

INSERT IGNORE INTO user_permissions (user_id, can_manage_blogs, can_manage_assets)
SELECT id, TRUE, TRUE FROM users WHERE role = 'superadmin';

INSERT IGNORE INTO user_permissions (user_id, can_manage_blogs, can_manage_assets)
SELECT id, FALSE, FALSE FROM users WHERE role = 'admin';

INSERT IGNORE INTO site_assets (asset_key, label, asset_url, asset_type, description)
VALUES
  ('hero_background', 'Hero Background', '/assets/hero-bg.jpg', 'image', 'Main homepage hero background'),
  ('site_logo', 'Site Logo', '/assets/fav-icon.png', 'image', 'Primary brand logo'),
  ('footer_cta_banner', 'Footer CTA Banner', '/assets/footer-cta.jpg', 'image', 'Footer call-to-action banner');
