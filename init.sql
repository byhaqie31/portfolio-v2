-- ══════════════════════════════════════════════════════════════
-- Portfolio DB — init.sql
-- ══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET sql_mode = '';

-- ── FEEDBACKS (existing) ─────────────────────────────────────
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

-- ── PERSONAL ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personal (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    bio_1 TEXT NOT NULL,
    bio_2 TEXT NULL,
    summary TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(30) NULL,
    website VARCHAR(255) NULL,
    github VARCHAR(255) NULL,
    linkedin VARCHAR(255) NULL,
    available_for VARCHAR(100) NULL,
    focus VARCHAR(100) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── LANGUAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS languages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lang VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(50) NOT NULL,
    featured TINYINT(1) DEFAULT 0,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    href VARCHAR(255) NULL,
    github_url VARCHAR(255) NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visible_sort (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PROJECT STACK ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_stack (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    tech VARCHAR(50) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── PROJECT METRICS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_metrics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    value VARCHAR(20) NOT NULL,
    label VARCHAR(100) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── EXPERIENCES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    period VARCHAR(50) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    is_current TINYINT(1) DEFAULT 0,
    description TEXT NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visible_sort (is_visible, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── EXPERIENCE BULLETS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS experience_bullets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    experience_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── EXPERIENCE TAGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experience_tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    experience_id INT UNSIGNED NOT NULL,
    tag VARCHAR(50) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── EDUCATION ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    period VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    degree TEXT NOT NULL,
    cgpa VARCHAR(30) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SKILL GROUPS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_groups (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SKILL ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    name VARCHAR(80) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES skill_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ACTIVITIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════

-- Personal
INSERT INTO personal (name, short_name, role, bio_1, bio_2, summary, location, email, mobile, website, github, linkedin, available_for, focus) VALUES (
    'Ahmad Baihaqie Bin Mohd Yusri',
    'Ahmad Baihaqie',
    'Software Engineer – UI/UX',
    'I''m Ahmad Baihaqie, a Kuala Lumpur–based Software Engineer (UI/UX) working in fintech and SaaS environments. I specialize in crafting clean, scalable, and user-focused interfaces using technologies such as Vue.js, Nuxt, Tailwind CSS, and API-driven architectures. My work focuses on simplifying complex financial workflows and delivering seamless digital experiences that bridge business goals with user needs.',
    'Currently, I am also pursuing a Master of Science in Human Resource Development at Universiti Putra Malaysia, where my research focuses on AI adoption, digital transformation, and intergenerational dynamics in technology-driven organizations which allowing me to approach product development not only from a technical perspective but also from a human and organizational lens.',
    'A results-driven Software Engineer (UI/UX) in fintech, experienced in developing user-focused web applications with Vue.js, Tailwind CSS, and API integrations.',
    'Shah Alam, Selangor',
    'byhaqie1455@gmail.com',
    '+60 17-710 9486',
    'https://baihaqie.com/',
    'https://github.com/byhaqie31',
    'https://linkedin.com/in/byhaqieyusri',
    'Full-time / Contract',
    'Fintech / SaaS'
);

-- Languages
INSERT INTO languages (lang, level, sort_order) VALUES
    ('Malay', 'Native Proficiency', 1),
    ('English', 'Professional Working Proficiency', 2),
    ('Arabic', 'Elementary Proficiency', 3);

-- Projects
INSERT INTO projects (slug, tag, featured, name, description, href, github_url, sort_order) VALUES
    ('axelnova-dashboard', '⚡ Featured', 1, 'AxelNova Dashboard', 'A cyberpunk-themed mission control dashboard featuring a rocket launch animation, project registry, and futuristic UI design. Built with vanilla HTML/CSS/JS with custom starfield canvas, scanline effects, and neon glow aesthetics.', 'https://www.axelnova.tech', NULL, 1),
    ('house-of-parfum', '⚡ Featured', 1, 'House of Parfum — Online Perfume Boutique', 'Final year project — developed a full-stack e-commerce web application with emphasis on frontend UI quality and backend PHP integration. Conducted user testing and iterated based on feedback to achieve 100% functional compliance.', '#', 'https://github.com/byhaqie31/HouseOfParfum', 2),
    ('razer-merchant-portal', 'Enterprise', 0, 'Fiuu (formerly Razer Merchant Services) — Merchant & Admin Portal', 'Designed and developed high-quality user interfaces across the Merchant Portal, Admin Portal, and multiple fintech payment modules. Streamlined UI flows, refined error messages, improved form validations, and optimized data-driven interfaces — contributing to higher system adoption and reduced support escalations.', 'https://fiuu.com', NULL, 3),
    ('graphic-design', 'Design', 0, 'Brand & Print Design — Faztech Services', 'Produced professional client-facing artworks including brochures, business cards, and flyers using Adobe tools — adhering to all client requirements across every deliverable.', '#', NULL, 4);

-- Project Stack
INSERT INTO project_stack (project_id, tech, sort_order) VALUES
    (1, 'HTML', 1), (1, 'CSS', 2), (1, 'JavaScript', 3), (1, 'SVG Animation', 4),
    (2, 'PHP', 1), (2, 'Bootstrap', 2), (2, 'JavaScript', 3), (2, 'MySQL', 4), (2, 'Figma', 5),
    (3, 'Vue.js', 1), (3, 'Tailwind CSS', 2), (3, 'JavaScript', 3), (3, 'REST API', 4), (3, 'Figma', 5),
    (4, 'Adobe Illustrator', 1), (4, 'Photoshop', 2), (4, 'After Effects', 3), (4, 'Premiere Pro', 4);

-- Project Metrics (only project 3 has metrics)
INSERT INTO project_metrics (project_id, value, label, sort_order) VALUES
    (3, '↓', 'Support escalations', 1),
    (3, '↑', 'System adoption', 2),
    (3, '3+', 'Portals shipped', 3);

-- Experiences
INSERT INTO experiences (slug, period, company, location, role, is_current, description, sort_order) VALUES
    ('razer', 'Dec 2025 – Present', 'Fiuu (formerly Razer Merchant Services)', 'Shah Alam, Selangor', 'Software Engineer – UI/UX', 1, 'Building high-quality user interfaces for fintech payment products across Merchant Portal, Admin Portal, and multiple payment modules.', 1),
    ('faztech', 'Jul 2020 – Oct 2020', 'Faztech Services', 'Tangkak, Johor', 'Graphic Designer & Technician', 0, 'Designed professional client artworks and collaborated with a team of 8 technicians to handle maintenance and support tasks.', 2);

-- Experience Bullets
INSERT INTO experience_bullets (experience_id, content, sort_order) VALUES
    (1, 'Designed and developed high-quality UIs using Vue.js, Tailwind CSS, and modern front-end architectures across the Merchant Portal, Admin Portal, and multiple fintech payment modules.', 1),
    (1, 'Collaborated with product owners, backend developers, QA testers, and business teams to identify pain points, refine requirements, and deploy incremental improvements.', 2),
    (1, 'Enhanced merchant experience by streamlining UI flows, refining error messages, improving form validations, and optimizing data-driven interfaces.', 3),
    (2, 'Designed professional artworks using 6 Adobe software applications (Illustrator, After Effects) adhering to all client requirements for brochures, business cards, and flyers.', 1),
    (2, 'Collaborated with a team of 8 technicians handling program installation and OS maintenance with 0% callback from upper management.', 2),
    (2, 'Responded to recurring client issues (Anti-Virus & OS Installation) closing 8/10 cases per week following established BAU protocols.', 3);

-- Experience Tags
INSERT INTO experience_tags (experience_id, tag, sort_order) VALUES
    (1, 'Vue.js', 1), (1, 'Tailwind CSS', 2), (1, 'JavaScript', 3), (1, 'REST API', 4), (1, 'Figma', 5), (1, 'GitLab', 6),
    (2, 'Adobe Illustrator', 1), (2, 'After Effects', 2), (2, 'Photoshop', 3), (2, 'Premiere Pro', 4);

-- Education
INSERT INTO education (slug, period, institution, location, degree, cgpa, sort_order) VALUES
    ('upm-masters', 'In Progress', 'Universiti Putra Malaysia (UPM)', 'Serdang, Selangor', 'Master of Science in Human Resource Development', 'In Progress', 1),
    ('um-degree', 'Oct 2023', 'Universiti Malaya (UM)', 'Kuala Lumpur, W.P', 'Bachelor of Islamic Studies and Information Technology (First Class Honours)', '3.77 / 4.00', 2),
    ('um-foundation', 'May 2019', 'Universiti Malaya (UM)', 'Kuala Lumpur, W.P', 'Foundation of Islamic Studies and Science', '3.44 / 4.00', 3);

-- Skill Groups
INSERT INTO skill_groups (label, sort_order) VALUES
    ('UI / UX Design', 1),
    ('Frontend', 2),
    ('Creative & Design Tools', 3),
    ('Tools & Workflow', 4);

-- Skill Items
INSERT INTO skill_items (group_id, name, sort_order) VALUES
    (1, 'Figma', 1), (1, 'UI Design', 2), (1, 'UX Research', 3), (1, 'Prototyping', 4), (1, 'Wireframing', 5), (1, 'Design Systems', 6),
    (2, 'Vue.js', 1), (2, 'Nuxt 3', 2), (2, 'Tailwind CSS', 3), (2, 'JavaScript', 4), (2, 'REST API Integration', 5), (2, 'HTML / CSS', 6),
    (3, 'Adobe Illustrator', 1), (3, 'Photoshop', 2), (3, 'After Effects', 3), (3, 'Premiere Pro', 4),
    (4, 'GitLab', 1), (4, 'Figma', 2), (4, 'Microsoft Office', 3), (4, 'Version Control', 4), (4, 'Agile / Scrum', 5);

-- Activities
INSERT INTO activities (content, sort_order) VALUES
    ('UM — "Kesatuan Mahasiswa Akademi Pengajian Islam" (Committee Member)', 1),
    ('UM — "Program Career Fest 2023, Akademi Pengajian Islam" (Treasurer)', 2),
    ('UM — "Malam Penghargaan Dayasari, Kolej Kediaman Dayasari" (Head of Multimedia)', 3);

