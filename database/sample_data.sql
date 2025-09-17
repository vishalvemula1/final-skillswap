-- Sample Data for SkillSwap Demo
USE skillswap;

-- Insert categories
INSERT INTO categories (name, description) VALUES 
('Programming', 'Software development and coding skills'),
('Languages', 'Spoken languages and communication'),
('Music', 'Musical instruments and theory'),
('Arts & Crafts', 'Visual arts, painting, crafts'),
('Sports', 'Physical activities and sports'),
('Cooking', 'Culinary skills and cuisine types');

-- Insert skills
INSERT INTO skills (name, category_id, description) VALUES 
-- Programming
('Python', 1, 'Python programming language'),
('JavaScript', 1, 'JavaScript and web development'),
('React', 1, 'React.js framework'),
('Django', 1, 'Django web framework'),
('MySQL', 1, 'MySQL database management'),

-- Languages
('Spanish', 2, 'Spanish language conversation'),
('French', 2, 'French language and culture'),
('Mandarin', 2, 'Mandarin Chinese'),

-- Music
('Guitar', 3, 'Acoustic and electric guitar'),
('Piano', 3, 'Piano and keyboard'),
('Singing', 3, 'Vocal techniques'),

-- Arts & Crafts
('Photography', 4, 'Digital photography'),
('Painting', 4, 'Watercolor and acrylic painting'),
('Pottery', 4, 'Ceramic arts'),

-- Sports
('Tennis', 5, 'Tennis techniques and strategy'),
('Yoga', 5, 'Yoga poses and meditation'),
('Swimming', 5, 'Swimming strokes and techniques'),

-- Cooking
('Italian Cuisine', 6, 'Italian cooking and pasta'),
('Baking', 6, 'Bread and pastry baking'),
('Indian Cuisine', 6, 'Indian spices and dishes');

-- Insert user profiles (matching Django User IDs 1-8)
INSERT INTO profiles (user_id, bio, location, phone) VALUES 
(1, 'Full-stack developer passionate about teaching coding', 'Mumbai', '+91-9876543210'),
(2, 'Polyglot who loves sharing languages', 'Delhi', '+91-9876543211'),
(3, 'Professional musician and music teacher', 'Bangalore', '+91-9876543212'),
(4, 'Artist and photography enthusiast', 'Chennai', '+91-9876543213'),
(5, 'Fitness instructor and sports coach', 'Pune', '+91-9876543214'),
(6, 'Chef specializing in multiple cuisines', 'Hyderabad', '+91-9876543215'),
(7, 'Software engineer learning new skills', 'Mumbai', '+91-9876543216'),
(8, 'Student interested in skill exchange', 'Delhi', '+91-9876543217');

-- Insert user skills (who can teach what)
INSERT INTO user_skills (user_id, skill_id, can_teach, experience_level) VALUES 
-- User 1: Developer
(1, 1, TRUE, 'Advanced'), -- Python
(1, 4, TRUE, 'Advanced'), -- Django
(1, 5, TRUE, 'Intermediate'), -- MySQL

-- User 2: Language teacher  
(2, 6, TRUE, 'Advanced'), -- Spanish
(2, 7, TRUE, 'Intermediate'), -- French
(2, 8, TRUE, 'Beginner'), -- Mandarin

-- User 3: Musician
(3, 9, TRUE, 'Advanced'), -- Guitar
(3, 10, TRUE, 'Intermediate'), -- Piano
(3, 11, TRUE, 'Advanced'), -- Singing

-- User 4: Artist
(4, 12, TRUE, 'Advanced'), -- Photography
(4, 13, TRUE, 'Intermediate'), -- Painting

-- User 5: Fitness
(5, 15, TRUE, 'Advanced'), -- Tennis
(5, 16, TRUE, 'Advanced'), -- Yoga
(5, 17, TRUE, 'Intermediate'), -- Swimming

-- User 6: Chef
(6, 18, TRUE, 'Advanced'), -- Italian Cuisine
(6, 19, TRUE, 'Advanced'), -- Baking
(6, 20, TRUE, 'Advanced'), -- Indian Cuisine

-- User 7: Learning developer
(7, 2, TRUE, 'Intermediate'), -- JavaScript
(7, 3, TRUE, 'Beginner'), -- React

-- User 8: Student learning various
(8, 14, TRUE, 'Beginner'), -- Pottery
(8, 11, TRUE, 'Beginner'); -- Singing

-- Insert some skill swap requests
INSERT INTO swap_requests (from_user_id, to_user_id, requested_skill_id, offered_skill_id, message, status) VALUES 
(7, 1, 1, 2, 'Hi! I can teach JavaScript in exchange for Python lessons', 'accepted'),
(8, 3, 9, 14, 'Would love to learn guitar! I can teach pottery basics', 'pending'),
(1, 2, 6, 4, 'Interested in learning Spanish, can teach Django', 'accepted'),
(5, 4, 12, 16, 'Photography for yoga lessons?', 'completed'),
(8, 6, 18, NULL, 'Would love to learn Italian cooking!', 'pending');

-- Insert reviews (for completed swaps)
INSERT INTO reviews (from_user_id, to_user_id, swap_request_id, rating, comment) VALUES 
(5, 4, 4, 5, 'Amazing photography teacher! Very patient and knowledgeable.'),
(4, 5, 4, 5, 'Great yoga instructor. Learned so much in just a few sessions!');

-- Additional user skills for more realistic data
INSERT INTO user_skills (user_id, skill_id, can_teach, experience_level) VALUES 
(1, 12, FALSE, 'Beginner'), -- User 1 wants to learn Photography
(2, 10, FALSE, 'Beginner'), -- User 2 wants to learn Piano
(3, 1, FALSE, 'Beginner'), -- User 3 wants to learn Python
(4, 6, FALSE, 'Beginner'), -- User 4 wants to learn Spanish
(5, 18, FALSE, 'Beginner'), -- User 5 wants to learn Italian Cuisine
(6, 9, FALSE, 'Beginner'), -- User 6 wants to learn Guitar
(7, 16, FALSE, 'Beginner'), -- User 7 wants to learn Yoga
(8, 2, FALSE, 'Beginner'); -- User 8 wants to learn JavaScript