# 📧 Email Verification - Complete Setup Guide

## ✅ What's Been Implemented:

### Backend:
1. ✅ Added email verification fields to CustomUser model
2. ✅ Created custom authentication backend (email OR username login)
3. ✅ Added verification email sending function
4. ✅ Created verification endpoints
5. ✅ Updated registration to send verification email

### Frontend:
1. ✅ Better error messages on login page
2. ✅ Email verification page (`/verify-email`)
3. ✅ Resend verification page (`/resend-verification`)
4. ✅ Check email page (`/check-email`)
5. ✅ Updated registration flow

---

## 🔧 Manual Steps Required:

### Step 1: Update Django Settings

Add these to `evolv_backend/evolv_backend/settings.py`:

```python
# Authentication Backends (add this anywhere in settings.py)
AUTHENTICATION_BACKENDS = [
    'courses.authentication.EmailOrUsernameBackend',  # Email OR username login
    'django.contrib.auth.backends.ModelBackend',      # Default fallback
]

# Frontend URL (add this with other URLs)
FRONTEND_URL = 'http://localhost:3000'  # Change in production

# Email Configuration (if not already configured)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'  # Your Gmail
EMAIL_HOST_PASSWORD = 'your-app-password'  # Gmail app password
DEFAULT_FROM_EMAIL = 'EvolvLearn <noreply@evolvlearn.com>'

# For development/testing, you can use console backend:
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### Step 2: Run Migrations

```bash
cd evolv_backend
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Restart Server

```bash
python manage.py runserver
```

---

## 🧪 Testing the Complete Flow:

### Test 1: Registration with Email Verification

```bash
# 1. Register new user
POST http://localhost:3000/register
{
  "username": "newuser",
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User"
}

# 2. User sees "Check Your Email" page
# 3. Check console/email for verification link
# 4. Click verification link
# 5. Redirected to login
# 6. Login successful ✅
```

### Test 2: Login with Email

```bash
POST http://localhost:3000/login
{
  "username": "test@example.com",  # Using email
  "password": "password123"
}
# ✅ Works!
```

### Test 3: Login with Username

```bash
POST http://localhost:3000/login
{
  "username": "newuser",  # Using username
  "password": "password123"
}
# ✅ Works!
```

### Test 4: Login Before Verification

```bash
# Try to login before verifying email
# ❌ Should show: "Please verify your email before logging in"
```

### Test 5: Resend Verification

```bash
# Go to /resend-verification
# Enter email
# New verification email sent ✅
```

---

## 📧 Email Configuration Options:

### Option 1: Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in settings.py

```python
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-16-char-app-password'
```

### Option 2: Console Backend (Development Only)

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Emails will print to console instead of sending.

### Option 3: SendGrid/Mailgun (Production)

Use a professional email service for production.

---

## 🎯 User Flow:

### New User Registration:
```
1. User fills registration form
   ↓
2. Submits form
   ↓
3. Backend creates user (is_email_verified=False)
   ↓
4. Sends verification email
   ↓
5. User sees "Check Your Email" page
   ↓
6. User clicks link in email
   ↓
7. Email verified (is_email_verified=True)
   ↓
8. Welcome email sent
   ↓
9. User can now login ✅
```

### Login Attempt (Unverified):
```
1. User tries to login
   ↓
2. Backend checks is_email_verified
   ↓
3. Returns error: "Please verify your email"
   ↓
4. Shows link to resend verification
   ↓
5. User verifies email
   ↓
6. Login successful ✅
```

---

## 🔐 Security Features:

- ✅ Token expires after 24 hours
- ✅ Token is single-use (deleted after verification)
- ✅ Secure random token generation
- ✅ Case-insensitive email matching
- ✅ Prevents login before verification

---

## 📝 Files Created/Modified:

### Backend:
- ✅ `courses/models.py` - Added verification fields
- ✅ `courses/authentication.py` - Email/username login
- ✅ `courses/utils.py` - Verification email function
- ✅ `courses/views.py` - Verification endpoints
- ✅ `courses/urls.py` - Verification routes

### Frontend:
- ✅ `app/verify-email/page.tsx` - Verification page
- ✅ `app/resend-verification/page.tsx` - Resend page
- ✅ `app/check-email/page.tsx` - Check email page
- ✅ `app/login/page.tsx` - Better error messages
- ✅ `app/register/page.tsx` - Updated flow

---

## ⚠️ Important Notes:

1. **Run migrations** before testing
2. **Configure email** in settings.py
3. **Use console backend** for testing (no real emails sent)
4. **Switch to Gmail/SendGrid** for production

---

## ✨ Benefits:

- ✅ Secure email verification
- ✅ Login with email OR username
- ✅ Clear error messages
- ✅ Professional email templates
- ✅ Resend verification option
- ✅ 24-hour token expiry
- ✅ Better user experience

---

**Complete email verification system is ready!** 🎉

**Next steps:**
1. Add settings to settings.py
2. Run migrations
3. Test the flow
