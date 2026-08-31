# System Architecture - EvolvLearn Learning Platform

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public Pages │  │   Student    │  │    Admin     │      │
│  │              │  │  Dashboard   │  │  Dashboard   │      │
│  │ - Home       │  │              │  │              │      │
│  │ - Courses    │  │ - Profile    │  │ - Analytics  │      │
│  │ - Events     │  │ - Courses    │  │ - Students   │      │
│  │ - About      │  │ - Materials  │  │ - Courses    │      │
│  │ - Alumni     │  │ - Status     │  │ - Events     │      │
│  │ - Contact    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│                    React/Vue + Tailwind CSS                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Django REST Framework                    │   │
│  │                                                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Public   │  │  Student   │  │   Admin    │     │   │
│  │  │  Endpoints │  │ Endpoints  │  │ Endpoints  │     │   │
│  │  │            │  │            │  │            │     │   │
│  │  │ - Courses  │  │ - Profile  │  │ - Manage   │     │   │
│  │  │ - Events   │  │ - Apply    │  │ - Approve  │     │   │
│  │  │ - Alumni   │  │ - Enroll   │  │ - Create   │     │   │
│  │  │ - Reviews  │  │ - Materials│  │ - Update   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         Authentication & Permissions           │  │   │
│  │  │  - JWT Tokens                                  │  │   │
│  │  │  - Role-based Access (Student/Instructor/Admin)│  │   │
│  │  │  - Rate Limiting                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │              Business Logic                    │  │   │
│  │  │  - Serializers (Validation)                    │  │   │
│  │  │  - Views (Request Handling)                    │  │   │
│  │  │  - Models (Data Structure)                     │  │   │
│  │  │  - Permissions (Access Control)                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Services                             │   │
│  │  - Email Notifications                                │   │
│  │  - File Upload (Images)                               │   │
│  │  - Registration Number Generation                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
│                   PostgreSQL                                 │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Courses    │  │    Events    │      │
│  │  - CustomUser│  │  - Course    │  │  - Event     │      │
│  │  - Profile   │  │  - Schedule  │  │  - Attendance│      │
│  │  - Student   │  │  - Module    │  │              │      │
│  │  - Alumni    │  │  - Lesson    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Selection   │  │   Content    │  │  Resources   │      │
│  │  - Procedure │  │  - AboutUs   │  │  - Location  │      │
│  │  - Selection │  │  - TeamMember│  │  - Partner   │      │
│  │              │  │  - CoreValue │  │              │      │
│  │              │  │  - Review    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Email     │  │  File Storage│  │   Learning   │      │
│  │   Service    │  │     (S3)     │  │  Platforms   │      │
│  │              │  │              │  │              │      │
│  │ - SMTP       │  │ - Images     │  │ - GitHub     │      │
│  │ - SendGrid   │  │ - Documents  │  │ - Discord    │      │
│  │ - Mailgun    │  │              │  │ - YouTube    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Student Journey Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT JOURNEY                           │
└─────────────────────────────────────────────────────────────┘

1. DISCOVERY (Public)
   │
   ├─► Browse Website
   │   ├─ View Courses
   │   ├─ Read Alumni Stories
   │   ├─ Check Events
   │   └─ Learn About Company
   │
   ▼

2. REGISTRATION
   │
   ├─► Create Account
   │   ├─ POST /api/v1/register/
   │   ├─ Receive Welcome Email
   │   └─ Get JWT Tokens
   │
   ▼

3. APPLICATION
   │
   ├─► Submit Student Application
   │   ├─ POST /api/v1/students/
   │   ├─ Fill Detailed Form
   │   ├─ Select Courses
   │   └─ Receive Confirmation Email
   │
   ▼

4. REVIEW (Admin)
   │
   ├─► Admin Reviews Application
   │   ├─ View in Admin Panel
   │   ├─ Check Qualifications
   │   ├─ Update Selection Steps
   │   └─ Approve/Reject
   │
   ▼

5. APPROVAL
   │
   ├─► Application Approved
   │   ├─ StudentSelection Status: Completed
   │   ├─ Receive Approval Email
   │   └─ Access Granted to Materials
   │
   ▼

6. ENROLLMENT
   │
   ├─► Enroll in Schedule
   │   ├─ POST /api/v1/students/me/enroll/{id}/
   │   ├─ Choose Learning Schedule
   │   ├─ View Modules & Lessons
   │   └─ Receive Enrollment Confirmation
   │
   ▼

7. LEARNING
   │
   ├─► Access Learning Materials
   │   ├─ GET /api/v1/students/me/learning-materials/
   │   ├─ GitHub Repository
   │   ├─ Discord Community
   │   ├─ Video Tutorials
   │   └─ Documentation
   │
   ▼

8. ENGAGEMENT
   │
   ├─► Participate in Events
   │   ├─ Register for Events
   │   ├─ Attend Workshops
   │   └─ Network with Peers
   │
   ▼

9. COMPLETION
   │
   ├─► Complete Course
   │   ├─ Finish All Modules
   │   ├─ Submit Projects
   │   └─ Receive Certificate (future)
   │
   ▼

10. ALUMNI
    │
    └─► Become Alumni
        ├─ Create Alumni Profile
        ├─ Share Success Story
        ├─ Mentor New Students
        └─ Stay Connected
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

REGISTRATION:
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────►│   API    │─────►│ Database │
│          │      │          │      │          │
│ Username │      │ Validate │      │  Create  │
│ Email    │      │ Hash Pwd │      │  User    │
│ Password │      │ Create   │      │  Profile │
│          │◄─────│ Profile  │◄─────│          │
│          │      │          │      │          │
│ Tokens   │      │ Generate │      │          │
│ Returned │      │ JWT      │      │          │
└──────────┘      └──────────┘      └──────────┘

LOGIN:
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────►│   API    │─────►│ Database │
│          │      │          │      │          │
│ Username │      │ Verify   │      │  Check   │
│ Password │      │ Password │      │  User    │
│          │◄─────│          │◄─────│          │
│          │      │ Generate │      │          │
│ Access   │      │ JWT      │      │          │
│ Refresh  │      │ Tokens   │      │          │
└──────────┘      └──────────┘      └──────────┘

AUTHENTICATED REQUEST:
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────►│   API    │─────►│ Database │
│          │      │          │      │          │
│ Bearer   │      │ Verify   │      │  Query   │
│ Token    │      │ JWT      │      │  Data    │
│          │      │ Check    │      │          │
│          │◄─────│ Perms    │◄─────│          │
│          │      │          │      │          │
│ Response │      │ Return   │      │          │
│ Data     │      │ Data     │      │          │
└──────────┘      └──────────┘      └──────────┘

TOKEN REFRESH:
┌──────────┐      ┌──────────┐
│  Client  │─────►│   API    │
│          │      │          │
│ Refresh  │      │ Verify   │
│ Token    │      │ Refresh  │
│          │◄─────│ Token    │
│          │      │          │
│ New      │      │ Generate │
│ Access   │      │ New      │
│ Token    │      │ Access   │
└──────────┘      └──────────┘
```

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────┘

USERS & PROFILES:
┌──────────────┐
│ CustomUser   │
├──────────────┤
│ id           │
│ username     │
│ email        │
│ password     │
│ first_name   │
│ last_name    │
└──────┬───────┘
       │ 1:1
       ▼
┌──────────────┐
│ Profile      │
├──────────────┤
│ id           │
│ user_id      │◄─────┐
│ role         │      │
└──────┬───────┘      │
       │              │
       │ 1:1          │
       ▼              │
┌──────────────┐      │
│ Student      │      │
├──────────────┤      │
│ id           │      │
│ user_id      │──────┘
│ email        │
│ phone        │
│ first_name   │
│ last_name    │
│ gender       │
│ birth_date   │
│ ...          │
└──────┬───────┘
       │ M:M
       ▼
┌──────────────┐
│ Course       │
├──────────────┤
│ id           │
│ name         │
│ category     │
│ description  │
│ parent_id    │◄─┐ Self-referencing
└──────┬───────┘  │ (Subcourses)
       │          │
       └──────────┘

LEARNING STRUCTURE:
┌──────────────┐
│ Course       │
└──────┬───────┘
       │ 1:M
       ▼
┌──────────────┐
│ Learning     │
│ Schedule     │
├──────────────┤
│ id           │
│ course_id    │
│ start_date   │
│ end_date     │
│ location_id  │
│ instructor_id│
└──────┬───────┘
       │ 1:M
       ▼
┌──────────────┐
│ Module       │
├──────────────┤
│ id           │
│ schedule_id  │
│ title        │
│ order        │
└──────┬───────┘
       │ 1:M
       ▼
┌──────────────┐
│ Lesson       │
├──────────────┤
│ id           │
│ module_id    │
│ title        │
│ content      │
│ order        │
└──────────────┘

SELECTION PROCESS:
┌──────────────┐
│ Student      │
└──────┬───────┘
       │ 1:M
       ▼
┌──────────────┐      ┌──────────────┐
│ Student      │  M:1 │ Selection    │
│ Selection    │─────►│ Procedure    │
├──────────────┤      ├──────────────┤
│ id           │      │ id           │
│ student_id   │      │ step_name    │
│ step_id      │      │ description  │
│ status       │      │ order        │
└──────────────┘      └──────────────┘

EVENTS:
┌──────────────┐
│ Event        │
├──────────────┤
│ id           │
│ title        │
│ date         │
│ location_id  │
│ is_virtual   │
└──────┬───────┘
       │ 1:M
       ▼
┌──────────────┐
│ Event        │
│ Attendance   │
├──────────────┤
│ id           │
│ event_id     │
│ student_id   │
│ attended     │
└──────────────┘

CONTENT:
┌──────────────┐
│ AboutUs      │
├──────────────┤
│ id           │
│ title        │
│ description  │
│ mission      │
│ vision       │
└──────┬───────┘
       │ 1:M
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────────┐ ┌──────────────┐
│ TeamMember   │ │ CoreValue    │
├──────────────┤ ├──────────────┤
│ id           │ │ id           │
│ about_us_id  │ │ about_us_id  │
│ name         │ │ title        │
│ role         │ │ description  │
└──────────────┘ └──────────────┘
```

## 🔌 API Endpoints Structure

```
/api/v1/
│
├── auth/
│   ├── login/              POST   (Public)
│   ├── refresh/            POST   (Public)
│   └── token/              POST   (Public)
│
├── register/               POST   (Public)
│
├── profile/                GET    (Auth)
│                           PATCH  (Auth)
│
├── courses/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── events/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── students/
│   ├── /                   GET    (Admin)
│   │                       POST   (Auth)
│   ├── /{id}/              GET    (Admin)
│   │                       PUT    (Admin)
│   │                       PATCH  (Admin)
│   │                       DELETE (Admin)
│   └── me/
│       ├── /               GET    (Auth)
│       │                   PATCH  (Auth)
│       ├── dashboard/      GET    (Auth)
│       ├── application-status/ GET (Auth)
│       ├── enroll/{id}/    POST   (Auth)
│       ├── learning-materials/ GET (Auth)
│       ├── courses/        GET    (Auth)
│       └── events/         GET    (Auth)
│
├── alumni/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── about-us/               GET    (Public)
│                           PATCH  (Admin)
│
├── team-members/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── reviews/
│   ├── /                   GET    (Public)
│   │                       POST   (Public)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── schedules/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin/Instructor)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin/Instructor)
│                           PATCH  (Admin/Instructor)
│                           DELETE (Admin/Instructor)
│
├── modules/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── lessons/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── locations/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── partners/
│   ├── /                   GET    (Public)
│   │                       POST   (Admin)
│   └── /{id}/              GET    (Public)
│                           PUT    (Admin)
│                           PATCH  (Admin)
│                           DELETE (Admin)
│
├── contact-us/             POST   (Public)
│
└── admin/
    ├── dashboard/          GET    (Admin)
    └── profiles/
        ├── /               GET    (Admin)
        └── /{user_id}/profile/ GET (Admin)
                            PATCH  (Admin)
                            DELETE (Admin)
```

## 🔒 Permission Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSION MATRIX                         │
└─────────────────────────────────────────────────────────────┘

Resource          │ Public │ Student │ Instructor │ Admin
──────────────────┼────────┼─────────┼────────────┼───────
Courses (Read)    │   ✓    │    ✓    │     ✓      │   ✓
Courses (Write)   │   ✗    │    ✗    │     ✗      │   ✓
Events (Read)     │   ✓    │    ✓    │     ✓      │   ✓
Events (Write)    │   ✗    │    ✗    │     ✗      │   ✓
Alumni (Read)     │   ✓    │    ✓    │     ✓      │   ✓
Alumni (Write)    │   ✗    │    ✗    │     ✗      │   ✓
Reviews (Read)    │   ✓    │    ✓    │     ✓      │   ✓
Reviews (Create)  │   ✓    │    ✓    │     ✓      │   ✓
Reviews (Modify)  │   ✗    │    ✗    │     ✗      │   ✓
About Us (Read)   │   ✓    │    ✓    │     ✓      │   ✓
About Us (Write)  │   ✗    │    ✗    │     ✗      │   ✓
Contact Form      │   ✓    │    ✓    │     ✓      │   ✓
Registration      │   ✓    │    ✗    │     ✗      │   ✗
Student Apply     │   ✗    │    ✓    │     ✗      │   ✗
Student Dashboard │   ✗    │    ✓    │     ✗      │   ✓
Learning Materials│   ✗    │  ✓ (*)  │     ✗      │   ✓
Schedules (Read)  │   ✓    │    ✓    │     ✓      │   ✓
Schedules (Write) │   ✗    │    ✗    │   ✓ (**)   │   ✓
Admin Dashboard   │   ✗    │    ✗    │     ✗      │   ✓
User Management   │   ✗    │    ✗    │     ✗      │   ✓

(*) Only if application approved
(**) Only for own schedules
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION DEPLOYMENT                       │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Users      │
                    │  (Browser)   │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
                    ┌──────────────┐
                    │     CDN      │
                    │  (Cloudflare)│
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌──────────────┐         ┌──────────────┐
       │   Frontend   │         │   Backend    │
       │   (Vercel/   │         │  (Railway/   │
       │   Netlify)   │         │   Heroku)    │
       └──────────────┘         └──────┬───────┘
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
                 ┌──────────┐   ┌──────────┐  ┌──────────┐
                 │PostgreSQL│   │   S3/    │  │  Email   │
                 │    DB    │   │Cloudinary│  │ Service  │
                 └──────────┘   └──────────┘  └──────────┘
```

---

This architecture provides a scalable, secure, and maintainable foundation for your learning platform. Each component is designed to be independent and can be scaled or replaced as needed.
