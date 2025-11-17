# Testing Guide - Evolv Learning Platform

## 🧪 How to Test All Improvements

This guide will walk you through testing all the improvements and new features.

## 📋 Prerequisites

Before testing, ensure:
- [ ] PostgreSQL is running
- [ ] Virtual environment is activated
- [ ] Dependencies are installed (`pip install -r requirements.txt`)
- [ ] Database migrations are applied (`python manage.py migrate`)
- [ ] Superuser is created (`python manage.py createsuperuser`)

## 🚀 Step 1: Test Existing API (Baseline)

### 1.1 Start the Server
```bash
cd evolv_backend
python manage.py runserver
```

### 1.2 Access Swagger UI
Open browser: http://localhost:8000/api/docs/

You should see all your existing endpoints documented.

### 1.3 Test Basic Endpoints
Try these in Swagger UI:
- ✅ GET `/api/v1/courses/` - Should return courses list
- ✅ GET `/api/v1/events/` - Should return events list
- ✅ GET `/api/v1/about-us/` - Should return about us info
- ✅ POST `/api/v1/register/` - Register a new user
- ✅ POST `/api/v1/auth/login/` - Login with credentials

**Expected Result**: All existing endpoints work as before ✅

---

## 🔧 Step 2: Integrate New Endpoints

The new endpoints are in `evolv_backend/courses/views_extended.py` but not yet connected to URLs.

### 2.1 Update URLs Configuration

Open `evolv_backend/courses/urls.py` and add the new imports and routes:

```python
# Add these imports at the top
from .views_extended import (
    StudentDashboardView,
    AdminDashboardView,
    StudentApplicationStatusView,
    EnrollScheduleView,
    LearningMaterialsView,
    my_courses,
    my_events,
)

# Add these routes to urlpatterns (before the last line)
urlpatterns = [
    # ... existing patterns ...
    
    # NEW ENDPOINTS - Add these
    path("students/me/dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("students/me/application-status/", StudentApplicationStatusView.as_view(), name="application-status"),
    path("students/me/enroll/<int:schedule_id>/", EnrollScheduleView.as_view(), name="enroll-schedule"),
    path("students/me/learning-materials/", LearningMaterialsView.as_view(), name="learning-materials"),
    path("students/me/courses/", my_courses, name="my-courses"),
    path("students/me/events/", my_events, name="my-events"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
]
```

### 2.2 Restart Server
```bash
# Stop server (Ctrl+C)
python manage.py runserver
```

### 2.3 Test New Endpoints

**Test 1: Student Dashboard (Requires Auth)**
```bash
# First, login to get token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Copy the access token, then:
curl http://localhost:8000/api/v1/students/me/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Result**: 
- If no student profile: `{"detail": "Student profile not found..."}`
- If student exists: Dashboard data with profile, status, schedules, etc.

**Test 2: Admin Dashboard (Requires Admin)**
```bash
curl http://localhost:8000/api/v1/admin/dashboard/ \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Expected Result**: Statistics about students, courses, events, etc.

---

## 📧 Step 3: Test Email Notifications

### 3.1 Configure Email Backend

For testing, use console backend (emails print to terminal):

In `evolv_backend/evolv_backend/settings.py`, add:
```python
# Email Configuration (add at the end)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@evolvlearn.com'
```

### 3.2 Integrate Email Functions

Open `evolv_backend/courses/views.py` and update the `RegisterUserView`:

```python
# Add import at top
from .utils import send_welcome_email

# Update the create method in RegisterUserView
class RegisterUserView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # NEW: Send welcome email
        send_welcome_email(user)

        refresh = RefreshToken.for_user(user)
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }
        return Response(data, status=status.HTTP_201_CREATED)
```

### 3.3 Test Email Sending

```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Result**: Check your terminal where Django is running. You should see the email content printed:

```
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: Welcome to EvolvLearn!
From: noreply@evolvlearn.com
To: test2@example.com

Hi Test,

Welcome to EvolvLearn! We're excited to have you join our learning community.
...
```

---

## 🛡️ Step 4: Test Rate Limiting

### 4.1 Add Rate Limiting to Settings

In `evolv_backend/evolv_backend/settings.py`, update REST_FRAMEWORK:

```python
REST_FRAMEWORK = {
    # ... existing settings ...
    
    # Add these:
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'register': '5/hour',
        'login': '10/hour',
        'contact': '3/hour',
    }
}
```

### 4.2 Apply Throttling to Views

In `evolv_backend/courses/views.py`:

```python
# Add import
from .throttles import RegisterRateThrottle, ContactUsRateThrottle

# Update RegisterUserView
class RegisterUserView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterUserSerializer
    throttle_classes = [RegisterRateThrottle]  # ADD THIS
    # ... rest of the class

# Update ContactUsCreateView
class ContactUsCreateView(generics.CreateAPIView):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ContactUsRateThrottle]  # ADD THIS
```

In `evolv_backend/authentication/views.py`:

```python
# Add import
from courses.throttles import LoginRateThrottle

# Update CustomTokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]  # ADD THIS
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return Response({"message": "Login successful!", "tokens": response.data}, status=status.HTTP_200_OK)
```

### 4.3 Test Rate Limiting

```bash
# Try registering 6 times quickly (limit is 5/hour)
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/v1/register/ \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\",\"email\":\"user$i@test.com\",\"password\":\"Pass123!\"}"
  echo "\n---Request $i---\n"
done
```

**Expected Result**: 
- First 5 requests: Success or validation errors
- 6th request: `{"detail": "Request was throttled. Expected available in X seconds."}`

---

## 📊 Step 5: Test Complete Student Journey

### 5.1 Create Test Data in Admin

1. Go to http://localhost:8000/admin/
2. Login with superuser credentials
3. Create:
   - **Location**: "Lagos Campus" (Campus, Nigeria, Lagos)
   - **Partner**: "Microsoft" 
   - **Course**: "Data Science 101" (Data & AI category)
   - **Learning Schedule**: For the course above
   - **Selection Procedure**: "Application Review" (order: 1)

### 5.2 Test Student Registration & Application

```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@test.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Save the access token from response

# 2. Submit Student Application
curl -X POST http://localhost:8000/api/v1/students/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "phone": "+2348012345678",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "Male",
    "birth_date": "1995-05-15",
    "zip_code": "100001",
    "country_of_birth": "NG",
    "nationality": "NG",
    "diploma_level": "Bachelor",
    "job_status": "Student",
    "motivation": "I want to learn data science",
    "future_goals": "Become a data scientist",
    "proudest_moment": "Graduated university",
    "english_level": 4,
    "how_heard": "Social Media",
    "has_laptop": true,
    "courses": [1],
    "schedules": []
  }'

# 3. Check Application Status
curl http://localhost:8000/api/v1/students/me/application-status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Check Dashboard
curl http://localhost:8000/api/v1/students/me/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Try to Access Learning Materials (should be denied)
curl http://localhost:8000/api/v1/students/me/learning-materials/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Results**:
- Application submitted successfully
- Status shows "submitted" or "pending"
- Dashboard shows application info
- Learning materials access denied (not approved yet)

### 5.3 Approve Student (Admin Action)

1. Go to admin panel: http://localhost:8000/admin/
2. Find the student in "Students"
3. Go to "Student selections"
4. Create new StudentSelection:
   - Student: Select the student
   - Step: Select "Application Review"
   - Status: "Completed"
5. Save

### 5.4 Test Approved Student Access

```bash
# 1. Check Status Again
curl http://localhost:8000/api/v1/students/me/application-status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 2. Access Learning Materials (should work now)
curl http://localhost:8000/api/v1/students/me/learning-materials/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Enroll in Schedule
curl -X POST http://localhost:8000/api/v1/students/me/enroll/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Check Dashboard Again
curl http://localhost:8000/api/v1/students/me/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Results**:
- Status shows "approved"
- Learning materials accessible (GitHub, Discord links)
- Successfully enrolled in schedule
- Dashboard shows enrolled schedule

---

## 🎯 Step 6: Test Admin Dashboard

```bash
# Login as admin
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin_password"}'

# Get admin dashboard
curl http://localhost:8000/api/v1/admin/dashboard/ \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Expected Result**: JSON with statistics:
```json
{
  "students": {
    "total": 1,
    "pending_applications": 0,
    "approved": 1
  },
  "courses": {
    "active": 1,
    "subcourses": 0,
    "total": 1
  },
  ...
}
```

---

## ✅ Testing Checklist

Use this checklist to track your testing:

### Existing Features
- [ ] Server starts without errors
- [ ] Swagger UI loads at `/api/docs/`
- [ ] Can register new user
- [ ] Can login and get JWT tokens
- [ ] Can view courses (public)
- [ ] Can view events (public)
- [ ] Can view about us (public)

### New Endpoints
- [ ] Student dashboard endpoint works
- [ ] Admin dashboard endpoint works
- [ ] Application status endpoint works
- [ ] Learning materials endpoint works
- [ ] Enrollment endpoint works
- [ ] My courses endpoint works
- [ ] My events endpoint works

### Email Notifications
- [ ] Welcome email sent on registration
- [ ] Email appears in console/terminal
- [ ] Email contains correct user info

### Rate Limiting
- [ ] Registration throttled after 5 attempts
- [ ] Login throttled after 10 attempts
- [ ] Contact form throttled after 3 attempts
- [ ] Throttle error message is clear

### Student Journey
- [ ] Can register account
- [ ] Can submit application
- [ ] Application status shows "pending"
- [ ] Learning materials denied before approval
- [ ] Admin can approve application
- [ ] Status changes to "approved" after approval
- [ ] Learning materials accessible after approval
- [ ] Can enroll in schedule
- [ ] Dashboard shows correct info

### Admin Features
- [ ] Admin dashboard shows statistics
- [ ] Can view all students
- [ ] Can approve applications
- [ ] Can manage courses
- [ ] Can manage events

---

## 🐛 Common Issues & Solutions

### Issue: Import Error for views_extended
**Solution**: Make sure you added the imports correctly in `urls.py`

### Issue: Email not showing in console
**Solution**: Check that `EMAIL_BACKEND` is set to console backend in settings

### Issue: Rate limiting not working
**Solution**: Restart the server after adding throttle settings

### Issue: 404 on new endpoints
**Solution**: Make sure you added the URL patterns and restarted server

### Issue: "Student profile not found"
**Solution**: Submit a student application first via POST `/api/v1/students/`

### Issue: Learning materials access denied
**Solution**: Create StudentSelection with "Completed" status in admin panel

---

## 📝 Next Steps After Testing

Once all tests pass:

1. ✅ Document any bugs found
2. ✅ Update `.env` with production settings
3. ✅ Write automated tests (unit & integration)
4. ✅ Start frontend development
5. ✅ Deploy to staging environment

---

## 🎉 Success Criteria

Your testing is successful when:
- ✅ All existing endpoints still work
- ✅ All 7 new endpoints are accessible
- ✅ Email notifications appear in console
- ✅ Rate limiting prevents abuse
- ✅ Complete student journey works end-to-end
- ✅ Admin dashboard shows correct statistics
- ✅ No errors in server logs

**Congratulations!** Your improvements are working correctly! 🚀
