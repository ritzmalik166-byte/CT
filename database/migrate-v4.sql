-- Admin audit logs (superadmin-only visibility in panel)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_name VARCHAR(150) NULL,
  user_email VARCHAR(150) NULL,
  user_role ENUM('superadmin', 'admin') NULL,
  action ENUM(
    'login',
    'logout',
    'login_failed',
    'create',
    'update',
    'delete',
    'publish',
    'status_change'
  ) NOT NULL,
  resource_type VARCHAR(50) NULL,
  resource_id INT NULL,
  resource_label VARCHAR(255) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
