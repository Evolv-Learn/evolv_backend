# Quick Start Guide - Evolv Learning Platform

## 🎯 What You Have

You've built a comprehensive learning platform with:
- ✅ **Backend API**: Django REST Framework with 30+ endpoints
- ✅ **Authentication**: JWT-based auth with user registration
- ✅ **Database**: PostgreSQL with 15+ models
- ✅ **Documentation**: Swagger UI for API testing
- ✅ **Figma Design**: UI/UX design ready for frontend development

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd evolv_backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env and update:
# - DJANGO_SECRET_KEY (generate new one)
# - DB_PASSWORD (your PostgreSQL password)
```

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb evolv_db

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

### 4. Start Server
```bash
python manage.py runserver
```

### 5. Test API
Visit: http://localhost:8000/api/docs/

## 📱 Test the API Flow

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/v1/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

Save the `access` token from the response.

### 3. Get Courses (Public)
```bash
curl http://localhost:8000/api/v1/courses/
```

### 4. Submit Student Application (Authenticated)
```bash
curl -X POST http://localhost:8000/api/v1/students/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+2348012345678",
    "first_name": "Test",
    "last_name": "User",
    "gender": "Male",
    "birth_date": "1995-05-15",
    "zip_code": "100001",
    "country_of_birth": "NG",
    "nationality": "NG",
    "diploma_level": "Bachelor",
    "job_status": "Student",
    "motivation": "I want to learn tech skills",
    "future_goals": "Become a developer",
    "proudest_moment": "Graduated university",
    "english_level": 4,
    "how_heard": "Social Media",
    "has_laptop": true,
    "courses": [],
    "schedules": []
  }'
```

### 5. Check Dashboard
```bash
curl http://localhost:8000/api/v1/students/me/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎨 Frontend Development

### Recommended Stack
- **React + Next.js** (recommended for SEO)
- **Vue + Nuxt** (alternative)
- **Tailwind CSS** (styling)
- **Axios** (API calls)
- **React Query** or **SWR** (data fetching)

### Key Pages to Build

1. **Public Pages** (No Auth)
   - Home (`/`)
   - Courses (`/courses`)
   - Course Detail (`/courses/:id`)
   - Events (`/events`)
   - About Us (`/about`)
   - Alumni (`/alumni`)
   - Contact (`/contact`)

2. **Auth Pages**
   - Login (`/login`)
   - Register (`/register`)
   - Password Reset (`/reset-password`)

3. **Student Dashboard** (Auth Required)
   - Dashboard (`/dashboard`)
   - My Profile (`/dashboard/profile`)
   - My Courses (`/dashboard/courses`)
   - Application Status (`/dashboard/application`)
   - Learning Materials (`/dashboard/materials`)

4. **Admin Dashboard** (Admin Only)
   - Admin Home (`/admin/dashboard`)
   - Applications (`/admin/applications`)
   - Students (`/admin/students`)
   - Courses (`/admin/courses`)
   - Events (`/admin/events`)

### Sample React Component

```jsx
// src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/courses/')
      .then(res => {
        setCourses(res.data.results);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="courses-page">
      <h1>Our Courses</h1>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h2>{course.name}</h2>
            <p>{course.category}</p>
            <p>{course.description}</p>
            <button>Learn More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
```

## 🔧 Admin Setup

### 1. Login to Admin Panel
Visit: http://localhost:8000/admin/
Login with your superuser credentials

### 2. Create Initial Data

**Create Locations:**
- Name: "Lagos Campus"
- Type: Campus
- Country: Nigeria
- State: Lagos

**Create Partners:**
- Name: "Microsoft"
- Description: "Technology partner"
- Website: "https://microsoft.com"

**Create Course:**
- Name: "Data Science Fundamentals"
- Category: "Data & AI"
- Description: "Learn data science basics"
- Software Tools: "Python, Pandas, NumPy"
- Locations: [Lagos Campus]
- Partners: [Microsoft]

**Create Event:**
- Title: "Tech Workshop 2024"
- Description: "Hands-on workshop"
- Date: [Future date]
- Location: Lagos Campus
- Is Virtual: No

**Create Selection Procedure:**
- Step Name: "Application Review"
- Description: "Initial application review"
- Order: 1

### 3. Test Student Flow

1. Register as a student (via API or frontend)
2. Submit student application
3. As admin, review application in admin panel
4. Create StudentSelection record with "Completed" status
5. Student can now access learning materials

## 📊 Database Schema Overview

```
CustomUser (Django User)
  ↓
Profile (role: Student/Instructor/Alumni)
  ↓
Student (detailed application data)
  ↓
StudentSelection (application progress)
  ↓
LearningSchedule (enrolled schedules)
  ↓
Module → Lesson (course content)
```

## 🎯 Next Steps

### Phase 1: Critical Fixes (Do First)
1. ✅ Review security settings in `.env`
2. ✅ Add email configuration for notifications
3. ✅ Test all API endpoints in Swagger
4. ✅ Create sample data in admin panel

### Phase 2: Frontend Development
1. ✅ Set up frontend project (React/Vue)
2. ✅ Implement authentication flow
3. ✅ Build public pages (home, courses, events)
4. ✅ Build student dashboard
5. ✅ Build admin dashboard

### Phase 3: Enhancements
1. ✅ Add email notifications
2. ✅ Implement file uploads for student documents
3. ✅ Add progress tracking
4. ✅ Implement certificate generation
5. ✅ Add analytics and reporting

## 🐛 Common Issues

### Issue: Database connection error
**Solution**: Check PostgreSQL is running and credentials in `.env` are correct

### Issue: CORS errors from frontend
**Solution**: Add your frontend URL to `FRONTEND_ORIGINS` in `.env`

### Issue: JWT token expired
**Solution**: Use the refresh token endpoint to get a new access token

### Issue: Permission denied on endpoint
**Solution**: Check if endpoint requires authentication or admin privileges

## 📚 Resources

- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Improvements Guide**: [IMPROVEMENTS.md](IMPROVEMENTS.md)
- **Django REST Framework**: https://www.django-rest-framework.org/
- **JWT Authentication**: https://django-rest-framework-simplejwt.readthedocs.io/
- **Figma Design**: [Your Figma Link](https://www.figma.com/design/h8lxYcflZk8USQ4JRZVqm1/EVOLV)

## 💡 Tips

1. **Use Swagger UI** for testing: http://localhost:8000/api/docs/
2. **Check admin panel** for data management: http://localhost:8000/admin/
3. **Read API docs** before building frontend: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
4. **Follow the student journey** flow in README.md
5. **Review improvements** in IMPROVEMENTS.md for production readiness

## 🎉 You're Ready!

Your backend is fully functional and ready for frontend integration. Start building your frontend using the Figma design and API documentation.

Good luck! 🚀
