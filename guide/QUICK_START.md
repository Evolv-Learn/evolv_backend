# 🚀 Quick Start Guide

## For Team Members - Get Running in 5 Minutes!

### Step 1: Get the Code
```bash
# If using Git
git clone [repository-url]
cd evolvlearn

# If using zip file
# Extract the zip and open terminal in the folder
```

### Step 2: Start Backend (Terminal 1)
```bash
# From project root
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd evolv_backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
✅ Backend running at: http://localhost:8000

### Step 3: Start Frontend (Terminal 2)
```bash
cd evolv_frontend
npm install
npm run dev
```
✅ Frontend running at: http://localhost:3000

### Step 4: Test It!
Open browser: http://localhost:3000

---

## 🎯 What to Test

1. **Homepage** - Check the hero section and navigation
2. **Dropdowns** - Hover over "Companies" and "About Us"
3. **Register** - Create a new account
4. **Login** - Sign in with your account
5. **Browse** - Check Courses, Events, Company pages

---

## ⚠️ Common Issues

**"Port already in use"**
- Backend: Use `python manage.py runserver 8001`
- Frontend: Next.js will auto-suggest port 3001

**"Module not found"**
- Backend: Make sure venv is activated
- Frontend: Delete `node_modules` and run `npm install` again

**"Can't connect to API"**
- Make sure backend is running first
- Check http://localhost:8000/api in browser

---

## 📧 Need Help?
Check DEPLOYMENT_GUIDE.md for detailed instructions!
