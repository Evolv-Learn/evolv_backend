# Evolv Learning Platform

A comprehensive learning management platform that enables public visitors to explore courses, register as students, and access learning materials including GitHub repositories, Discord community, and video content.

## 🎯 Project Overview

Evolv is an interactive learning website where:
- **Public visitors** can browse courses, events, alumni stories, and company information
- **Registered users** can apply to become students
- **Approved students** get access to exclusive learning materials (GitHub, Discord, videos)
- **Admins** manage courses, students, events, and content
- **Instructors** create and manage learning schedules

## 🏗️ Architecture

### Backend (Django REST Framework)
- **Framework**: Django 5.1.6 + Django REST Framework 3.15.2
- **Database**: PostgreSQL
- **Authentication**: JWT (Simple JWT)
- **API Documentation**: drf-spectacular (Swagger UI)
- **File Storage**: Local media files (configurable for S3)

### Frontend (Figma Design)
- **Design**: [View Figma File](https://www.figma.com/design/h8lxYcflZk8USQ4JRZVqm1/EVOLV?node-id=0-1&t=fbs6VqAHkN1oyph2-1)
- **Recommended Stack**: React/Next.js or Vue/Nuxt

## 📋 Features

### Public Features
- ✅ Browse courses by category (Data & AI, Cybersecurity, Microsoft Dynamics 365)
- ✅ View course details with timeline (Registration Deadline, Selection Date, Start/End Dates)
- ✅ View topics covered and tools/technologies for each course
- ✅ View upcoming events and workshops
- ✅ Read alumni success stories
- ✅ View team members and company values
- ✅ Submit contact form
- ✅ Read reviews and testimonials

### Authentication & Security
- ✅ User registration with email verification
- ✅ Email OR username login support
- ✅ JWT authentication
- ✅ Email verification system with HTML templates
- ✅ Resend verification email option
- ✅ Login protection for unverified users

### Student Features
- ✅ Submit student application with detailed information
- ✅ Multi-course enrollment (courses accumulate)
- ✅ Individual course status tracking (Pending, Under Review, Approved, Rejected)
- ✅ View personalized dashboard with course application status
- ✅ My Courses page with status badges
- ✅ My Profile page with application details
- ✅ Enroll in learning schedules
- ✅ Access learning materials (GitHub, Discord, videos) after approval
- ✅ View enrolled courses with timeline
- ✅ Register for events

### Admin Features
- ✅ Manage users and profiles
- ✅ Review and approve student applications
- ✅ Manage individual course enrollment status
- ✅ Create and manage courses (with subcourses)
- ✅ Add course timeline (Registration Deadline, Selection, Start, End dates)
- ✅ Add topics covered for each course
- ✅ Date validation (ensures chronological order)
- ✅ Create learning schedules with modules and lessons
- ✅ Manage events with image uploads
- ✅ Manage partners and locations
- ✅ View dashboard with statistics
- ✅ Manage team members and company content
- ✅ Manage course enrollments with status updates

### Instructor Features
- ✅ Create and manage learning schedules
- ✅ View assigned students
- ✅ Manage course modules and lessons

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL 12+
- pip or pipenv

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd evolv_backend
```

2. **Create virtual environment**
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

3. **Install dependencies**
```bash
cd evolv_backend
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
# Generate a new SECRET_KEY:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

5. **Set up PostgreSQL database**
```bash
# Create database and user
psql -U postgres
CREATE DATABASE evolv_db;
CREATE USER evolv_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE evolv_db TO evolv_user;
\q
```

6. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Run development server**
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

### Access Points
- **API Root**: http://localhost:8000/api/v1/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/docs/
- **API Schema**: http://localhost:8000/api/schema/

## 📚 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

Quick links:
- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Key Endpoints

#### Public
- `GET /api/v1/courses/` - List all courses
- `GET /api/v1/events/` - List all events
- `GET /api/v1/alumni/` - Alumni success stories
- `GET /api/v1/about-us/` - Company information
- `POST /api/v1/register/` - Register new user
- `POST /api/v1/auth/login/` - Login

#### Student (Authenticated)
- `GET /api/v1/profile/` - Get my profile
- `POST /api/v1/students/` - Submit application
- `GET /api/v1/students/me/` - My student profile
- `GET /api/v1/students/me/dashboard/` - My dashboard
- `GET /api/v1/students/me/application-status/` - Check status
- `POST /api/v1/students/me/enroll/{id}/` - Enroll in schedule
- `GET /api/v1/students/me/learning-materials/` - Access materials

#### Admin
- `GET /api/v1/admin/dashboard/` - Admin dashboard
- `GET /api/v1/admin/profiles/` - All user profiles
- `POST /api/v1/courses/` - Create course
- `POST /api/v1/events/` - Create event
- `POST /api/v1/student-selection/` - Manage applications

## 🗂️ Project Structure

```
evolv_backend/
├── evolv_backend/          # Main project directory
│   ├── settings.py         # Django settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI configuration
├── courses/               # Main app
│   ├── models.py          # Database models
│   ├── views.py           # API views
│   ├── views_extended.py  # Additional views (dashboard, etc.)
│   ├── serializers.py     # DRF serializers
│   ├── permissions.py     # Custom permissions
│   ├── urls.py            # App URL configuration
│   ├── utils.py           # Utility functions (email, etc.)
│   └── throttles.py       # Rate limiting
├── authentication/        # Auth app
│   ├── views.py           # Login views
│   └── urls.py            # Auth URLs
├── media/                 # Uploaded files
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment template
├── requirements.txt       # Python dependencies
└── manage.py             # Django management script
```

## 🔒 Security

### Current Implementation
- ✅ JWT authentication
- ✅ Password hashing
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Permission classes for endpoints

### Recommended Improvements
See [IMPROVEMENTS.md](IMPROVEMENTS.md) for detailed security recommendations including:
- Email verification
- Password reset functionality
- Rate limiting
- HTTPS enforcement
- Input validation

## 🧪 Testing

Run tests with:
```bash
python manage.py test
```

Run with coverage:
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 📊 Database Models

### Core Models
- **CustomUser**: Extended Django user model with email verification fields
- **Profile**: User profile with role (Student/Instructor/Alumni)
- **Student**: Detailed student application data
- **CourseEnrollment**: Individual course enrollment with status tracking (Pending, Under Review, Approved, Rejected)
- **Course**: Course information with hierarchy support, timeline fields, and topics covered
- **LearningSchedule**: Course schedules with dates and locations
- **Module**: Course modules within schedules
- **Lesson**: Individual lessons within modules
- **Event**: Events and workshops
- **Alumni**: Alumni success stories
- **Review**: Course and platform reviews

### Supporting Models
- **Location**: Campus and online locations
- **Partner**: Partner organizations
- **AboutUs**: Company information
- **TeamMember**: Team member profiles
- **CoreValue**: Company core values
- **SelectionProcedure**: Application steps
- **StudentSelection**: Student application progress
- **EventAttendance**: Event registration tracking
- **ContactUs**: Contact form submissions

## 🔄 Student Journey Flow

```
1. Public Visitor
   ↓ (Browse courses with timeline, events, alumni stories)
2. Register Account
   ↓ (Creates User + Profile with "Student" role)
3. Verify Email
   ↓ (Clicks verification link in email)
4. Login (Email or Username)
   ↓ (JWT authentication)
5. Submit Student Application
   ↓ (Creates Student record + CourseEnrollment with "Pending" status)
6. Admin Reviews Application
   ↓ (Updates CourseEnrollment status per course)
7. Course Approved
   ↓ (Student gets access to learning materials for that course)
8. Apply for Additional Courses
   ↓ (Courses accumulate, each with individual status)
9. Enroll in Schedule
   ↓ (Added to LearningSchedule.students)
10. Access Learning Materials
    ↓ (GitHub, Discord, Videos)
11. Complete Course
    ↓ (Becomes Alumni with success story)
```

## 🎨 Frontend Integration

### Recommended Pages

**Public Pages:**
- Home (hero, featured courses, testimonials)
- Courses (list with filters and search)
- Course Detail (description, schedule, apply button)
- Events (upcoming events calendar)
- About Us (mission, vision, team, values)
- Alumni Stories (success stories with filters)
- Contact Us (contact form)

**Auth Pages:**
- Login
- Register
- Password Reset
- Email Verification

**Student Dashboard:**
- Overview (course application status with individual statuses, enrolled courses)
- My Profile (view and update application details)
- My Courses (enrolled courses with status badges)
- Learning Materials (GitHub, Discord, videos - available when approved)
- My Events (registered events)
- Course Application Status (individual status per course)
- Available Courses (with timeline: Registration Deadline, Start Date)

**Admin Dashboard:**
- Overview (statistics)
- Applications (review and approve)
- Students (manage students)
- Course Enrollments (manage individual course status: Pending, Under Review, Approved, Rejected)
- Courses (CRUD operations with timeline and topics)
- Schedules (manage schedules)
- Events (manage events)
- Content (about, team, reviews)

### API Integration Example

```javascript
// Login
const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});
const { tokens } = await response.json();
localStorage.setItem('access_token', tokens.access);

// Get courses
const courses = await fetch('http://localhost:8000/api/v1/courses/', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
});

// Submit student application
const application = await fetch('http://localhost:8000/api/v1/students/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* student data */ })
});
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up HTTPS
- [ ] Configure production database
- [ ] Set up email backend (SMTP)
- [ ] Configure static/media file storage (S3, Cloudinary)
- [ ] Add monitoring (Sentry)
- [ ] Set up backups
- [ ] Configure firewall
- [ ] Set up CI/CD

### Deployment Options
- **Heroku**: Easy deployment with PostgreSQL addon
- **AWS**: EC2 + RDS + S3
- **DigitalOcean**: App Platform or Droplet
- **Railway**: Simple deployment with PostgreSQL
- **Render**: Free tier available

## 📈 Improvements & Roadmap

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for:
- Security enhancements
- Missing features
- Performance optimizations
- Code quality improvements
- Deployment recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Team

[Add team information]

## 📞 Contact

- Website: [Your website]
- Email: [Your email]
- GitHub: [Your GitHub]

---

**Note**: This is a development setup. For production deployment, follow the security and deployment guidelines in [IMPROVEMENTS.md](IMPROVEMENTS.md).