-- SkillSwap Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;

-- Categories for skills
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_name (name)
);

-- User profiles (extends Django's built-in User model)
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    bio TEXT,
    location VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location)
);

-- Many-to-many: Users and Skills they can teach
CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    can_teach BOOLEAN DEFAULT TRUE,
    experience_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user (user_id),
    INDEX idx_skill (skill_id),
    INDEX idx_can_teach (can_teach)
);

-- Skill swap requests
CREATE TABLE swap_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    requested_skill_id INT NOT NULL,
    offered_skill_id INT,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (offered_skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_status (status),
    INDEX idx_requested_skill (requested_skill_id)
);

-- Reviews and ratings after skill swaps
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    swap_request_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (swap_request_id) REFERENCES swap_requests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (from_user_id, swap_request_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_rating (rating),
    INDEX idx_swap_request (swap_request_id)
);

-- Create views for complex queries (demo purposes)

-- View: Skills with categories and teacher counts
CREATE VIEW skill_popularity AS
SELECT 
    s.id,
    s.name as skill_name,
    c.name as category_name,
    COUNT(us.user_id) as teacher_count,
    AVG(r.rating) as avg_rating
FROM skills s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN user_skills us ON s.id = us.skill_id AND us.can_teach = TRUE
LEFT JOIN swap_requests sr ON s.id = sr.requested_skill_id AND sr.status = 'completed'
LEFT JOIN reviews r ON sr.id = r.swap_request_id
GROUP BY s.id, s.name, c.name;

-- View: User profiles with skill counts and ratings
CREATE VIEW user_summary AS
SELECT 
    p.user_id,
    p.location,
    COUNT(us.skill_id) as skills_count,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT r.id) as reviews_received
FROM profiles p
LEFT JOIN user_skills us ON p.user_id = us.user_id AND us.can_teach = TRUE
LEFT JOIN reviews r ON p.user_id = r.to_user_id
GROUP BY p.user_id, p.location;