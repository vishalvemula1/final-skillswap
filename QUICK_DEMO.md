# SkillSwap - Quick DBMS Demo (2-3 minutes)

## INTRO (30 seconds)

**What is SkillSwap?**
"SkillSwap is a platform where people can teach and learn skills from each other. Want to learn guitar but can teach Python? Find someone who wants Python lessons and can teach guitar - then swap!"

**The Database:**
- MySQL database with 6 main tables
- Stores users, skills, categories, swap requests, and reviews
- Django web framework connects to MySQL to power the website

---

## PART 1: The Database (1 minute)

**Open MySQL terminal and run:**
```sql
USE skillswap;
SHOW TABLES;
```

**Say:** "Here's our MySQL database. The core tables are:"
- `skills` and `categories` - the skill catalog
- `profiles` and `user_skills` - user information
- `swap_requests` - exchange requests between users
- `reviews` - ratings after completed swaps

**Show one relationship:**
```sql
DESCRIBE skills;
```

**Point to screen:** "See `category_id`? That's a foreign key linking to the categories table. MySQL enforces these relationships automatically."

**Quick peek at the data:**
```sql
SELECT * FROM categories;
SELECT * FROM skills LIMIT 5;
```

**Say:** "We have 6 categories and 20 skills loaded. The foreign keys keep everything connected."

---

## PART 2: How Django Uses MySQL (30 seconds)

**Say:** "Django connects to MySQL using models - Python classes that map to database tables."

**Optional: Show one model file if needed** (backend/skillswap_app/models.py)

**Say:** "When someone browses skills on the website, Django queries MySQL with JOINs to get user profiles, ratings, and skill details - all in one query. No manual SQL needed."

---

## PART 3: The Website Demo (1 minute)

**Start the app** (should be running already):
```bash
# Backend: python manage.py runserver
# Frontend: npm start
```

**Open browser:** http://localhost:3000

**Quick tour:**
1. **Browse Skills page** - "Each skill shown here is a JOIN query across 4 tables - skills, users, profiles, and reviews"
2. **Click on a skill** - "This page queries the database to show who can teach this skill"
3. **Click on a user profile** - "Shows all their skills and ratings - all stored in MySQL and retrieved with foreign key relationships"
4. **Show My Requests** (if logged in) - "Swap requests are stored in the database with foreign keys linking users and skills"

**Say:** "Every action on this website - browsing, requesting swaps, leaving reviews - creates or reads from the MySQL database using foreign keys and JOINs."

---

## CLOSING (10 seconds)

**Key Takeaways:**
- MySQL database with proper foreign key relationships
- Django ORM handles all the SQL queries automatically
- Real-world application demonstrating relational database concepts

---

## Setup Beforehand

Make sure these are done BEFORE presenting:

```bash
# 1. Load the database
mysql -u root -p
CREATE DATABASE skillswap;
USE skillswap;
source database/schema.sql
source database/sample_data.sql

# 2. Start backend (Terminal 1)
cd backend
python manage.py runserver

# 3. Start frontend (Terminal 2)
cd frontend
npm start
```

Have these windows open:
- MySQL terminal (with `USE skillswap;` already run)
- Browser at http://localhost:3000
- Both servers running

---

## If Asked Technical Questions

**"How does Django connect to MySQL?"**
→ "settings.py has database config with host, port, username. Django uses PyMySQL driver."

**"What about transactions?"**
→ "Django wraps operations in transactions automatically. For example, creating a swap request updates multiple tables atomically."

**"Why MySQL?"**
→ "Relational data - users, skills, and requests all have relationships. Foreign keys enforce data integrity."

**"What about performance?"**
→ "We use indexes on foreign keys and frequently queried columns. Django's select_related() reduces query count."

---

## Person Assignments (Optional)

- **Person 1:** Intro + Database structure (show tables, explain relationships)
- **Person 2:** How Django uses it + start website demo
- **Person 3:** Finish website demo + closing
