# SkillSwap - MySQL Database Demo Guide

## Quick 10-Minute DBMS Demo

### 1. Introduction (1 minute)
**SkillSwap** is a skill-exchange platform where users can teach and learn skills from each other.

**Database:** MySQL with 6 core tables demonstrating:
- Foreign key relationships and referential integrity
- Many-to-many relationships
- Complex JOINs and aggregations
- Views for query reusability
- Indexes for optimization

---

## 2. Database Setup (2 minutes)

### Start MySQL and Load Database
```bash
# Start MySQL (if not running)
sudo service mysql start

# Login to MySQL
mysql -u root -p

# Create and use database
CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;

# Load the schema
source /home/user/final-skillswap/database/schema.sql

# Load sample data
source /home/user/final-skillswap/database/sample_data.sql
```

### Verify Tables
```sql
SHOW TABLES;
```

You should see:
- `categories`, `skills` (skill catalog)
- `profiles`, `user_skills` (user data)
- `swap_requests`, `reviews` (transactions)
- `auth_user` (Django built-in)

---

## 3. Database Schema Overview (2 minutes)

### View Table Relationships
```sql
-- Show the Skills table structure (foreign keys)
DESCRIBE skills;

-- Show foreign key constraints
SELECT
    TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'skillswap'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Key Relationships:
1. **Skills → Categories** (Many-to-One): Each skill belongs to one category
2. **UserSkills → Users & Skills** (Many-to-Many): Users can teach/learn multiple skills
3. **SwapRequests**: Links users through skill exchanges
4. **Reviews → SwapRequests**: One review per completed swap (enforced by UNIQUE constraint)

---

## 4. Core Database Queries Demo (4 minutes)

### Query 1: Basic JOIN - Find Python Teachers in Mumbai
```sql
SELECT
    u.username,
    p.location,
    s.name as skill_name,
    us.experience_level
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
JOIN skills s ON us.skill_id = s.id
WHERE s.name = 'Python' AND p.location = 'Mumbai';
```

**DBMS Concepts:** Multi-table JOIN, boolean filtering, column aliasing

---

### Query 2: Aggregation - User Statistics
```sql
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
GROUP BY u.id, u.username, p.location
HAVING skills_taught > 0
ORDER BY avg_rating DESC, skills_taught DESC;
```

**DBMS Concepts:** LEFT JOIN, GROUP BY, HAVING, aggregate functions (COUNT, AVG), ORDER BY

---

### Query 3: Complex View - Skill Popularity
```sql
-- Use the pre-created view
SELECT * FROM skill_popularity
ORDER BY teacher_count DESC, avg_rating DESC
LIMIT 10;

-- Show how the view is defined
SHOW CREATE VIEW skill_popularity;
```

**DBMS Concepts:** Views, LEFT JOINs, aggregations, query reusability

---

### Query 4: CASE Statement - Demand Analysis
```sql
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
GROUP BY s.id, s.name, c.name
ORDER BY times_requested DESC;
```

**DBMS Concepts:** CASE expressions, business logic in SQL, conditional aggregation

---

### Query 5: User Compatibility (Self-JOIN Pattern)
```sql
SELECT DISTINCT
    teacher.username as teacher,
    learner.username as learner,
    s.name as skill,
    teacher_skills.experience_level,
    p1.location as teacher_location,
    p2.location as learner_location
FROM auth_user teacher
JOIN user_skills teacher_skills ON teacher.id = teacher_skills.user_id
                                 AND teacher_skills.can_teach = TRUE
JOIN skills s ON teacher_skills.skill_id = s.id
JOIN user_skills learner_skills ON s.id = learner_skills.skill_id
                                 AND learner_skills.can_teach = FALSE
JOIN auth_user learner ON learner_skills.user_id = learner.id
JOIN profiles p1 ON teacher.id = p1.user_id
JOIN profiles p2 ON learner.id = p2.user_id
WHERE teacher.id != learner.id
LIMIT 10;
```

**DBMS Concepts:** Self-joins, complex filtering, matching algorithms

---

## 5. How the Application Uses the Database (1 minute)

### Check a Real Application Query
```sql
-- Example: What happens when a user sends a swap request?
-- The application creates a record with foreign key references:

SELECT
    sr.id,
    from_user.username as from_user,
    to_user.username as to_user,
    req_skill.name as requested_skill,
    off_skill.name as offered_skill,
    sr.status,
    sr.message,
    sr.created_at
FROM swap_requests sr
JOIN auth_user from_user ON sr.from_user_id = from_user.id
JOIN auth_user to_user ON sr.to_user_id = to_user.id
JOIN skills req_skill ON sr.requested_skill_id = req_skill.id
LEFT JOIN skills off_skill ON sr.offered_skill_id = off_skill.id
ORDER BY sr.created_at DESC
LIMIT 5;
```

### Show Referential Integrity
```sql
-- Try to delete a skill that's being used (will fail due to foreign key)
-- DELETE FROM skills WHERE id = 1;
-- Error: Cannot delete or update a parent row: a foreign key constraint fails

-- Show what happens when a user is deleted (CASCADE)
SELECT * FROM user_skills WHERE user_id = 1;
-- If user 1 is deleted, all their user_skills automatically delete (CASCADE)
```

---

## 6. Advanced Features (Bonus if time allows)

### Indexes for Performance
```sql
-- Show indexes on user_skills table
SHOW INDEX FROM user_skills;
```

**Indexes created:**
- `idx_user` - Fast lookups by user
- `idx_skill` - Fast lookups by skill
- `idx_can_teach` - Filter teachers quickly

### Constraints Enforced
```sql
-- Unique constraint: Users can't have duplicate skills
DESCRIBE user_skills;

-- Check constraint: Ratings must be 1-5
DESCRIBE reviews;

-- Show the constraint
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'skillswap';
```

---

## 7. Quick Web Demo (Optional - 30 seconds)

If you want to briefly show the web interface:

```bash
# Terminal 1 - Start Backend
cd /home/user/final-skillswap/backend
python manage.py runserver

# Terminal 2 - Start Frontend
cd /home/user/final-skillswap/frontend
npm start
```

Then just show:
1. Browse skills page (showing the JOIN query results)
2. Click a skill to see details (demonstrating foreign key navigation)
3. Show a user profile (multiple related tables)

---

## Key DBMS Concepts Demonstrated

✅ **Schema Design**: 6 normalized tables with proper relationships
✅ **Foreign Keys**: Referential integrity with CASCADE/SET NULL
✅ **Constraints**: UNIQUE, CHECK, NOT NULL
✅ **Indexes**: Strategic indexes on foreign keys and filter columns
✅ **JOINs**: INNER, LEFT, self-joins
✅ **Aggregation**: COUNT, AVG, GROUP BY, HAVING
✅ **Views**: Query reusability and abstraction
✅ **Complex Queries**: CASE statements, subqueries, conditional logic
✅ **Data Integrity**: Transaction handling, constraint enforcement

---

## Files to Reference

- **Schema**: `/home/user/final-skillswap/database/schema.sql`
- **Sample Data**: `/home/user/final-skillswap/database/sample_data.sql`
- **Demo Queries**: `/home/user/final-skillswap/database/demo_queries.sql`
- **Application Code**: `/home/user/final-skillswap/backend/skillswap_app/views.py`

---

## Talking Points for Faculty

1. **Real-world Application**: Solves actual problem of skill exchange
2. **Proper Normalization**: No data redundancy, proper 3NF structure
3. **Integrity Constraints**: Enforces business rules at database level
4. **Performance**: Strategic indexes, optimized queries
5. **Scalability**: Views and indexes prepared for growth
6. **Best Practices**: Foreign keys, proper data types, meaningful naming

Good luck with your demo! 🎓
