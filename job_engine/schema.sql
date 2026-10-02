-- ============================================================================
-- DRC Job Discovery & Application Platform Database Schema
-- Compatible with MySQL Workbench 8.0+, MariaDB 10.5+, PostgreSQL & SQLite3
-- ============================================================================

-- Create database if not exists (Uncomment if setting up a fresh MySQL database)
-- CREATE DATABASE IF NOT EXISTS drc_job_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE drc_job_platform;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Table 1: companies
-- Stores normalized company profiles, industries, and social footprints
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    id VARCHAR(64) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_slug VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100) DEFAULT 'Technology / Software',
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    headquarters_location VARCHAR(255) DEFAULT 'India',
    verified_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_company_name ON companies(company_name);
CREATE INDEX idx_company_slug ON companies(company_slug);


-- ----------------------------------------------------------------------------
-- Table 2: discovery_batches
-- Groups discovered jobs into organized batches with search metadata
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS discovery_batches;
CREATE TABLE discovery_batches (
    batch_number INT AUTO_INCREMENT PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL,
    search_role VARCHAR(255) NOT NULL,
    search_location VARCHAR(255) DEFAULT 'Remote',
    recency_filter VARCHAR(20) DEFAULT '24h',
    jobs_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_batch_cand_email ON discovery_batches(candidate_email);
CREATE INDEX idx_batch_role ON discovery_batches(search_role);


-- ----------------------------------------------------------------------------
-- Table 3: discovered_jobs
-- Master table storing all verified tech job openings, descriptions, ATS metrics
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS discovered_jobs;
CREATE TABLE discovered_jobs (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64),
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'Remote',
    job_type VARCHAR(50) DEFAULT 'Full-time',
    salary VARCHAR(100) DEFAULT 'Competitive',
    experience_required VARCHAR(100) DEFAULT '2+ years',
    application_url TEXT NOT NULL,
    external_job_id VARCHAR(100),
    source_platform VARCHAR(50) DEFAULT 'LinkedIn Verified',
    job_description LONGTEXT,
    batch_number INT DEFAULT 1,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_name VARCHAR(255) DEFAULT 'Candidate',
    status VARCHAR(50) DEFAULT 'Not Applied',
    remarks TEXT,
    ats_score INT DEFAULT 85,
    match_score INT DEFAULT 85,
    matched_skills TEXT,
    missing_skills TEXT,
    experience_match TEXT,
    total_call_received INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    url_canonical TEXT,
    company_canonical VARCHAR(255),
    title_canonical VARCHAR(255),
    fingerprint VARCHAR(64) NOT NULL,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT uq_job_fingerprint UNIQUE (fingerprint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_job_title ON discovered_jobs(job_title);
CREATE INDEX idx_job_company ON discovered_jobs(company_name);
CREATE INDEX idx_job_location ON discovered_jobs(location);
CREATE INDEX idx_job_cand_email ON discovered_jobs(candidate_email);
CREATE INDEX idx_job_batch ON discovered_jobs(candidate_email, batch_number);
CREATE INDEX idx_job_status ON discovered_jobs(status);
CREATE INDEX idx_job_discovered_at ON discovered_jobs(discovered_at);
CREATE INDEX idx_job_ext_id ON discovered_jobs(external_job_id);


-- ----------------------------------------------------------------------------
-- Table 4: job_skills
-- Normalized 1-to-Many relational table for required tech stack per job
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS job_skills;
CREATE TABLE job_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    is_core_skill BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_job FOREIGN KEY (job_id) REFERENCES discovered_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_skill_job_id ON job_skills(job_id);
CREATE INDEX idx_skill_name ON job_skills(skill_name);


-- ----------------------------------------------------------------------------
-- Table 5: hiring_team_connections
-- Verified recruiters, HR managers, and talent acquisition contacts for each job
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS hiring_team_connections;
CREATE TABLE hiring_team_connections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64),
    company_slug VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    recruiter_name VARCHAR(255) NOT NULL,
    recruiter_title VARCHAR(255) DEFAULT 'Talent Acquisition / HR Lead',
    linkedin_url VARCHAR(500) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conn_job FOREIGN KEY (job_id) REFERENCES discovered_jobs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_conn_job_id ON hiring_team_connections(job_id);
CREATE INDEX idx_conn_company ON hiring_team_connections(company_slug);
CREATE INDEX idx_conn_name ON hiring_team_connections(recruiter_name);


-- ----------------------------------------------------------------------------
-- Table 6: candidates
-- Candidate profile master table containing parsed resume attributes & contact info
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS candidates;
CREATE TABLE candidates (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255) DEFAULT 'Pune, Maharashtra, India',
    total_experience_years DECIMAL(4, 1) DEFAULT 0.0,
    primary_domain VARCHAR(150) DEFAULT 'Software Engineering',
    target_roles TEXT,
    skills_json TEXT,
    education TEXT,
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cand_email ON candidates(email);
CREATE INDEX idx_cand_domain ON candidates(primary_domain);


-- ----------------------------------------------------------------------------
-- Table 7: candidate_resumes
-- Stores uploaded resume files, extracted raw text, and document metadata
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS candidate_resumes;
CREATE TABLE candidate_resumes (
    id VARCHAR(64) PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    file_size_bytes INT DEFAULT 0,
    raw_text LONGTEXT,
    parsed_skills_json TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_cand FOREIGN KEY (candidate_email) REFERENCES candidates(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_resume_cand_email ON candidate_resumes(candidate_email);


-- ----------------------------------------------------------------------------
-- Table 8: candidate_applications
-- Submissions submitted by candidates with ATS score, status, and recruiter notes
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS candidate_applications;
CREATE TABLE candidate_applications (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50),
    candidate_location VARCHAR(255),
    experience_years DECIMAL(4, 1) DEFAULT 0.0,
    skills_json TEXT,
    education TEXT,
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    resume_filename VARCHAR(255),
    resume_raw_text LONGTEXT,
    ats_score INT DEFAULT 85,
    matched_skills TEXT,
    missing_skills TEXT,
    additional_applied_job_ids TEXT,
    status VARCHAR(50) DEFAULT 'New',
    recruiter_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES discovered_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_app_cand_email ON candidate_applications(candidate_email);
CREATE INDEX idx_app_job_id ON candidate_applications(job_id);
CREATE INDEX idx_app_status ON candidate_applications(status);
CREATE INDEX idx_app_applied_at ON candidate_applications(applied_at);


-- ----------------------------------------------------------------------------
-- Table 9: cached_job_descriptions
-- High-speed caching for full job descriptions fetched from verified providers
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS cached_job_descriptions;
CREATE TABLE cached_job_descriptions (
    job_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    description LONGTEXT NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cache_fetched ON cached_job_descriptions(fetched_at);


-- ----------------------------------------------------------------------------
-- Views for SQL Workbench Analytics & Reporting
-- ----------------------------------------------------------------------------

-- View 1: Active Discovered Jobs with Recruiter Contacts
CREATE OR REPLACE VIEW v_discovered_jobs_feed AS
SELECT 
    j.id AS job_id,
    j.job_title,
    j.company_name,
    j.location,
    j.job_type,
    j.salary,
    j.experience_required,
    j.ats_score,
    j.status AS application_status,
    j.batch_number,
    j.discovered_at,
    j.application_url,
    r.recruiter_name,
    r.recruiter_title,
    r.linkedin_url AS recruiter_linkedin
FROM discovered_jobs j
LEFT JOIN hiring_team_connections r ON j.id = r.job_id
ORDER BY j.discovered_at DESC;


-- View 2: Candidate Application Pipeline & Recruiter Follow-Up
CREATE OR REPLACE VIEW v_candidate_application_pipeline AS
SELECT 
    a.id AS application_id,
    a.candidate_name,
    a.candidate_email,
    a.candidate_phone,
    a.job_title,
    a.company,
    a.experience_years,
    a.ats_score,
    a.status AS application_status,
    a.applied_at,
    a.resume_filename,
    j.application_url AS job_link
FROM candidate_applications a
LEFT JOIN discovered_jobs j ON a.job_id = j.id
ORDER BY a.applied_at DESC;


-- View 3: Discovery Domain & Batch Summary Metrics
CREATE OR REPLACE VIEW v_discovery_metrics AS
SELECT 
    b.batch_number,
    b.search_role,
    b.search_location,
    b.jobs_count,
    COUNT(DISTINCT a.id) AS total_applications_submitted,
    b.created_at AS batch_created_at
FROM discovery_batches b
LEFT JOIN discovered_jobs j ON b.batch_number = j.batch_number
LEFT JOIN candidate_applications a ON j.id = a.job_id
GROUP BY b.batch_number, b.search_role, b.search_location, b.jobs_count, b.created_at
ORDER BY b.batch_number DESC;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
