# Login Issue - Debug Guide

## 🔍 Issue: Dashboard Not Showing After Login

### Quick Fix Applied:
I've updated the login page to handle different response structures and added better error handling.

---

## 🧪 Test the Fix

### Step 1: Clear Browser Storage
Open browser console (F12) and run:
```javascript
localStorage.clear()
```

### Step 2: Try Login Again
1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click Login

### Step 3: Check Console
Open browser console (F12) and look for:
- Any error messages
- "Login error:" messages
- "Profile fetch error:" messages

---

## 🔍 Debug Steps

### Check 1: Verify Backend is Running
```bash
# In terminal
curl http://localhost:8000/api/v1/auth/login/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

**Expected Response:**
```json
{
  "message": "Login successful!",
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

### Check 2: Verify Profile Endpoint
```bash
# Replace YOUR_TOKEN with the access token from above
curl http://localhost:8000/api/v1/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "role": "Student",
  "username": "your_username",
  "first_name": "Your",
  "last_name": "Name",
  "email": "your@email.com"
}
```

### Check 3: Test in Browser Console
After login attempt, check browser console (F12):

```javascript
// Check if tokens are stored
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));

// Check auth state
console.log('Auth State:', JSON.parse(localStorage.getItem('auth-storage') || '{}'));
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Login failed" Error
**Cause**: Wrong credentials or backend not running

**Solution**:
1. Check backend is running: http://localhost:8000/admin/
2. Verify username/password are correct
3. Check backend terminal for errors

### Issue 2: Login Success but No Redirect
**Cause**: Profile fetch failing

**Solution**:
1. Check browser console for errors
2. Verify profile endpoint works (see Check 2 above)
3. The updated code should handle this now

### Issue 3: Redirect to Login Immediately
**Cause**: Token not being stored or auth state not updating

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Try login again
3. Check if tokens are stored (see Check 3 above)

### Issue 4: CORS Error
**Cause**: Backend not allowing frontend origin

**Solution**:
Update `evolv_backend/.env`:
```env
FRONTEND_ORIGINS=http://localhost:3000
```

Then restart backend:
```bash
python manage.py runserver
```

---

## 🔧 Manual Test

### Test Login Flow Manually:

1. **Open Browser Console** (F12)

2. **Clear Storage**:
```javascript
localStorage.clear()
```

3. **Go to Login Page**:
http://localhost:3000/login

4. **Enter Credentials and Submit**

5. **Watch Console for Messages**:
- Should see network requests
- Should see tokens being stored
- Should redirect to /dashboard

6. **If Redirect Fails, Check**:
```javascript
// In console
console.log('Current URL:', window.location.href);
console.log('Tokens:', {
  access: localStorage.getItem('access_token'),
  refresh: localStorage.getItem('refresh_token')
});
console.log('User:', JSON.parse(localStorage.getItem('auth-storage') || '{}'));
```

---

## 🎯 Expected Behavior

### Successful Login Flow:
1. ✅ User enters credentials
2. ✅ Click "Login" button
3. ✅ Loading spinner shows
4. ✅ Backend validates credentials
5. ✅ Tokens stored in localStorage
6. ✅ Profile fetched from backend
7. ✅ User data stored in Zustand
8. ✅ Redirect to /dashboard
9. ✅ Dashboard shows with user's name

### What You Should See:
- **URL changes** to: http://localhost:3000/dashboard
- **Welcome message**: "Welcome back, [Your Name]!"
- **Stats cards** showing
- **Quick actions** sidebar
- **Header** shows "Dashboard" and "Logout" buttons

---

## 🚨 If Still Not Working

### Option 1: Use Test Account
Create a fresh test account:

1. Go to http://localhost:3000/register
2. Register with:
   - Username: testuser123
   - Email: test123@example.com
   - Password: TestPass123!
3. Should auto-redirect to dashboard

### Option 2: Check Backend Logs
Look at your Django terminal for errors:
- Authentication errors
- CORS errors
- Database errors

### Option 3: Simplify Login (Temporary)
If you want to test dashboard without login, temporarily disable auth check:

In `evolv_frontend/src/app/dashboard/page.tsx`, comment out the redirect:
```typescript
// useEffect(() => {
//   if (!isAuthenticated) {
//     router.push('/login');
//   } else {
//     setIsLoading(false);
//   }
// }, [isAuthenticated, router]);
```

Then manually go to: http://localhost:3000/dashboard

---

## 📝 What I Changed

### In `login/page.tsx`:
1. ✅ Added better error handling
2. ✅ Added console.log for debugging
3. ✅ Handle different profile response structures
4. ✅ Fallback if profile fetch fails
5. ✅ More detailed error messages

### In `register/page.tsx`:
1. ✅ Added success alert
2. ✅ Added console.log for debugging
3. ✅ Better error handling

---

## 🎯 Next Steps

1. **Try logging in again** with the fixes
2. **Check browser console** for any errors
3. **Let me know** what you see:
   - Does it redirect?
   - Any error messages?
   - What does console show?

---

## 💡 Quick Test Command

Run this in browser console after login attempt:
```javascript
console.log('=== LOGIN DEBUG ===');
console.log('Access Token:', localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING');
console.log('Refresh Token:', localStorage.getItem('refresh_token') ? 'EXISTS' : 'MISSING');
console.log('Auth State:', localStorage.getItem('auth-storage'));
console.log('Current URL:', window.location.href);
console.log('==================');
```

Send me the output and I can help further! 🚀
