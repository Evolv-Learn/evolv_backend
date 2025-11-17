# Evolv Learning Platform - API Documentation

Base URL: `http://localhost:8000/api/v1/`

## 📚 Table of Contents
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Student Endpoints](#student-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Models Overview](#models-overview)

---

## 🔐 Authentication

### Register New User
```http
POST /api/v1/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "message": "Login successful!",
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🌐 Public Endpoints (No Authentication Required)

### Get All Courses
```http
GET /api/v1/courses/
Query Parameters:
  - category: Filter by category (Data & AI, Cybersecurity, Microsoft Dynamics 365)
  - search: Search in name, description, software_tools
  - ordering: Sort by name, created_at, instructor
  - page: Page number (default: 1)
  - page_size: Items per page (default: 20)

Response: 200 OK
{
  "count": 10,
  "next": "http://localhost:8000/api/v1/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Data Science Fundamentals",
      "category": "Data & AI",
      "description": "Learn the basics of data science...",
      "software_tools": "Python, Pandas, NumPy, Scikit-learn",
      "instructor": "Jane Smith",
      "locations": ["Lagos Campus", "Online - Nigeria"],
      "partners": ["Microsoft", "Google"],
      "parent": null,
      "parent_id": null,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Course Details
```http
GET /api/v1/courses/{id}/

Response: 200 OK
{
  "id": 1,
  "name": "Data Science Fundamentals",
  "category": "Data & AI",
  "description": "Learn the basics of data science...",
  "software_tools": "Python, Pandas, NumPy, Scikit-learn",
  "instructor": "Jane Smith",
  "locations": ["Lagos Campus", "Online - Nigeria"],
  "partners": ["Microsoft", "Google"],
  "parent": null,
  "parent_id": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get All Events
```http
GET /api/v1/events/
Query Parameters:
  - is_virtual: Filter by virtual/physical events
  - search: Search in title, description
  - ordering: Sort by date, title

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "AI Workshop 2024",
      "description": "Hands-on workshop on AI fundamentals",
      "date": "2024-03-20T14:00:00Z",
      "is_virtual": false,
      "location": "Lagos Campus",
      "course": "Data Science Fundamentals",
      "partners": ["Microsoft"],
      "image": "http://localhost:8000/media/events/workshop.jpg"
    }
  ]
}
```

### Get About Us
```http
GET /api/v1/about-us/

Response: 200 OK
{
  "id": 1,
  "title": "About EvolvLearn",
  "description": "We empower learners with practical tech skills.",
  "mission": "To provide accessible, high-quality tech education...",
  "vision": "A world where everyone has access to tech education...",
  "created_at": "2024-01-01T00:00:00Z",
  "image": "http://localhost:8000/media/about/hero.jpg"
}
```

### Get Team Members
```http
GET /api/v1/team-members/

Response: 200 OK
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "about_us": 1,
      "name": "John Doe",
      "role": "CEO & Founder",
      "image": "http://localhost:8000/media/team_images/john.jpg",
      "bio": "Passionate about tech education...",
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe",
      "core_values": [1, 2]
    }
  ]
}
```

### Get Alumni Success Stories
```http
GET /api/v1/alumni/
Query Parameters:
  - graduation_year: Filter by year
  - course: Filter by course ID
  - search: Search in username, position, story

Response: 200 OK
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "username": "alumni1",
        "first_name": "Alice",
        "last_name": "Johnson",
        "email": "alice@example.com"
      },
      "graduation_year": 2023,
      "current_position": "Data Scientist at Google",
      "success_story": "After completing the Data Science course...",
      "course": "Data Science Fundamentals",
      "location": "Lagos Campus"
    }
  ]
}
```

### Get Reviews/Testimonials
```http
GET /api/v1/reviews/
Query Parameters:
  - rating: Filter by rating (1-5)
  - course: Filter by course ID

Response: 200 OK
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "about_us": 1,
      "name": "Sarah Williams",
      "review_text": "Best learning experience ever!",
      "course": "Data Science Fundamentals",
      "alumni": null,
      "rating": 5,
      "created_at": "2024-02-10T15:30:00Z"
    }
  ]
}
```

### Submit Contact Form
```http
POST /api/v1/contact-us/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your Data Science course..."
}

Response: 201 Created
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your Data Science course..."
}
```

### Get Locations
```http
GET /api/v1/locations/
Query Parameters:
  - location_type: Filter by Campus or Online
  - country: Filter by country
  - online_region: Filter by online region

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Lagos Campus",
      "location_type": "Campus",
      "online_region": null,
      "country": "Nigeria",
      "state": "Lagos"
    },
    {
      "id": 2,
      "name": "Online - Nigeria",
      "location_type": "Online",
      "online_region": "Nigeria",
      "country": null,
      "state": null
    }
  ]
}
```

---

## 👨‍🎓 Student Endpoints (Authentication Required)

### Get My Profile
```http
GET /api/v1/profile/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "role": "Student",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

### Update My Profile
```http
PATCH /api/v1/profile/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "Jonathan",
  "last_name": "Doe"
}

Response: 200 OK
```

### Submit Student Application
```http
POST /api/v1/students/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "john@example.com",
  "phone": "+2348012345678",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "Male",
  "birth_date": "1995-05-15",
  "zip_code": "100001",
  "country_of_birth": "NG",
  "nationality": "NG",
  "diploma_level": "Bachelor",
  "job_status": "Employed",
  "motivation": "I want to transition into tech...",
  "future_goals": "Become a data scientist...",
  "proudest_moment": "Graduated with honors...",
  "english_level": 4,
  "how_heard": "Social Media",
  "referral_person": "",
  "has_laptop": true,
  "courses": [1, 2],
  "schedules": [1]
}

Response: 201 Created
```

### Get My Student Profile
```http
GET /api/v1/students/me/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "email": "john@example.com",
  "phone": "+2348012345678",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "Male",
  "birth_date": "1995-05-15",
  "courses": ["Data Science Fundamentals", "Machine Learning"],
  "schedules": ["Data Science - Jan 2024"],
  ...
}
```

### Get My Dashboard
```http
GET /api/v1/students/me/dashboard/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "profile": { ... },
  "application_status": "approved",
  "selection_progress": {
    "total_steps": 3,
    "completed_steps": 3,
    "steps": [...]
  },
  "enrolled_schedules": [...],
  "upcoming_events": [...],
  "learning_materials": {
    "github": "https://github.com/your-org/learning-materials",
    "discord": "https://discord.gg/your-invite",
    "message": "Access granted"
  }
}
```

### Check Application Status
```http
GET /api/v1/students/me/application-status/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "approved",
  "message": "Congratulations! Your application has been approved.",
  "progress": {
    "total_steps": 3,
    "completed_steps": 3,
    "percentage": 100
  },
  "steps": [...]
}
```

### Enroll in Schedule
```http
POST /api/v1/students/me/enroll/{schedule_id}/
Authorization: Bearer {access_token}

Response: 201 Created
{
  "message": "Successfully enrolled in the schedule!",
  "schedule": {
    "id": 1,
    "course": "Data Science Fundamentals",
    "start_date": "2024-03-01",
    "end_date": "2024-06-30",
    "location": "Lagos Campus"
  }
}
```

### Get Learning Materials
```http
GET /api/v1/students/me/learning-materials/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "access_granted": true,
  "message": "You have access to all learning materials!",
  "materials": {
    "github": {
      "url": "https://github.com/your-org/learning-materials",
      "description": "Access course code, projects, and resources"
    },
    "discord": {
      "url": "https://discord.gg/your-invite",
      "description": "Join our community and get support"
    },
    "video_materials": {
      "url": "https://youtube.com/playlist/your-playlist",
      "description": "Watch video tutorials and lectures"
    }
  }
}
```

### Get My Courses
```http
GET /api/v1/students/me/courses/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Data Science Fundamentals",
    "category": "Data & AI",
    ...
  }
]
```

### Get My Events
```http
GET /api/v1/students/me/events/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "title": "AI Workshop 2024",
    "date": "2024-03-20T14:00:00Z",
    ...
  }
]
```

---

## 👨‍💼 Admin Endpoints (Admin Authentication Required)

### Get Admin Dashboard
```http
GET /api/v1/admin/dashboard/
Authorization: Bearer {admin_access_token}

Response: 200 OK
{
  "students": {
    "total": 150,
    "pending_applications": 25,
    "approved": 125
  },
  "courses": {
    "active": 8,
    "subcourses": 15,
    "total": 23
  },
  "events": {
    "upcoming": 3,
    "past": 12,
    "total": 15
  },
  "schedules": {
    "active": 5
  },
  "alumni": {
    "total": 50
  },
  "reviews": {
    "total": 100,
    "average_rating": 4.5
  }
}
```

### Get All User Profiles
```http
GET /api/v1/admin/profiles/
Authorization: Bearer {admin_access_token}
Query Parameters:
  - role: Filter by Student, Instructor, Alumni
  - search: Search in username, email, name

Response: 200 OK
{
  "count": 200,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "role": "Student"
    }
  ]
}
```

### Update User Profile
```http
PATCH /api/v1/admin/users/{user_id}/profile/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "role": "Instructor"
}

Response: 200 OK
```

### Create Course
```http
POST /api/v1/courses/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "name": "Advanced Machine Learning",
  "category": "Data & AI",
  "description": "Deep dive into ML algorithms...",
  "software_tools": "Python, TensorFlow, PyTorch",
  "instructor": 2,
  "locations": [1, 2],
  "partners": [1],
  "parent": 1
}

Response: 201 Created
```

### Create Event
```http
POST /api/v1/events/
Authorization: Bearer {admin_access_token}
Content-Type: multipart/form-data

{
  "title": "Tech Career Fair 2024",
  "description": "Meet potential employers...",
  "date": "2024-04-15T10:00:00Z",
  "is_virtual": false,
  "location": 1,
  "course": 1,
  "partners": [1, 2],
  "image": <file>
}

Response: 201 Created
```

### Manage Student Selection
```http
POST /api/v1/student-selection/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "student": 1,
  "step": 1,
  "status": "Completed"
}

Response: 201 Created
```

### Get All Students
```http
GET /api/v1/students/
Authorization: Bearer {admin_access_token}
Query Parameters:
  - search: Search in name, email
  - courses: Filter by course ID
  - diploma_level: Filter by education level

Response: 200 OK
{
  "count": 150,
  "results": [...]
}
```

---

## 📊 Models Overview

### User Roles
- **Student**: Can apply, view courses, attend events
- **Instructor**: Can teach courses, manage schedules
- **Alumni**: Former students with success stories

### Course Hierarchy
- **Parent Course**: Main course (e.g., "Data & AI")
- **Subcourse**: Specific topics (e.g., "Machine Learning", "Data Analysis")

### Student Journey
1. Register account → Creates User + Profile
2. Submit application → Creates Student record
3. Admin reviews → Updates StudentSelection
4. If approved → Access to learning materials
5. Enroll in schedule → Added to LearningSchedule
6. Complete course → Becomes Alumni

### Location Types
- **Campus**: Physical location (requires country/state)
- **Online**: Virtual learning (requires online_region)

---

## 🔧 Useful Query Parameters

### Filtering
```
?category=Data & AI
?location_type=Online
?is_virtual=true
?graduation_year=2023
```

### Searching
```
?search=python
?search=data science
```

### Ordering
```
?ordering=name
?ordering=-created_at  (descending)
?ordering=graduation_year,-rating
```

### Pagination
```
?page=2
?page_size=50
```

---

## 📝 Notes

1. **Authentication**: Most endpoints require JWT token in Authorization header
2. **Permissions**: 
   - Public: GET courses, events, about, alumni, reviews
   - Authenticated: Student profile, applications, enrollment
   - Admin: All POST/PUT/PATCH/DELETE operations
3. **Rate Limiting**: Implemented on registration, login, and contact forms
4. **File Uploads**: Events and team members support image uploads
5. **Swagger UI**: Full interactive API docs at `/api/docs/`

---

## 🚀 Quick Start

1. Register a new user account
2. Login to get access token
3. Submit student application
4. Wait for admin approval
5. Access learning materials
6. Enroll in courses
7. Attend events

For more details, visit the Swagger documentation at: `http://localhost:8000/api/docs/`
