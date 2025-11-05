# DBMS Demo Cheat Sheet - Quick Reference

## Setup (Run Once)
```bash
mysql -u root -p
CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;
source /home/user/final-skillswap/database/schema.sql
source /home/user/final-skillswap/database/sample_data.sql
```

## What to Say & Show

### 1. Schema Overview (30 seconds)
```sql
SHOW TABLES;
DESCRIBE skills;
```
**Say**: "6 tables with foreign keys connecting users, skills, and exchanges"

---

### 2. Foreign Key Relationships (30 seconds)
```sql
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'skillswap' AND REFERENCED_TABLE_NAME IS NOT NULL;
```
**Say**: "Foreign keys enforce referential integrity - can't have orphaned data"

---

### 3. Simple JOIN Query (1 minute)
```sql
SELECT u.username, p.location, s.name as skill, us.experience_level
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
JOIN skills s ON us.skill_id = s.id
WHERE s.name = 'Python' AND p.location = 'Mumbai';
```
**Say**: "4-table JOIN to find Python teachers in Mumbai"

---

### 4. Aggregation with GROUP BY (1 minute)
```sql
SELECT u.username, p.location,
       COUNT(us.skill_id) as skills_taught,
       AVG(r.rating) as avg_rating,
       COUNT(r.id) as total_reviews
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
LEFT JOIN reviews r ON u.id = r.to_user_id
GROUP BY u.id
HAVING skills_taught > 0
ORDER BY avg_rating DESC;
```
**Say**: "Aggregation functions to rank users by ratings"

---

### 5. Database View (1 minute)
```sql
SELECT * FROM skill_popularity LIMIT 5;
SHOW CREATE VIEW skill_popularity;
```
**Say**: "Views encapsulate complex queries for reusability"

---

### 6. CASE Statement (1 minute)
```sql
SELECT s.name, c.name as category,
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
ORDER BY times_requested DESC;
```
**Say**: "CASE statements add business logic directly in SQL"

---

### 7. How App Uses It (1 minute)
```sql
SELECT sr.id, from_user.username, to_user.username,
       req_skill.name as requested, sr.status, sr.created_at
FROM swap_requests sr
JOIN auth_user from_user ON sr.from_user_id = from_user.id
JOIN auth_user to_user ON sr.to_user_id = to_user.id
JOIN skills req_skill ON sr.requested_skill_id = req_skill.id
ORDER BY sr.created_at DESC LIMIT 5;
```
**Say**: "Every swap request creates foreign key relationships between users and skills"

---

### 8. Constraints & Indexes (30 seconds)
```sql
SHOW INDEX FROM user_skills;
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'skillswap';
```
**Say**: "Indexes speed up queries, constraints ensure data quality"

---

## Key Points to Emphasize

✅ **Normalization**: No redundant data, proper 3NF design
✅ **Referential Integrity**: Foreign keys with CASCADE rules
✅ **Complex JOINs**: Multi-table queries with LEFT/INNER joins
✅ **Aggregations**: GROUP BY, HAVING, COUNT, AVG
✅ **Views**: Query reusability
✅ **Constraints**: UNIQUE, CHECK, NOT NULL enforce business rules
✅ **Indexes**: Strategic placement for performance
✅ **Real Application**: Actual web app using these queries

---

## If You Want to Show the Web App (Optional)

```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm start
```

Visit: http://localhost:3000
- Browse Skills page = Complex JOIN query
- Click skill = Foreign key navigation
- User profile = Multiple related tables

---

## Backup: If Something Breaks

**Reset database:**
```sql
DROP DATABASE skillswap;
CREATE DATABASE skillswap;
USE skillswap;
source /home/user/final-skillswap/database/schema.sql
source /home/user/final-skillswap/database/sample_data.sql
```

**All queries in one file:**
```bash
cat /home/user/final-skillswap/database/demo_queries.sql
```

Good luck! 🎓
