-- CT Admin Panel schema v2
-- Roles: superadmin (full access) > admin (permission-based)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INT NOT NULL PRIMARY KEY,
  can_manage_blogs BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_assets BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_leads BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_permissions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NOT NULL,
  cover_image VARCHAR(500) NULL,
  author_id INT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blogs_status (status),
  INDEX idx_blogs_slug (slug),
  INDEX idx_blogs_published_at (published_at),
  CONSTRAINT fk_blogs_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('contact', 'footer') NOT NULL DEFAULT 'contact',
  full_name VARCHAR(150) NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NULL,
  service VARCHAR(150) NULL,
  message TEXT NULL,
  source VARCHAR(255) NULL,
  status ENUM('Pending', 'Contacted', 'Qualified', 'Converted', 'Lost') NOT NULL DEFAULT 'Pending',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_status (status),
  INDEX idx_leads_email (email),
  INDEX idx_leads_created_at (created_at),
  INDEX idx_leads_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  user_id INT NULL,
  author_name VARCHAR(150) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lead_notes_lead_id (lead_id),
  CONSTRAINT fk_lead_notes_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_lead_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS otp_verifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL,                       -- public UUID, stored in httpOnly cookie
  channel ENUM('email', 'sms') NOT NULL DEFAULT 'email',
  purpose VARCHAR(50) NOT NULL DEFAULT 'contact_enquiry',

  recipient VARCHAR(255) NOT NULL,                    -- where OTP was delivered (email)
  phone VARCHAR(32) NOT NULL,                         -- normalized number incl. country code
  country VARCHAR(50) NOT NULL,

  otp_hash CHAR(64) NOT NULL,                         -- HMAC-SHA256(session_id:otp)
  status ENUM('pending', 'verified', 'expired', 'superseded', 'blocked') NOT NULL DEFAULT 'pending',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 5,

  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  last_attempt_at DATETIME NULL,

  ip_address VARCHAR(45) NULL,                        -- IPv4/IPv6
  user_agent VARCHAR(512) NULL,

  enquiry_payload JSON NULL,                          -- snapshot of the enquiry at OTP time
  delivery_status ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
  delivery_error VARCHAR(500) NULL,
  admin_notified_at DATETIME NULL,                    -- micro-enquiry alert sent to admin

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_otp_session_id (session_id),
  INDEX idx_otp_recipient_created (recipient, created_at),
  INDEX idx_otp_phone_created (phone, created_at),
  INDEX idx_otp_ip_created (ip_address, created_at),
  INDEX idx_otp_status_expires (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
