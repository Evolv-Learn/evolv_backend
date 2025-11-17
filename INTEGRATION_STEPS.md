# Integration Steps - Quick Reference

Follow these steps to integrate all the improvements into your existing code.

## ⚡ Quick Integration (15 minutes)

### Step 1: Update URLs (5 min)

**File**: `evolv_backend/courses/urls.py`

Add these imports at the top:
```python
from .views_extended import (
    StudentDashboardView,
    AdminDashboardView,
    StudentApplicationStatusView,
    EnrollScheduleView,
    LearningMaterialsView,
    my_courses,
    my_events,
)
```

Add these routes to `urlpatterns` (before the last line):
```python
    # New endpoints
      
```

### Step 2: Add Email Configuration (3 min)

**File**: `evolv_backend/evolv_backend/settings.py`

Add at the end of the file:
```python
# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@evolvlearn.com')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
```

### Step 3: Add Rate Limiting (3 min)

**File**: `evolv_backend/evolv_backend/settings.py`

Update the `REST_FRAMEWORK` dict:
```python
REST_FRAMEWORK = {
    # ... existing settings ...
    
    # Add these lines:
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

### Step 4: Add Email to Registration (2 min)

**File**: `evolv_backend/courses/views.py`

Add import at top:
```python
from .utils import send_welcome_email
```

Update `RegisterUserView.create()` method:
```python
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    # NEW: Send welcome email
    send_welcome_email(user)

    refresh = RefreshToken.for_user(user)
    # ... rest of the method
```

### Step 5: Add Throttling to Views (2 min)

**File**: `evolv_backend/courses/views.py`

Add import:
```python
from .throttles import RegisterRateThrottle, ContactUsRateThrottle
```

Add to classes:
```python
class RegisterUserView(generics.CreateAPIView):
    throttle_classes = [RegisterRateThrottle]  # ADD THIS LINE
    # ... rest of class

class ContactUsCreateView(generics.CreateAPIView):
    throttle_classes = [ContactUsRateThrottle]  # ADD THIS LINE
    # ... rest of class
```

**File**: `evolv_backend/authentication/views.py`

Add import:
```python
from courses.throttles import LoginRateThrottle
```

Add to class:
```python
class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]  # ADD THIS LINE
    # ... rest of class
```

---

## ✅ Verification

After integration, restart your server:
```bash
python manage.py runserver
```

Then run the test script:
```bash
python test_api.py
```

Or manually test in Swagger UI:
http://localhost:8000/api/docs/

---

## 📋 Integration Checklist

- [ ] Updated `courses/urls.py` with new endpoints
- [ ] Added email configuration to `settings.py`
- [ ] Added rate limiting to `settings.py`
- [ ] Added email notification to registration
- [ ] Added throttling to registration view
- [ ] Added throttling to login view
- [ ] Added throttling to contact form
- [ ] Restarted server
- [ ] Tested new endpoints in Swagger
- [ ] Ran `test_api.py` script
- [ ] All tests passing

---

## 🎯 What You Get After Integration

### 7 New API Endpoints:
1. `GET /api/v1/students/me/dashboard/` - Student dashboard with all info
2. `GET /api/v1/students/me/application-status/` - Check application status
3. `POST /api/v1/students/me/enroll/{id}/` - Enroll in schedule
4. `GET /api/v1/students/me/learning-materials/` - Access GitHub/Discord
5. `GET /api/v1/students/me/courses/` - My enrolled courses
6. `GET /api/v1/students/me/events/` - My registered events
7. `GET /api/v1/admin/dashboard/` - Admin statistics

### Email Notifications:
- Welcome email on registration
- Application received confirmation (ready to add)
- Status update emails (ready to add)

### Security:
- Rate limiting on registration (5/hour)
- Rate limiting on login (10/hour)
- Rate limiting on contact form (3/hour)

---

## 🚀 Next Steps

After successful integration:

1. **Test Everything**: Follow TESTING_GUIDE.md
2. **Create Sample Data**: Add courses, schedules, events in admin
3. **Test Student Journey**: Register → Apply → Approve → Enroll
4. **Start Frontend**: Use Figma design and API_DOCUMENTATION.md
5. **Deploy**: Follow deployment checklist in IMPROVEMENTS.md

---

## 💡 Tips

- **Backup First**: Commit your current code before integrating
- **Test Incrementally**: Integrate one step at a time
- **Check Logs**: Watch terminal for errors
- **Use Swagger**: Test endpoints in http://localhost:8000/api/docs/
- **Read Docs**: Check TESTING_GUIDE.md for detailed testing

---

## 🆘 Need Help?

If something doesn't work:

1. Check server logs for errors
2. Verify all imports are correct
3. Make sure files exist: `utils.py`, `throttles.py`, `views_extended.py`
4. Restart server after changes
5. Check TESTING_GUIDE.md for troubleshooting

---

**Estimated Time**: 15 minutes for integration + 30 minutes for testing = 45 minutes total

Good luck! 🚀
