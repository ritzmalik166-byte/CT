-- Migration v6: Email OTP verification sessions (international enquiries)
--
-- One row = one OTP session. Every "send" request creates a NEW row; any
-- older pending row for the same phone/email is marked 'superseded'.
-- The raw OTP is never stored, only an HMAC-SHA256 hash.

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
