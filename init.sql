DROP TABLE IF EXISTS feedbacks;

CREATE TABLE feedbacks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NULL,
  relationship VARCHAR(50) NULL,
  position VARCHAR(100) NULL,
  company VARCHAR(100) NULL,
  respondent_name VARCHAR(100) NULL,
  rating TINYINT UNSIGNED NULL,
  message TEXT NOT NULL,
  token VARCHAR(64) NOT NULL,
  is_public TINYINT(1) DEFAULT 0,
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_token (token),
  INDEX idx_public_submitted (is_public, submitted_at),
  CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
