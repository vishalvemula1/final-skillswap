# SkillSwap MySQL Demo (3-4 minutes)

**What it is:** Skill exchange platform using MySQL database

---

## Setup (Do this before presenting)

```bash
mysql -u root -p
CREATE DATABASE skillswap;
USE skillswap;
source database/schema.sql
source database/sample_data.sql
```

---

## PERSON 1: Database Schema (1 minute)

**Show the tables:**
```sql
SHOW TABLES;
```

**Explain:** "We have 6 tables - users, skills, categories, swap requests, and reviews"

**Show relationships:**
```sql
DESCRIBE skills;
```

**Point out:** `category_id` is a foreign key to categories table

**Show all foreign keys:**
```sql
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'skillswap'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Say:** "Foreign keys enforce referential integrity - skills must have valid categories, swap requests must reference real users"

---

## PERSON 2: Database Queries (1.5 minutes)

**Query 1: Simple JOIN - Find Python teachers**
```sql
SELECT u.username, p.location, s.name as skill, us.experience_level
FROM auth_user u
JOIN profiles p ON u.id = p.user_id
JOIN user_skills us ON u.id = us.user_id
JOIN skills s ON us.skill_id = s.id
WHERE s.name = 'Python' AND us.can_teach = TRUE;
```

**Say:** "Multi-table JOIN to find who can teach Python"

**Query 2: Aggregation - User rankings**
```sql
SELECT u.username,
       COUNT(us.skill_id) as skills_taught,
       AVG(r.rating) as avg_rating
FROM auth_user u
JOIN user_skills us ON u.id = us.user_id AND us.can_teach = TRUE
LEFT JOIN reviews r ON u.id = r.to_user_id
GROUP BY u.id
ORDER BY avg_rating DESC;
```

**Say:** "GROUP BY and aggregation functions to rank users by ratings"

---

## PERSON 3: Real Application Usage (1 minute)

**Show actual swap requests:**
```sql
SELECT
    from_user.username as sender,
    to_user.username as receiver,
    req_skill.name as requested_skill,
    sr.status
FROM swap_requests sr
JOIN auth_user from_user ON sr.from_user_id = from_user.id
JOIN auth_user to_user ON sr.to_user_id = to_user.id
JOIN skills req_skill ON sr.requested_skill_id = req_skill.id;
```

**Say:** "When users request skill swaps, it creates foreign key relationships linking users and skills"

**Show a constraint:**
```sql
SHOW INDEX FROM user_skills;
```

**Say:** "We use indexes for performance and UNIQUE constraints so users can't add the same skill twice"

---

## Key Points (mention throughout)

✅ **6 normalized tables** with foreign key relationships
✅ **Referential integrity** enforced by database
✅ **JOINs** to combine data from multiple tables
✅ **Aggregations** (COUNT, AVG) for analytics
✅ **Constraints & indexes** for data quality and performance

---

## If Demo Breaks

**Reset:**
```sql
DROP DATABASE skillswap;
CREATE DATABASE skillswap;
USE skillswap;
source database/schema.sql
source database/sample_data.sql
```

**All demo queries:** `/home/user/final-skillswap/database/demo_queries.sql`
