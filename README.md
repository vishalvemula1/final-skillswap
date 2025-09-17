# SkillSwap - Full Stack Web Application

A complete skill exchange platform built with React, Django, and MySQL. Users can teach and learn skills through a structured exchange system.

## 🏗️ Architecture Overview

- **Frontend**: React 18 with functional components and hooks
- **Backend**: Django 4.2 with MySQL database
- **Database**: MySQL with complex relationships and sample data

## 📁 Project Structure

```
skillswap/
├── README.md                          # This file
├── database/
│   ├── schema.sql                     # Database schema with tables and views
│   ├── sample_data.sql               # Sample data for demo
│   └── demo_queries.sql              # Complex queries for DBMS presentation
├── backend/
│   ├── manage.py                      # Django management script
│   ├── requirements.txt               # Python dependencies
│   ├── skillswap_project/            # Django project
│   │   ├── settings.py               # Database & CORS config
│   │   ├── urls.py                   # Main URL routing
│   │   └── wsgi.py                   # WSGI application
│   └── skillswap_app/                # Django app
│       ├── models.py                 # Database models
│       ├── views.py                  # API endpoints
│       ├── urls.py                   # App URL routing
│       ├── admin.py                  # Admin interface
│       └── apps.py                   # App configuration
└── frontend/
    ├── package.json                   # React dependencies
    ├── public/
    │   └── index.html                # Main HTML template
    └── src/
        ├── index.js                  # React entry point
        ├── App.js                    # Main app component
        ├── App.css                   # All styling
        └── components/               # React components
            ├── Login.js              # Authentication
            ├── Dashboard.js          # User dashboard
            ├── BrowseSkills.js       # Skill browsing
            ├── MyRequests.js         # Request management
            └── Profile.js            # Profile management
```

## 🚀 Setup Instructions

### 1. Database Setup (MySQL)

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE skills;
USE skills;

# Run schema
SOURCE database/schema.sql;

# Add sample data
SOURCE database/sample_data.sql;

# Test with demo queries
SOURCE database/demo_queries.sql;
```

### 2. Backend Setup (Django)

```bash
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update database settings in skillswap_project/settings.py
# Change database name, user, and password as needed

# Create Django tables
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser

# Run Django server
python manage.py runserver
```

### 3. Frontend Setup (React)

```bash
cd frontend/

# Install dependencies
npm install

# Start React development server
npm start
```

## 🎯 Demo Flow for Faculty

### 1. Database Demo (DBMS Faculty)

Show `database/demo_queries.sql` running:

1. **Complex Joins**: Find Python teachers in Mumbai
2. **Aggregations**: Most popular skills by category with ratings
3. **Subqueries**: Skills most in demand vs available teachers
4. **Views**: User compatibility matrix for skill matching

### 2. Backend Demo (Django Faculty)

Show `backend/skillswap_app/`:

1. **Models**: Complex relationships (Many-to-Many, Foreign Keys)
2. **Views**: JSON API endpoints with authentication
3. **Admin**: Django admin interface for data management
4. **Integration**: MySQL connection with proper indexing

### 3. Frontend Demo (React Faculty)

Show `frontend/src/components/`:

1. **Components**: Functional components with hooks
2. **State Management**: useState and useEffect patterns
3. **API Integration**: Fetch calls to Django backend
4. **UI/UX**: Clean, responsive design

## 🔧 Key Features Implemented

### Authentication & Users
- User registration and login
- Profile management with bio, location, phone
- Session-based authentication

### Skills Management
- Categorized skill system (Programming, Languages, Music, etc.)
- Users can teach or learn multiple skills
- Experience levels (Beginner, Intermediate, Advanced)

### Skill Exchange System
- Browse available skills by category/location
- Send skill exchange requests with messages
- Accept/reject/complete request workflow
- Rating system after completed exchanges

### Database Features
- Complex relationships with proper indexing
- Sample data with realistic scenarios
- Advanced queries showcasing database capabilities

## 🎨 Technical Highlights

### Frontend
- Single-page application with component-based navigation
- Responsive design with clean CSS
- Form validation and error handling
- Modal components for user interactions

### Backend
- RESTful API design with JSON responses
- Django ORM with complex queries
- CORS configuration for React integration
- Comprehensive error handling

### Database
- Normalized schema with proper relationships
- Indexes for performance optimization
- Views for complex data aggregation
- Sample data representing real-world scenarios

## 🧪 Testing & Demo Users

Create test users or use sample data:
- Admin user for backend management
- Multiple test users with different skills
- Sample requests in various states

## 📊 Database Queries for Demo

The `demo_queries.sql` file contains 8 complex queries that demonstrate:
- Multi-table joins
- Aggregate functions
- Subqueries
- Window functions
- Data analysis capabilities

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Profile
- `GET /api/profile/` - Get user profile
- `POST /api/profile/update/` - Update profile
- `POST /api/profile/add-skill/` - Add skill to profile

### Skills
- `GET /api/categories/` - Get all categories
- `GET /api/skills/` - Get skills with filters
- `GET /api/skills/browse/` - Browse skills with teachers

### Requests
- `GET /api/requests/` - Get user's requests
- `POST /api/requests/send/` - Send skill request
- `POST /api/requests/{id}/update/` - Update request status

## 💡 Faculty Presentation Points

### DBMS Faculty
- Showcase complex schema design
- Demonstrate query optimization with indexes
- Show data integrity with foreign key constraints
- Present real-world data analysis queries

### Backend Faculty
- Explain Django MVC architecture
- Show API design and JSON responses
- Demonstrate ORM usage and raw SQL integration
- Present authentication and session management

### Frontend Faculty
- Show modern React patterns (hooks, functional components)
- Demonstrate responsive design principles
- Present component reusability and state management
- Show API integration and error handling

## 🚀 Future Enhancements

- Real-time messaging system
- Advanced matching algorithm
- Mobile responsive optimizations
- Email notifications
- File upload for skill demonstrations
- Advanced search with filters

---

**Note**: This is a demo application. For production use, additional security measures, error handling, and optimization would be required.