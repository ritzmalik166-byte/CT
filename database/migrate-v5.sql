-- Migration v5: Lead Management System
-- Adds lead management permission and leads/lead_notes tables

ALTER TABLE user_permissions
  ADD COLUMN can_manage_leads BOOLEAN NOT NULL DEFAULT FALSE;

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
