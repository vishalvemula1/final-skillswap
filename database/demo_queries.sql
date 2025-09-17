-- Demo Queries for DBMS Faculty Presentation
-- These showcase complex queries, joins, and database features

USE skillswap;

-- 1. Find all Python teachers in Mumbai (Complex WHERE with JOINs)
SELECT 
    u.username,
    p.location,
    s.name as skill_name,
    us.experience_level
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
JOIN skills s ON us.skill_id = s.id
WHERE s.name = 'Python' 
AND p.location = 'Mumbai';

-- 2. Most popular skills by category with teacher counts
SELECT 
    c.name as category,
    s.name as skill,
    COUNT(us.user_id) as teacher_count,
    AVG(COALESCE(r.rating, 0)) as avg_rating
FROM categories c
JOIN skills s ON c.id = s.category_id
LEFT JOIN user_skills us ON s.id = us.skill_id AND us.can_teach = TRUE
LEFT JOIN swap_requests sr ON s.id = sr.requested_skill_id AND sr.status = 'completed'
LEFT JOIN reviews r ON sr.id = r.swap_request_id
GROUP BY c.id, s.id
ORDER BY teacher_count DESC, avg_rating DESC
LIMIT 10;

-- 3. User rankings by skills taught and average rating
SELECT 
    u.username,
    p.location,
    COUNT(us.skill_id) as skills_taught,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as total_reviews
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
LEFT JOIN reviews r ON u.id = r.to_user_id
GROUP BY u.id
HAVING skills_taught > 0
ORDER BY avg_rating DESC, skills_taught DESC;

-- 4. Skill swap activity by location
SELECT 
    p.location,
    COUNT(sr.id) as total_requests,
    COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as completed_swaps,
    COUNT(CASE WHEN sr.status = 'pending' THEN 1 END) as pending_requests,
    ROUND(
        COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) * 100.0 / COUNT(sr.id), 
        2
    ) as completion_rate
FROM profiles p
JOIN swap_requests sr ON (p.user_id = sr.from_user_id OR p.user_id = sr.to_user_id)
GROUP BY p.location
ORDER BY total_requests DESC;

-- 5. Skills most in demand (requested but few teachers)
SELECT 
    s.name as skill_name,
    c.name as category,
    COUNT(DISTINCT sr.id) as times_requested,
    COUNT(DISTINCT us.user_id) as available_teachers,
    CASE 
        WHEN COUNT(DISTINCT us.user_id) = 0 THEN 'High Demand - No Teachers'
        WHEN COUNT(DISTINCT sr.id) / COUNT(DISTINCT us.user_id) > 2 THEN 'High Demand'
        ELSE 'Normal Demand'
    END as demand_status
FROM skills s
JOIN categories c ON s.category_id = c.id
LEFT JOIN swap_requests sr ON s.id = sr.requested_skill_id
LEFT JOIN user_skills us ON s.id = us.skill_id AND us.can_teach = TRUE
GROUP BY s.id
ORDER BY times_requested DESC, available_teachers ASC;

-- 6. User compatibility matrix (who can teach what others want)
SELECT DISTINCT
    teacher.username as teacher,
    learner.username as learner,
    s.name as skill,
    teacher_skills.experience_level as teacher_level,
    p1.location as teacher_location,
    p2.location as learner_location
FROM auth_user teacher
JOIN user_skills teacher_skills ON teacher.id = teacher_skills.user_id AND teacher_skills.can_teach = TRUE
JOIN skills s ON teacher_skills.skill_id = s.id
JOIN user_skills learner_skills ON s.id = learner_skills.skill_id AND learner_skills.can_teach = FALSE
JOIN auth_user learner ON learner_skills.user_id = learner.id
JOIN profiles p1 ON teacher.id = p1.user_id
JOIN profiles p2 ON learner.id = p2.user_id
WHERE teacher.id != learner.id
ORDER BY teacher.username, learner.username;

-- 7. Monthly activity trends (using sample data timestamps)
SELECT 
    MONTH(created_at) as month,
    YEAR(created_at) as year,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM swap_requests
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;

-- 8. Complex aggregation: Category performance with ratings
SELECT 
    c.name as category,
    COUNT(DISTINCT s.id) as total_skills,
    COUNT(DISTINCT us.user_id) as total_teachers,
    COUNT(DISTINCT sr.id) as total_requests,
    AVG(r.rating) as avg_category_rating,
    COUNT(r.id) as total_reviews
FROM categories c
JOIN skills s ON c.id = s.category_id
LEFT JOIN user_skills us ON s.id = us.skill_id AND us.can_teach = TRUE
LEFT JOIN swap_requests sr ON s.id = sr.requested_skill_id
LEFT JOIN reviews r ON sr.id = r.swap_request_id
GROUP BY c.id
ORDER BY avg_category_rating DESC;