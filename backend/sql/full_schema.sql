CREATE DATABASE IF NOT EXISTS trustbridge_kenya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trustbridge_kenya;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('member', 'freelancer', 'client', 'admin') NOT NULL DEFAULT 'member',
  status ENUM('active', 'review', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
);


CREATE TABLE IF NOT EXISTS jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  location VARCHAR(120) NOT NULL DEFAULT 'Remote, Kenya',
  budget VARCHAR(80) NOT NULL,
  timeline VARCHAR(80) NOT NULL,
  experience VARCHAR(80) NOT NULL DEFAULT 'Open level',
  trust_level VARCHAR(120) NOT NULL DEFAULT 'Trust review pending',
  skills TEXT,
  status ENUM('open', 'paused', 'closed', 'under_review') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_jobs_owner_title UNIQUE (owner_id, title),
  INDEX idx_jobs_owner (owner_id),
  INDEX idx_jobs_category (category),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_created_at (created_at),
  INDEX idx_jobs_status_category (status, category),
  INDEX idx_jobs_owner_status (owner_id, status)
);

CREATE TABLE IF NOT EXISTS talent_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General Freelancer',
  skill_level ENUM('Beginner', 'Beginner+', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
  location VARCHAR(120) NOT NULL DEFAULT 'Kenya',
  rate VARCHAR(80) NOT NULL,
  bio TEXT NOT NULL,
  trust_score INT NOT NULL DEFAULT 45,
  completed_jobs INT NOT NULL DEFAULT 0,
  availability VARCHAR(100) NOT NULL DEFAULT 'Available for selected projects',
  verification ENUM('pending', 'reviewed', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  status ENUM('active', 'draft', 'hidden', 'under_review') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_talent_profiles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_talent_profiles_user UNIQUE (user_id),
  INDEX idx_talent_profiles_category (category),
  INDEX idx_talent_profiles_skill_level (skill_level),
  INDEX idx_talent_profiles_status (status),
  INDEX idx_talent_profiles_trust_score (trust_score),
  INDEX idx_talent_profiles_category_level (category, skill_level),
  INDEX idx_talent_profiles_status_score (status, trust_score)
);

CREATE TABLE IF NOT EXISTS profile_skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  skill_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_skills_profile FOREIGN KEY (profile_id) REFERENCES talent_profiles(profile_id) ON DELETE CASCADE,
  CONSTRAINT uq_profile_skill UNIQUE (profile_id, skill_name),
  INDEX idx_profile_skills_profile (profile_id),
  INDEX idx_profile_skills_name (skill_name)
);

CREATE TABLE IF NOT EXISTS portfolio_links (
  link_id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  label VARCHAR(120) NOT NULL DEFAULT 'Portfolio link',
  url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_links_profile FOREIGN KEY (profile_id) REFERENCES talent_profiles(profile_id) ON DELETE CASCADE,
  INDEX idx_portfolio_links_profile (profile_id)
);


CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('job-application', 'talent-invite') NOT NULL,
  source_id INT NULL,
  source_title VARCHAR(180) NOT NULL,
  applicant_user_id INT NULL,
  applicant_name VARCHAR(120) NOT NULL,
  applicant_email VARCHAR(160) NOT NULL,
  owner_user_id INT NULL,
  owner_name VARCHAR(120) NOT NULL DEFAULT '',
  owner_email VARCHAR(160) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  budget VARCHAR(80) NOT NULL DEFAULT '',
  timeline VARCHAR(80) NOT NULL DEFAULT '',
  status ENUM('pending', 'shortlisted', 'rejected', 'accepted') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_applicant_user FOREIGN KEY (applicant_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_applications_owner_user FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_applications_type (type),
  INDEX idx_applications_status (status),
  INDEX idx_applications_applicant_user (applicant_user_id),
  INDEX idx_applications_owner_user (owner_user_id),
  INDEX idx_applications_created_at (created_at),
  INDEX idx_applications_owner_status (owner_user_id, status),
  INDEX idx_applications_applicant_status (applicant_user_id, status)
);

CREATE TABLE IF NOT EXISTS verification_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'member',
  evidence_type ENUM('Portfolio link', 'GitHub link', 'Certificate link', 'Business profile', 'Previous work proof', 'Identity proof') NOT NULL DEFAULT 'Portfolio link',
  evidence_link VARCHAR(255) NOT NULL,
  notes TEXT NOT NULL,
  review_notes TEXT,
  status ENUM('pending', 'approved', 'rejected', 'more_evidence_needed') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_requests_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_verification_requests_user (user_id),
  INDEX idx_verification_requests_status (status),
  INDEX idx_verification_requests_role (role),
  INDEX idx_verification_requests_created_at (created_at),
  INDEX idx_verification_requests_status_role (status, role),
  INDEX idx_verification_requests_user_status (user_id, status)
);

CREATE TABLE IF NOT EXISTS trust_score_events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type ENUM('approved_verification', 'rejected_verification', 'more_evidence_needed', 'talent_profile_completed', 'application_submitted', 'job_posted', 'manual_admin_event', 'dispute_warning') NOT NULL,
  points INT NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_by INT NULL,
  source_type VARCHAR(80) NULL,
  source_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trust_score_events_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_trust_score_events_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_trust_score_events_user (user_id),
  INDEX idx_trust_score_events_type (event_type),
  INDEX idx_trust_score_events_created_by (created_by),
  INDEX idx_trust_score_events_created_at (created_at),
  INDEX idx_trust_score_events_user_created_at (user_id, created_at),
  INDEX idx_trust_score_events_source (source_type, source_id)
);
